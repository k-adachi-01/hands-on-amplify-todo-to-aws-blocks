# Amplify Todo → AWS Blocks ハンズオン

**このリポジトリは技術ブログ「Amplify の Todo チュートリアルを AWS Blocks で書き直す」の再現用です。**

| リンク | 内容 |
| --- | --- |
| **記事全文** | [docs/ARTICLE-DRAFT.md](docs/ARTICLE-DRAFT.md) |
| **Zenn 用** | [docs/publish/ARTICLE-zenn.md](docs/publish/ARTICLE-zenn.md) |
| **章ごとの手順** | [docs/chapters/](docs/chapters/) |

**公開 URL:** https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

> **重要:** clone 直後の `main` は完成形です。ハンズオンは [`docs/ARTICLE-DRAFT.md`](docs/ARTICLE-DRAFT.md) のとおり **章ごとに `git switch -c work/chapterN <tag>`** してから編集してください。

## 前提

- **ローカル PC**（Mac / Linux / WSL）— CloudShell 等は UI 確認が難しいため非推奨
- [Nix](https://nixos.org/download/)（推奨）— 無い場合は Node.js **20.20+** / npm 10.8+ をホストに用意
- **AWS CLI 2.32.0+** と `aws login`（[手順](docs/ARTICLE-DRAFT.md#aws-へのログインaws-login)）
- AWS アカウント（Phase 0 の Amplify Sandbox 以降）

## 環境の準備

### Nix のインストール（未導入の場合）

`nix --version` が通ればスキップ可。詳細は [記事の環境準備](docs/ARTICLE-DRAFT.md#環境の準備ローカル実行) を参照。

```bash
# 推奨: Determinate Installer（flakes 有効）
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install

# 代替: 公式インストーラ + flakes 有効化
# sh <(curl -L https://nixos.org/nix/install) --yes
# mkdir -p ~/.config/nix
# echo 'experimental-features = nix-command flakes' >> ~/.config/nix/nix.conf
```

インストール後は**ターミナルを開き直し**、`nix --version` で確認してください。

### Nix あり（推奨）

```bash
nix develop          # Node v22 に固定。初回は数分
npm install
```

### Nix なし（ローカル）

`nix: command not found` と出たら Nix は不要です。

```bash
node -v              # v20.20.0 以上（v22.x 推奨）
npm -v               # 10.8.0 以上
npm install
```

バージョンが足りない場合は [Node.js 公式](https://nodejs.org/) または [nvm](https://github.com/nvm-sh/nvm) で 22 を入れてください。以降、記事に `nix develop` とある箇所は**省略**して同じコマンドを実行します。

`npm install` 後の vulnerability 警告は Amplify / CDK の間接依存によるもので、**`npm audit fix` は実行しないでください**。

名前付きプロファイル（`AWS_PROFILE`）を使う場合は、各ターミナルで:

```bash
cp .env.local.example .env.local   # 未作成なら。AWS_PROFILE のコメントを外す
set -a && source .env.local && set +a
```

## クイックスタート

```bash
git clone https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks.git
cd hands-on-amplify-todo-to-aws-blocks

# 環境準備（どちらか一方）
nix develop && npm install    # Nix あり
# npm install                 # Nix なし（上の「Nix なし」を先に確認）

aws login
aws sts get-caller-identity   # 通ることを確認

# ターミナル A — Sandbox（watch のまま）
npm run sandbox

# ターミナル B — UI
npm run dev    # http://localhost:3000
```

デフォルトプロファイルで `aws login` しただけなら `.env.local` は不要です。

## 検証スクリプト

| コマンド | 前提 |
| --- | --- |
| `npm run verify:chapter2` | Sandbox + `amplify_outputs.json` |
| `npm run verify:chapter3` | 同上 |
| `npm run capture:screenshots` | `npm run dev` @ :3000 |

## このハンズオンで作成される AWS リソース

Amplify Sandbox により、主に以下のリソースが作成されます。

- Amazon Cognito User Pool
- Amazon DynamoDB table
- AWS Lambda function
- Amazon API Gateway
- IAM roles
- CloudFormation stack

## 想定コスト

このハンズオンは短時間の実施を想定しており、通常は大きな課金は発生しません。
ただし、環境・利用量・AWS の料金体系により異なります。

終了後は必ず `npm run sandbox:delete` を実行してください。

## 後片付け（削除確認）

ハンズオン後に続けて検証しない場合は、必ず次を実行してください。

```bash
npm run sandbox:delete
```

削除後、AWS コンソールで以下が残っていないことを確認してください。

- CloudFormation stack が DELETE_COMPLETE になっている
- DynamoDB table が残っていない
- Lambda function が残っていない
- API Gateway API が残っていない
- Cognito User Pool が残っていない

## ライセンス

MIT No Attribution — [LICENSE](LICENSE)
