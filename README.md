# Amplify Todo → AWS Blocks ハンズオン

[aws-samples/amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) を起点に、同一リポジトリ内で AWS Blocks へ段階的に書き換えるハンズオン用リポジトリです。

## 前提

- [Nix](https://nixos.org/download/)（flakes 対応）
- AWS アカウント（Phase 0 の Amplify Sandbox 以降）
- AWS CLI プロファイル（Sandbox デプロイ用）

## 環境の入り方（Nix）

ホストに Node.js / npm を直接入れず、dev shell 内だけで作業します。

```bash
cd hands-on-walkthrough   # 本リポジトリのルート
nix develop               # または direnv use flake
node -v                   # v22.x
npm -v
```

`npm_config_cache` はリポジトリ内 `.npm-cache/` に向きます（`.gitignore` 済み）。

## ドキュメント

| パス | 内容 |
| --- | --- |
| [docs/outline.md](docs/outline.md) | 記事構成（実行版） |
| [docs/journal-template.md](docs/journal-template.md) | 実行記録テンプレート |
| [docs/chapters/](docs/chapters/) | 章ごとの手順・ログ・snapshots |

## 進め方（概要）

1. **Phase 0** — 公式 Amplify テンプレートの Todo を Sandbox + Vite で動かす
2. **Phase 1** — `npx @aws-blocks/create-blocks-app .` で Blocks を統合
3. **第1章** — 最小 Todo CRUD（Blocks `api.*`）
4. **第2章** — Cognito 連携 + ユーザーごとのデータ分離
5. **第3章**（任意）— Realtime / ソート / 更新削除

各フェーズの詳細手順は `docs/chapters/` を参照してください。

## Git タグ

マイルストーンは `git tag` で管理しています。`git tag -l 'phase-*' 'chapter-*'` で一覧できます。

## ライセンス

アプリ本体は起点テンプレートに準じ MIT-0。ハンズオン資料（`docs/`）は本リポジトリ内で Apache-2.0 または MIT で公開予定。
