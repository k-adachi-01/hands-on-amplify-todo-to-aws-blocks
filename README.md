# Amplify Todo → AWS Blocks ハンズオン

**このリポジトリは技術ブログ「Amplify の Todo チュートリアルを AWS Blocks で書き直す」の再現用です。**

[aws-samples/amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) を起点に、同一リポジトリ内で AWS Blocks へ段階的に書き換えるハンズオン用リポジトリです。

| リンク | 内容 |
| --- | --- |
| **記事全文** | [docs/ARTICLE-DRAFT.md](docs/ARTICLE-DRAFT.md) |
| **Zenn 用** | [docs/publish/ARTICLE-zenn.md](docs/publish/ARTICLE-zenn.md) |
| **章ごとの手順** | [docs/chapters/](docs/chapters/) |
| **Sandbox 運用** | [docs/SANDBOX-OPERATIONS.md](docs/SANDBOX-OPERATIONS.md) |

**公開 URL:** https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

## 前提

- [Nix](https://nixos.org/download/)（flakes 対応）— 無い場合は Node.js 20+ / npm 10+
- AWS アカウント（Phase 0 の Amplify Sandbox 以降）
- AWS CLI + SSO プロファイル

## クイックスタート

```bash
git clone git@github.com:k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks
nix develop
npm install

aws sso login --profile aws-poc-sandbox   # プロファイル名は環境に合わせる
cp .env.local.example .env.local
exit && nix develop   # .env.local を shellHook で読み込む

# ターミナル A — Sandbox（watch のまま）
npm run sandbox

# ターミナル B — UI + Blocks dev
npm run dev    # http://localhost:3000
```

## 検証スクリプト

| コマンド | 前提 | 内容 |
| --- | --- | --- |
| `npm run verify:chapter1` | `npm run blocks:api` で :3002 起動時 | 認証なし CRUD |
| `npm run verify:chapter2` | Sandbox + `amplify_outputs.json` + テストユーザー | Cognito 分離 |
| `npm run verify:chapter3` | 同上 | toggle / sort / delete |
| `npm run capture:screenshots` | `npm run dev` @ :3000、Playwright 初回は `npx playwright install chromium` | 第2章 UI スクショ |

テストユーザー作成: `bash scripts/ensure-chapter2-users.sh`（パスワード既定 `TestPass1!`）

## ハイブリッド dev 構成

| コンポーネント | 実行場所 |
| --- | --- |
| Cognito / Authenticator | Sandbox User Pool |
| Blocks RPC（ブラウザ） | Sandbox Lambda（`custom.blocks_api_url`） |
| Vite UI | ローカル dev server |

## Git タグ

`git tag -l 'phase-*' 'chapter-*'` — 各マイルストーンのコードに `git checkout <tag>` で戻れます。

## ライセンス

MIT No Attribution（起点テンプレートに準拠）。詳細は [LICENSE](LICENSE)。
