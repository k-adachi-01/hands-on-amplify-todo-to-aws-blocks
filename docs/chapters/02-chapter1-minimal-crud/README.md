# 第1章 — 最小 Todo CRUD

## 目的

Amplify Data（`client.models.Todo.*`）から Blocks の `api.createTodo` / `api.listTodos` へ切り替える。認証・Realtime はまだ入れない。

## 手順

### 1-1. 依存関係

`aws-blocks/package.json` に `@aws-blocks/bb-distributed-table` と `zod` を追加し、ルートで:

```bash
nix develop
npm install
```

### 1-2. `aws-blocks/index.ts` を Todo 用に書き換え

- `Scope` + `DistributedTable` + `ApiNamespace`
- キー: `partitionKey: 'todoId'`（全員共通 Todo、第2章で `userId` に変更）
- API: `createTodo(content)`, `listTodos()`

スナップショット: [`snapshots/aws-blocks-index.ts`](snapshots/aws-blocks-index.ts)

### 1-3. フロント `src/App.tsx`

- `import { api } from 'aws-blocks'`
- 作成後に `await load()`（`observeQuery` の代わり）

スナップショット: [`snapshots/App.tsx`](snapshots/App.tsx)

### 1-4. ローカル dev server

`aws-blocks/scripts/server.ts` を追加（`await startDevServer(...)` **必須** — 忘れるとプロセスが即終了する）。

```bash
nix develop
npm run dev          # http://localhost:3000（Blocks + Vite）
```

API のみ検証する場合:

```bash
nix develop
npx tsx aws-blocks/scripts/server-api-only.ts   # ポート 3002
bash scripts/verify-chapter1-api.sh
```

ログ: [`commands/02-verify-api.log`](commands/02-verify-api.log)

### 1-5. Amplify Data からの切り替えメモ

| Before | After |
| --- | --- |
| `client.models.Todo.create()` | `api.createTodo(content)` |
| `observeQuery().subscribe()` | `load()` を手動呼び出し |
| `amplify/data/resource.ts` | `aws-blocks/index.ts` |

## 学び

- モデル CRUD が domain API 関数になる
- バックエンドの保存・取得が 1 ファイルで読める
- ローカルは `.bb-data/` に永続化（AWS 不要）

## git tag

`chapter-1-minimal-crud`
