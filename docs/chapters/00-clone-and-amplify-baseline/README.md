# Phase 0 — クローンと Amplify ベースライン

構成案: Phase 0 / 記事セクション 1.5  
**ステータス: Sandbox デプロイ完了（2026-06-23）**

## 目的

公式 [amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) を起点に、Amplify backend（Cognito + AppSync + Blocks Lambda）を Sandbox に載せる。

## メタ情報

| 項目 | 値 |
| --- | --- |
| 上流テンプレート commit | `a7f2a70036f8d5007fcd510317e38d4540a5bc2f` |
| 実行日 | 2026-06-23 |
| Nix Node | v22.22.3 / npm 10.9.8 |
| AWS Profile | `aws-poc-sandbox`（`.env.local`） |
| AWS Account | `155936382172` |
| Sandbox Region | `ap-northeast-1` |
| Sandbox Identifier | `adachi` |
| CloudFormation Stack | `amplify-amplifyvitereacttemplate-adachi-sandbox-a14ca47146` |
| デプロイ所要時間 | 約 271 秒 |

## 手順 0-1: リポジトリ準備（完了）

```bash
nix develop
npm install
```

ログ: [`commands/01-npm-install.log`](commands/01-npm-install.log)

## 手順 0-2: Before コード（snapshots）

Amplify 単体時代の Todo 定義・フロント呼び出し。

| ファイル | 内容 |
| --- | --- |
| [`snapshots/resource.ts`](snapshots/resource.ts) | `publicApiKey()` の Todo モデル |
| [`snapshots/App.tsx`](snapshots/App.tsx) | `client.models.Todo.*` |

## 手順 0-3: AWS SSO + `.env.local`

```bash
aws sso login --profile aws-poc-sandbox
AWS_PROFILE=aws-poc-sandbox aws sts get-caller-identity

cp .env.local.example .env.local
exit && nix develop   # Loaded .env.local (AWS_PROFILE=aws-poc-sandbox)
```

**トラブル:** `flake.nix` の `${AWS_PROFILE:-unset}` は Nix 式と解釈される → `''${AWS_PROFILE:-unset}` にエスケープ済み。

失敗ログ（プロファイル未指定）: [`commands/02-ampx-sandbox-attempt.log`](commands/02-ampx-sandbox-attempt.log)

## 手順 0-4: ターミナル A — Sandbox（完了）

```bash
npm run sandbox   # 内部: scripts/run-sandbox.sh → ampx sandbox --profile $AWS_PROFILE
```

成功ログ: [`commands/03-sandbox-success.log`](commands/03-sandbox-success.log)

生成物（ローカルのみ、gitignore）:

- `amplify_outputs.json`
- `.amplify/` 配下の CDK artifacts

資料用マスク版: [`snapshots/amplify_outputs.masked.example.json`](snapshots/amplify_outputs.masked.example.json)（`amplify_outputs*.json` は gitignore のため `.example.json` 命名）

| 出力キー | 用途 |
| --- | --- |
| `auth.user_pool_id` | Cognito（Authenticator） |
| `data.url` | AppSync GraphQL（Amplify Data / 旧 Todo） |
| `custom.blocks_api_url` | Blocks API Gateway エンドポイント |

**Sandbox は watch モード** — ターミナル A は起動したままにする。

## 手順 0-5: ターミナル B — Blocks dev + UI（完了）

```bash
npm run dev
```

ログ: [`commands/04-dev-server.log`](commands/04-dev-server.log)

| 項目 | 値 |
| --- | --- |
| URL | http://localhost:3000/ |
| Blocks RPC | http://localhost:3000/aws-blocks/api |
| Realtime WS | `bb-realtime` dev attachment |

### ハイブリッド構成（記事用メモ）

| コンポーネント | 実行場所 |
| --- | --- |
| Cognito 認証 UI | Sandbox provision の User Pool |
| Blocks API（開発中） | ローカル dev server の mock |
| Blocks Lambda（本番相当） | `custom.blocks_api_url`（Sandbox 上） |

サインイン画面スクリーンショット: [`screenshots/02-post-sandbox-authenticator.png`](screenshots/02-post-sandbox-authenticator.png)

## 手順 0-6: 確認チェックリスト

- [x] Sandbox デプロイ成功（`amplify_outputs.json` 生成）
- [x] `npm run dev` で http://localhost:3000 表示
- [x] Authenticator（Sign In / Create Account）表示
- [x] ユーザー A/B で Todo 分離（`npm run verify:chapter2` — 第2章）
- [x] UI スクショ（`02-user-a-todos.png` / `03-user-b-todos.png`）
- [x] 記事初稿完成（`docs/ARTICLE-DRAFT.md`）
- [ ] Amplify 純粋 Todo UI スクショ — snapshots 参照で代替（`phase-0-amplify-baseline` tag）

## 手順 0-7: 片付け（任意）

```bash
npm run sandbox:delete
```

## git tag

`phase-0-amplify-baseline` — Blocks 統合前のコード。Sandbox 実行記録は本 README と `commands/` に追記済み。
