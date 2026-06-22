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
| **読者** | Amplify Gen 2 Todo クイックスタート経験者 |
| **所要時間** | 本編 90〜120 分 |
| **AWS** | Phase 0 から `aws login` + Amplify Sandbox |

## AWS Blocks とは（2026年6月プレビュー）

[AWS Blocks](https://docs.aws.amazon.com/blocks/latest/devguide/) は、Block（認証・DB・Realtime 等）を npm パッケージで組み合わせ、**同じ TypeScript をローカルと AWS で動かす**バックエンドツールキットです。まだ触った人は少ない前提で、本記事では Amplify 公式 Todo から in-place で載せ替えます。

## なぜ Amplify と比べるか

読者の多くが Amplify quickstart から入るため、**同じ Todo** で「モデル CRUD」と「API 関数」の違いを対比します。Amplify の `publicApiKey()` Todo は誰でも読み書きできる — Blocks では `requireAuth` と `userId` 分離をコードで書きます。

## 準備

```bash
git clone git@github.com:k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks
nix develop && npm install

aws login
aws sts get-caller-identity
```

認証は [aws login](https://aws.amazon.com/jp/blogs/news/simplified-developer-access-to-aws-with-aws-login/)（CLI 2.32.0+）を使用。長期アクセスキーは不要です。

## Phase 0

```bash
# ターミナル A
npm run sandbox

# ターミナル B
npm run dev
```

## 完成イメージ

![Authenticator](https://raw.githubusercontent.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/main/docs/chapters/03-chapter2-cognito-auth/screenshots/01-authenticator-signin.png)

![user-a](https://raw.githubusercontent.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/main/docs/chapters/03-chapter2-cognito-auth/screenshots/02-user-a-todos.png)

## まとめ

認可の置き場所・データ境界・抽象化の単位（モデル vs API）— 全文はリポジトリの [ARTICLE-DRAFT.md](https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks/blob/main/docs/ARTICLE-DRAFT.md)
