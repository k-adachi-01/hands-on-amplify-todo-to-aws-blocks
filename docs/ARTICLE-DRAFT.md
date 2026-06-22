# Amplify の Todo チュートリアルを AWS Blocks で書き直す

> 記事初稿。実行ログ・snapshots・diff は `docs/chapters/` を参照。
> 再現用リポジトリ: 本ディレクトリ（GitHub 公開予定）。

## はじめに

AWS Amplify Gen 2 の [amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) は、少ないコードで Todo アプリを動かせます。一方でバックエンドの処理順（認証 → 保存 → 返却）が見えにくく、quickstart の Todo は `publicApiKey()` で誰でも読み書きできます。

本ハンズオンでは **同じ Todo アプリ** を起点に、**AWS Blocks** へ in-place で書き換えます。

- **Amplify 版:** モデルを宣言し `client.models.Todo.*` で CRUD
- **Blocks 版:** `aws-blocks/index.ts` に API を書き、`api.createTodo()` で呼ぶ

環境は **Nix dev shell** 内の npm のみ使い、ホストを汚しません。

```bash
nix develop
node -v   # v22.x
```

## Phase 0: Amplify ベースライン

```bash
git clone https://github.com/aws-samples/amplify-vite-react-template.git
# 本リポジトリはテンプレート + Nix + docs を統合済み
nix develop && npm install
```

**ターミナル A:** `npx ampx sandbox`  
**ターミナル B:** `npm run dev:amplify`

詳細: [docs/chapters/00-clone-and-amplify-baseline/README.md](chapters/00-clone-and-amplify-baseline/README.md)

### Before の要点

- `amplify/data/resource.ts` — `Todo` は `content` のみ、`publicApiKey()`
- `src/App.tsx` — `client.models.Todo.create()` / `observeQuery()`

## Phase 1: Blocks 統合

```bash
npx @aws-blocks/create-blocks-app@latest . --yes
```

Amplify 検出時は `CognitoVerifier` 付き scaffold が入ります。

詳細: [docs/chapters/01-blocks-scaffold/README.md](chapters/01-blocks-scaffold/README.md)

## 第1章: 最小 CRUD

`aws-blocks/index.ts` を Todo 用 `DistributedTable` + `api.createTodo` / `api.listTodos` に差し替え、フロントは `import { api } from 'aws-blocks'`。

```bash
npm run dev              # Blocks + Vite @ :3000
npm run verify:chapter1  # API スモーク（:3002 API-only 時）
```

詳細: [docs/chapters/02-chapter1-minimal-crud/README.md](chapters/02-chapter1-minimal-crud/README.md)

## 第2章: Cognito + ユーザー分離

`auth.requireAuth(context)` と `userId: user.sub` で自分の Todo だけ見えるようにします。UI は `Authenticator`。

```bash
npm run sandbox && npm run dev
```

詳細: [docs/chapters/03-chapter2-cognito-auth/README.md](chapters/03-chapter2-cognito-auth/README.md)

## 第3章: Realtime / ソート / 更新削除

`toggleTodo`, `deleteTodo`, Secondary Index, `subscribeTodos` を追加。

詳細: [docs/chapters/04-chapter3-advanced/README.md](chapters/04-chapter3-advanced/README.md)

## 対応表

| やりたいこと | Amplify | Blocks |
| --- | --- | --- |
| 作成 | `client.models.Todo.create()` | `api.createTodo(title)` |
| 一覧 | `observeQuery()` | `api.listTodos()` |
| 認可 | `allow.publicApiKey()` 等 | `CognitoVerifier` + `requireAuth` |
| バックエンド | `amplify/data/resource.ts` | `aws-blocks/index.ts` |

## Git タグ

`git tag -l 'phase-*' 'chapter-*'`

| タグ | 内容 |
| --- | --- |
| `phase-0-amplify-baseline` | Blocks 統合前 |
| `phase-1-blocks-scaffold` | create-blocks-app 直後 |
| `chapter-1-minimal-crud` | 認証なし CRUD |
| `chapter-2-cognito-auth` | Cognito + ユーザー分離 |
| `chapter-3-advanced` | Realtime 等 |

## 公開時

- 本リポジトリのみ push（親 WS の他サンプルは含めない）
- `amplify_outputs.json` は commit しない（マスク例のみ `docs/` に）

## まとめ

Amplify は「少ないコードで使える」。Blocks は「バックエンドの中身が見える」。同じ Todo でも、抽象化の単位が **モデル** から **API 関数** に変わる — それが本ハンズオンの学びです。
