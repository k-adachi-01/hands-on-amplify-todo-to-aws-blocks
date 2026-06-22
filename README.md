# Amplify Todo → AWS Blocks ハンズオン

[aws-samples/amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) を起点に、同一リポジトリ内で AWS Blocks へ段階的に書き換えるハンズオン用リポジトリです。

**公開 URL:** https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

## 前提

- [Nix](https://nixos.org/download/)（flakes 対応）
- AWS アカウント（Phase 0 の Amplify Sandbox 以降）
- AWS CLI + SSO プロファイル（Sandbox デプロイ用）

## クイックスタート

```bash
git clone git@github.com:k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks
nix develop
npm install

aws sso login --profile aws-poc-sandbox   # プロファイル名は環境に合わせる
cp .env.local.example .env.local

# ターミナル A
npm run sandbox

# ターミナル B
npm run dev    # http://localhost:3000
```

## 環境の入り方（Nix）

ホストに Node.js / npm を直接入れず、dev shell 内だけで作業します。

```bash
nix develop
node -v    # v22.x
```

`npm_config_cache` はリポジトリ内 `.npm-cache/` に向きます。`.env.local` は `nix develop` 時に自動読み込みされます。

## 検証スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run verify:chapter1` | 認証なし CRUD（API-only :3002） |
| `npm run verify:chapter2` | Cognito JWT + userId 分離 |
| `npm run verify:chapter3` | toggle / sort / delete |
| `npm run capture:screenshots` | 第2章 UI スクショ（Playwright） |

## ドキュメント

| パス | 内容 |
| --- | --- |
| [docs/outline.md](docs/outline.md) | 記事構成（実行版） |
| [docs/ARTICLE-DRAFT.md](docs/ARTICLE-DRAFT.md) | 記事初稿 |
| [docs/EXECUTION-LOG-2026-06-23.md](docs/EXECUTION-LOG-2026-06-23.md) | 実行ログ |
| [docs/chapters/](docs/chapters/) | 章ごとの手順・ログ・snapshots |

## 進め方（概要）

1. **Phase 0** — Amplify Sandbox + Blocks dev（ハイブリッド）
2. **Phase 1** — `npx @aws-blocks/create-blocks-app .`
3. **第1章** — 最小 Todo CRUD
4. **第2章** — Cognito + ユーザー分離
5. **第3章** — Realtime / ソート / 更新削除

各フェーズの詳細は `docs/chapters/` を参照。マイルストーンは `git tag -l 'phase-*' 'chapter-*'`。

## ハイブリッド dev 構成

| コンポーネント | 実行場所 |
| --- | --- |
| Cognito / Authenticator | Sandbox User Pool |
| Blocks RPC（ブラウザ） | Sandbox Lambda（`custom.blocks_api_url`） |
| Vite UI | ローカル dev server |

## ライセンス

アプリ本体は起点テンプレートに準じ MIT-0。ハンズオン資料（`docs/`）は本リポジトリ内で公開。
