# Amplify の Todo チュートリアルを AWS Blocks で書き直す

> 記事初稿。実行ログ・snapshots・diff は `docs/chapters/` を参照。  
> **再現用リポジトリ:** https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

## はじめに

AWS Amplify Gen 2 の [amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) は、少ないコードで Todo アプリを動かせます。一方でバックエンドの処理順（認証 → 保存 → 返却）が見えにくく、quickstart の Todo は `publicApiKey()` で誰でも読み書きできます。

本ハンズオンでは **同じ Todo アプリ** を起点に、**AWS Blocks** へ in-place で書き換えます。

- **Amplify 版:** モデルを宣言し `client.models.Todo.*` で CRUD
- **Blocks 版:** `aws-blocks/index.ts` に API を書き、`api.createTodo()` で呼ぶ

環境は **Nix dev shell** 内の npm のみ使い、ホストを汚しません。

```bash
git clone git@github.com:k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks
nix develop
node -v   # v22.x
```

### 読者が得られるもの

1. Amplify `defineData` + `client.models.*` と Blocks `api.*` の対応
2. 「モデル宣言」から「API 関数」への抽象化の違い
3. ローカル dev + Sandbox デプロイのハイブリッド構成
4. Cognito ログインユーザーごとのデータ分離

> Amplify 版は「少ないコードで使える」。Blocks 版は「バックエンドの中身が見える」。

---

## Phase 0: Amplify ベースライン

```bash
nix develop && npm install

aws sso login --profile aws-poc-sandbox
cp .env.local.example .env.local
```

**ターミナル A:** `npm run sandbox`（`scripts/run-sandbox.sh` が `--profile` を付与）  
**ターミナル B:** `npm run dev`（Blocks dev + Vite @ http://localhost:3000）

2026-06-23 実行例（`ap-northeast-1`）:

- デプロイ約 271 秒 → `amplify_outputs.json` 生成
- AppSync + Cognito User Pool + Blocks API Gateway（`custom.blocks_api_url`）
- UI: Authenticator 表示確認済み

### ハイブリッド dev（重要）

| コンポーネント | 実行場所 |
| --- | --- |
| Cognito / Authenticator | Sandbox User Pool |
| Blocks RPC（ブラウザ） | **Sandbox Lambda**（`client.js` が `custom.blocks_api_url` を参照） |
| Vite UI | ローカル dev server |

ブラウザからの Todo 操作は **AWS 上の Blocks Lambda** に届きます。ローカル mock ではありません。

### Before の要点

- `amplify/data/resource.ts` — `Todo` は `content` のみ、`publicApiKey()`
- `src/App.tsx` — `client.models.Todo.create()` / `observeQuery()`

詳細: [chapters/00-clone-and-amplify-baseline/README.md](chapters/00-clone-and-amplify-baseline/README.md)

---

## Phase 1: Blocks 統合

```bash
npx @aws-blocks/create-blocks-app@latest . --yes
```

Amplify 検出時は `CognitoVerifier` 付き scaffold が入ります。

詳細: [chapters/01-blocks-scaffold/README.md](chapters/01-blocks-scaffold/README.md)

---

## 第1章: 最小 CRUD

`aws-blocks/index.ts` を Todo 用 `DistributedTable` + `api.createTodo` / `api.listTodos` に差し替え、フロントは `import { api } from 'aws-blocks'`。

```bash
npm run dev
npm run verify:chapter1   # API-only :3002 時
```

| Amplify | Blocks |
| --- | --- |
| `client.models.Todo.create()` | `api.createTodo(title)` |
| `observeQuery().subscribe()` | `load()` を手動呼び出し |

詳細: [chapters/02-chapter1-minimal-crud/README.md](chapters/02-chapter1-minimal-crud/README.md)

---

## 第2章: Cognito + ユーザー分離

`auth.requireAuth(context)` と `userId: user.sub` で自分の Todo だけ見えるようにします。UI は `Authenticator`。

```bash
npm run sandbox && npm run dev
bash scripts/ensure-chapter2-users.sh
npm run verify:chapter2
npm run capture:screenshots   # Playwright
```

### 検証結果（2026-06-23）

- user-a: `A のタスク` のみ
- user-b: `B のタスク` のみ
- スクショ: `docs/chapters/03-chapter2-cognito-auth/screenshots/`

詳細: [chapters/03-chapter2-cognito-auth/README.md](chapters/03-chapter2-cognito-auth/README.md)

---

## 第3章: Realtime / ソート / 更新削除

`toggleTodo`, `deleteTodo`, Secondary Index, `subscribeTodos` を追加。

```bash
npm run verify:chapter3
```

検証: priority ソート、toggle（`completed`）、delete。

詳細: [chapters/04-chapter3-advanced/README.md](chapters/04-chapter3-advanced/README.md)

---

## 対応表

| やりたいこと | Amplify | Blocks |
| --- | --- | --- |
| 作成 | `client.models.Todo.create()` | `api.createTodo(title)` |
| 一覧 | `observeQuery()` | `api.listTodos()` |
| 認可 | `allow.publicApiKey()` 等 | `CognitoVerifier` + `requireAuth` |
| バックエンド | `amplify/data/resource.ts` | `aws-blocks/index.ts` |
| 完了トグル | `update` | `api.toggleTodo` + 楽観的ロック |
| リアルタイム | `observeQuery` | `api.subscribeTodos` + Realtime |

## Git タグ

`git tag -l 'phase-*' 'chapter-*'`

| タグ | 内容 |
| --- | --- |
| `phase-0-amplify-baseline` | Blocks 統合前 |
| `phase-1-blocks-scaffold` | create-blocks-app 直後 |
| `chapter-1-minimal-crud` | 認証なし CRUD |
| `chapter-2-cognito-auth` | Cognito + ユーザー分離 |
| `chapter-3-advanced` | Realtime 等 |

---

## トラブルシュート

### `ampx sandbox` で InvalidCredentialError

デフォルト AWS 認証情報が空。`.env.local` に `AWS_PROFILE=aws-poc-sandbox` を設定し、`nix develop` で読み込む。`npm run sandbox` は `scripts/run-sandbox.sh` 経由で `--profile` を付与する。

### `aws sso login` 後も `sts get-caller-identity` が失敗

`AWS_PROFILE` 未指定。`AWS_PROFILE=aws-poc-sandbox aws sts get-caller-identity` で確認。

### CLI で Cognito パスワード認証が使えない

Amplify 管理の App Client は `USER_PASSWORD_AUTH` 非許可。`npm run verify:chapter2` は Amplify SRP `signIn` を使用（`scripts/verify-chapter2-auth.ts`）。

### `aws-blocks/client.js` はコミットしない

dev server / `npm run blocks:generate-client` で自動生成。Sandbox 後は `npm run blocks:generate-client` を実行。

### Realtime が動かない

Sandbox 未デプロイ時は `subscribeTodos` が失敗する場合あり。UI は `load()` でフォールバック。

---

## 公開・秘密情報

- リポジトリ: https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks
- `amplify_outputs.json` は commit しない（マスク例のみ `docs/**/snapshots/`）
- Sandbox 片付け: `npm run sandbox:delete`（任意）

## まとめ

Amplify は「少ないコードで使える」。Blocks は「バックエンドの中身が見える」。同じ Todo でも、抽象化の単位が **モデル** から **API 関数** に変わる — それが本ハンズオンの学びです。
