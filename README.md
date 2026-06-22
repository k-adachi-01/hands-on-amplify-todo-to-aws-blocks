# Amplify Todo → AWS Blocks ハンズオン

**このリポジトリは技術ブログ「Amplify の Todo チュートリアルを AWS Blocks で書き直す」の再現用です。**

| リンク | 内容 |
| --- | --- |
| **記事全文** | [docs/ARTICLE-DRAFT.md](docs/ARTICLE-DRAFT.md) |
| **Zenn 用** | [docs/publish/ARTICLE-zenn.md](docs/publish/ARTICLE-zenn.md) |
| **章ごとの手順** | [docs/chapters/](docs/chapters/) |

**公開 URL:** https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

> **重要:** clone 直後の `main` は完成形です。ハンズオンは [`docs/ARTICLE-DRAFT.md`](docs/ARTICLE-DRAFT.md) のとおり **章ごとに `git checkout <tag>`** してから編集してください。

## 前提

- [Nix](https://nixos.org/download/)（推奨）— 無い場合は Node.js **20.20+** / npm 10.8+
- **AWS CLI 2.32.0+** と `aws login`（[手順](docs/ARTICLE-DRAFT.md#aws-へのログインaws-login)）
- AWS アカウント（Phase 0 の Amplify Sandbox 以降）

## クイックスタート

```bash
git clone git@github.com:k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks
nix develop && npm install

aws login
aws sts get-caller-identity   # 通ることを確認

# ターミナル A — Sandbox（watch のまま）
npm run sandbox

# ターミナル B — UI
npm run dev    # http://localhost:3000
```

名前付きプロファイルを使う場合のみ `cp .env.local.example .env.local` で `AWS_PROFILE` を設定。

## 検証スクリプト

| コマンド | 前提 |
| --- | --- |
| `npm run verify:chapter2` | Sandbox + `amplify_outputs.json` |
| `npm run verify:chapter3` | 同上 |
| `npm run capture:screenshots` | `npm run dev` @ :3000 |

## ライセンス

MIT No Attribution — [LICENSE](LICENSE)
