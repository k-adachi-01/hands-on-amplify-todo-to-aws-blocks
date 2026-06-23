/**
 * Capture chapter-2 UI screenshots (Authenticator sign-in → simple Todo list).
 * Expects chapter-2 code (input + Add, no Sort/toggle/delete) on localhost:3000.
 *
 * Run: npx tsx scripts/capture-chapter2-screenshots.ts
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(
    root,
    'docs/chapters/03-chapter2-cognito-auth/screenshots',
);
mkdirSync(outDir, { recursive: true });

const PASS = process.env.CHAPTER2_TEST_PASSWORD ?? 'TestPass1!';
const USERS = [
    {
        email: process.env.CHAPTER2_USER_A ?? 'user-a@example.com',
        file: '02-user-a-todos.png',
        todoLabel: 'A のタスク',
    },
    {
        email: process.env.CHAPTER2_USER_B ?? 'user-b@example.com',
        file: '03-user-b-todos.png',
        todoLabel: 'B のタスク',
    },
] as const;

async function signIn(page: import('playwright').Page, email: string) {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.locator('input[name="username"]').fill(email);
    await page.locator('input[name="password"]').fill(PASS);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.getByRole('heading', { name: /My todos/i }).waitFor({
        timeout: 30_000,
    });
}

async function addTodo(page: import('playwright').Page, label: string) {
    const input = page.getByPlaceholder('New todo');
    await input.fill(label);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByText(label).waitFor({ timeout: 15_000 });
}

async function signOut(page: import('playwright').Page) {
    const signOut = page.getByRole('button', { name: /sign out/i });
    if (await signOut.isVisible().catch(() => false)) {
        await signOut.click();
        await page.locator('input[name="username"]').waitFor({ timeout: 15_000 });
    }
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.screenshot({
        path: resolve(outDir, '01-authenticator-signin.png'),
        fullPage: true,
    });
    console.log(`Saved ${resolve(outDir, '01-authenticator-signin.png')}`);

    for (const user of USERS) {
        await signIn(page, user.email);
        await addTodo(page, user.todoLabel);
        const path = resolve(outDir, user.file);
        await page.screenshot({ path, fullPage: true });
        console.log(`Saved ${path}`);
        await signOut(page);
    }

    await browser.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
