/**
 * Capture chapter-2 UI screenshots (Authenticator sign-in → Todo list).
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

async function main() {
    const browser = await chromium.launch({ headless: true });

    for (const user of USERS) {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 800 },
        });
        const page = await context.newPage();
        await signIn(page, user.email);
        await page.getByText(user.todoLabel).waitFor({ timeout: 15_000 });
        const path = resolve(outDir, user.file);
        await page.screenshot({ path, fullPage: true });
        console.log(`Saved ${path}`);
        await context.close();
    }

    await browser.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
