# 第2章 — Cognito 連携 + ユーザー分離

**ステータス: API 分離検証完了（2026-06-23 02:22 JST）— UI スクショは任意**

## 目的

`CognitoVerifier` + `userId` パーティションキーでログインユーザーごとに Todo を分離。第2章 tag では **Realtime / toggle / delete / sort は含みません**（第3章で追加）。

## 実行セッション記録

### 前提（完了）

```bash
# ターミナル A — Sandbox（watch のまま）
nix develop && npm run sandbox

# ターミナル B — Blocks dev + Vite UI
nix develop && npm run dev
```

| 項目 | 値 |
| --- | --- |
| UI | http://localhost:3000/ |
| Blocks RPC（ブラウザ向け） | `amplify_outputs.json` の `custom.blocks_api_url`（Sandbox Lambda） |
| Cognito | Sandbox が provision した User Pool |

**ハイブリッド構成:** 認証 UI は Sandbox の Cognito。`aws-blocks/client.js` は Sandbox の API Gateway URL を参照し、Amplify セッションの **ID トークン** を `Authorization: Bearer` で付与する。

### 確認済み

- [x] http://localhost:3000/ に Amplify Authenticator が表示される
- [x] `npm run verify:chapter2` — Sandbox Blocks API + Cognito JWT で userId 分離 OK
- スクリーンショット: [`screenshots/01-authenticator-signin.png`](screenshots/01-authenticator-signin.png)
- 検証ログ: [`commands/02-verify-chapter2-auth.log`](commands/02-verify-chapter2-auth.log)

### Sandbox 連携クライアント生成

Sandbox デプロイ後、`amplify_outputs.json` の `custom.blocks_api_url` を client に反映:

```bash
npm run blocks:generate-client
```

ログ: [`commands/01-generate-client.log`](commands/01-generate-client.log)  
生成物スナップショット: [`snapshots/client.sandbox.js`](snapshots/client.sandbox.js)

`npm run dev` 起動時も dev server が `client.js` を再生成する。

## 手順 2-1: テストユーザー準備

### 方法 A — UI（Create Account タブ）

1. **Create Account** で `user-a@example.com` を登録
2. メール確認コードが必要な場合は Cognito から届いたコードを入力
3. パスワードは User Pool ポリシーに従う（例: `TestPass1!` — 大文字・小文字・数字・記号各1以上）

### 方法 B — AWS CLI（ハンズオン記録用・メール不要）

```bash
bash scripts/ensure-chapter2-users.sh
```

`amplify_outputs.json` の `auth.user_pool_id` を使う。パスワードは `TestPass1!`（`CHAPTER2_TEST_PASSWORD` で上書き可）。

**注意:** Amplify 管理の App Client は `USER_PASSWORD_AUTH` 非許可のため、トークン取得は `npm run verify:chapter2` 内の Amplify SRP `signIn` を使う（`scripts/verify-chapter2-auth.ts`）。

## 手順 2-2: UI でユーザー分離を確認

1. **Sign In** で `user-a@example.com` / `TestPass1!` でログイン
2. Todo を 1 件追加（例: `A のタスク`）
3. 右上 **Sign out**
4. `user-b@example.com` でログイン → `B のタスク` を追加
5. 各ユーザーで一覧が **自分の Todo のみ** であることを確認
6. スクリーンショット（Playwright 自動取得可）:
    - [`screenshots/02-user-a-todos.png`](screenshots/02-user-a-todos.png) — `npx tsx scripts/capture-chapter2-screenshots.ts`
    - [`screenshots/03-user-b-todos.png`](screenshots/03-user-b-todos.png)

## 手順 2-3: API スモーク（自動）

ユーザー作成〜 JWT 取得〜 RPC 分離チェックを一括実行:

```bash
npm run verify:chapter2
```

ローカル dev server の RPC を使う場合（第1章と同様）:

```bash
BLOCKS_API_URL=http://127.0.0.1:3000/aws-blocks/api npm run verify:chapter2
```

成功ログの保存先: [`commands/02-verify-chapter2-auth.log`](commands/02-verify-chapter2-auth.log)（実行後に `tee` で追記）

## 変更点（コード）

### `aws-blocks/index.ts`

- `CognitoVerifier` + `auth.requireAuth(context)`
- `userId: user.sub`、キー `partitionKey: 'userId'`, `sortKey: 'todoId'`
- `cognito-verifier.ts` はリポジトリ同梱（新規作成不要）

### フロント

- `Authenticator` + `Amplify.configure(outputs)`（`src/main.tsx`）

スナップショット: [`snapshots/index.ts`](snapshots/index.ts), [`snapshots/App.tsx`](snapshots/App.tsx)

## Amplify quickstart との対比

| Amplify Data | Blocks |
| --- | --- |
| `allow.publicApiKey()` on Todo model | API 内 `requireAuth` + `userId` キー |
| authorization rule | 明示的な domain API |

## 対応 git tag

`chapter-2-cognito-auth`（第3章機能は **含まない**）

差分: [`diffs/from-chapter-1.patch`](diffs/from-chapter-1.patch)
