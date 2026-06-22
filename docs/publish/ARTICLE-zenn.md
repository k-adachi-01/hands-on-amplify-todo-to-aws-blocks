---
title: Amplify の Todo チュートリアルを AWS Blocks で書き直す — バックエンドの中身が見えるハンズオン
emoji: 🧱
type: tech
topics: [aws, amplify, react, typescript, hands-on]
published: false
---

> 再現用リポジトリ: https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

## この記事について

| 項目 | 内容 |
| --- | --- |
| **読者** | Amplify Gen 2 の Todo クイックスタートを触ったことがあるフロントエンド寄りの開発者 |
| **作るもの** | ログイン付き Todo アプリ（公式テンプレートを in-place で AWS Blocks 化） |
| **所要時間** | 本編 90〜120 分 / 発展編含め 150〜180 分 |
| **AWS アカウント** | Phase 0 から必要 |
| **環境** | Nix dev shell 内の Node.js v22 + npm |

## はじめに

[amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) は少ないコードで Todo を動かせますが、quickstart の Todo は `publicApiKey()` で誰でも読み書きでき、バックエンドの処理順も見えにくいです。

本ハンズオンでは同じ Todo を **AWS Blocks** へ in-place で書き換えます。

- **Amplify:** モデル宣言 → `client.models.Todo.*`
- **Blocks:** `aws-blocks/index.ts` に API を書き → `api.createTodo()`

```bash
git clone git@github.com:k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks
nix develop && npm install
```

## 完成イメージ

### サインイン後の Todo UI

![Authenticator](https://raw.githubusercontent.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/main/docs/chapters/03-chapter2-cognito-auth/screenshots/01-authenticator-signin.png)

![user-a](https://raw.githubusercontent.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/main/docs/chapters/03-chapter2-cognito-auth/screenshots/02-user-a-todos.png)

![user-b](https://raw.githubusercontent.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/main/docs/chapters/03-chapter2-cognito-auth/screenshots/03-user-b-todos.png)

## アーキテクチャ（ハイブリッド dev）

| コンポーネント | 実行場所 |
| --- | --- |
| Cognito / Authenticator | Sandbox User Pool |
| Blocks RPC（ブラウザ） | Sandbox Lambda |
| Vite UI | localhost:3000 |

ブラウザからの Todo 操作は **AWS 上の Lambda** に届きます。

## Phase 0: Sandbox

```bash
aws sso login --profile aws-poc-sandbox
cp .env.local.example .env.local
nix develop

# ターミナル A
npm run sandbox

# ターミナル B
npm run dev
```

## Phase 1: Blocks 統合

```bash
npx @aws-blocks/create-blocks-app@latest . --yes
```

## 第1章: 最小 CRUD

`DistributedTable` + `api.createTodo` / `api.listTodos`。詳細はリポジトリの `docs/chapters/02-chapter1-minimal-crud/`。

## 第2章: Cognito + ユーザー分離

- `CognitoVerifier` — JWT 検証（ログイン UI ではない）
- `auth.requireAuth(context)` — API 内で認可
- `userId: user.sub` — partition key で分離

```bash
bash scripts/ensure-chapter2-users.sh
npm run verify:chapter2
```

## 発展編: 第3章

toggle / delete / sort / Realtime。`npm run verify:chapter3`。

## トラブルシュート（要約）

- **InvalidCredentialError** → `.env.local` の `AWS_PROFILE`
- **sso login 後も失敗** → `AWS_PROFILE=... aws sts get-caller-identity`
- **CLI Cognito 認証失敗** → `USER_PASSWORD_AUTH` 非許可、verify スクリプトは SRP を使用
- **client.js** — 自動生成、編集しない

## まとめ

認可の置き場所（モデルルール vs API 内）、データ境界（`publicApiKey` vs `user.sub`）、抽象化の単位（モデル vs ドメイン API）の三つが、このハンズオンの学びです。

全文・ログ・diff: https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/tree/main/docs
