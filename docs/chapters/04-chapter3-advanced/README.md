# 第3章 — 発展（任意）

**ステータス: API 検証完了（2026-06-23）**

## 目的

第2章（Cognito + userId 分離）の上に、Realtime / Secondary Index / toggle・delete 等を追加する。

## 追加 API

- `toggleTodo(todoId)` — 楽観的ロック（`version` + `ifFieldEquals`）
- `deleteTodo(todoId)`
- `listTodos(sortBy?)` — Secondary Index（`byPriority`, `byTitle`）
- `subscribeTodos()` — `Realtime` チャンネル

## 依存

```bash
npm install   # @aws-blocks/bb-realtime をルート / aws-blocks workspace に追加
```

## 手順 3-1: API スモーク（自動）

第2章と同様、Sandbox Blocks API + Cognito JWT で検証:

```bash
npm run verify:chapter3
```

ログ: [`commands/01-verify-chapter3.log`](commands/01-verify-chapter3.log)

検証内容:

- `createTodo`（priority 1 / 3）
- `listTodos('priority')` — 昇順ソート
- `toggleTodo` — `completed: true`
- `deleteTodo` — 一覧から除去

## 手順 3-2: UI（任意）

`npm run dev` + サインイン後:

- Sort ドロップダウン（Priority / Title）
- チェックボックスで完了トグル
- Delete ボタン

Realtime は dev server が `bb-realtime/ws-server` を attach。Sandbox 未デプロイ時は subscribe が失敗する場合あり（UI は手動 `load()` で動作）。

## ローカル Realtime

`npm run dev` 時、dev server が Realtime mock を attach する。

## 対応 git tag

`chapter-3-advanced`

差分: [`diffs/from-chapter-2.patch`](diffs/from-chapter-2.patch)  
スナップショット: [`snapshots/index.ts`](snapshots/index.ts), [`snapshots/App.tsx`](snapshots/App.tsx)
