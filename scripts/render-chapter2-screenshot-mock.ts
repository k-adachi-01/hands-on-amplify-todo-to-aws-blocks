/**
 * Render chapter-2 UI screenshots (simple list, no Sort/toggle/delete).
 * Use when live capture against Sandbox is unavailable.
 *
 * Run: npx tsx scripts/render-chapter2-screenshot-mock.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(
    root,
    'docs/chapters/03-chapter2-cognito-auth/screenshots',
);
mkdirSync(outDir, { recursive: true });

function pageHtml(todoLabel: string) {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 24px; background: #fff; color: #0f1115; }
    h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .row { display: flex; gap: 8px; margin-bottom: 16px; }
    input { flex: 1; padding: 8px 12px; border: 1px solid #c5c9d2; border-radius: 6px; font-size: 14px; }
    button { padding: 8px 16px; border: none; border-radius: 6px; background: #047d95; color: #fff; font-size: 14px; cursor: default; }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 4px 0; font-size: 14px; }
  </style>
</head>
<body>
  <main>
    <h1>My todos (AWS Blocks + Cognito)</h1>
    <div class="row">
      <input placeholder="New todo" value="" />
      <button type="button">Add</button>
    </div>
    <ul><li>${todoLabel}</li></ul>
  </main>
</body>
</html>`;
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const shots = [
        { file: '02-user-a-todos.png', todo: 'A のタスク' },
        { file: '03-user-b-todos.png', todo: 'B のタスク' },
    ] as const;

    for (const shot of shots) {
        const page = await browser.newPage({
            viewport: { width: 1280, height: 800 },
        });
        await page.setContent(pageHtml(shot.todo), { waitUntil: 'networkidle' });
        const path = resolve(outDir, shot.file);
        await page.screenshot({ path, fullPage: true });
        console.log(`Saved ${path}`);
        await page.close();
    }

    await browser.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
