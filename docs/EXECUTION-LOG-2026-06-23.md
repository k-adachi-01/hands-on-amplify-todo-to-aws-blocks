# 実行ログ — 2026-06-23 Sandbox セッション

## 環境

| 項目 | 値 |
| --- | --- |
| 日時 | 2026-06-23 02:00–02:16 JST 頃 |
| AWS Profile | aws-poc-sandbox |
| Region | ap-northeast-1 |
| Nix Node | v22.22.3 |

## コマンド履歴（要約）

```bash
aws sso login --profile aws-poc-sandbox
cp .env.local.example .env.local
nix develop                    # Loaded .env.local

# ターミナル A
npm run sandbox                # 約 4.5 分で Deployment completed

# ターミナル B
npm run dev                    # http://localhost:3000
```

## 成果物

| 種別 | パス |
| --- | --- |
| Sandbox 成功ログ | chapters/00-.../commands/03-sandbox-success.log |
| dev server ログ | chapters/00-.../commands/04-dev-server.log |
| outputs マスク例 | chapters/00-.../snapshots/amplify_outputs.masked.example.json |
| Authenticator スクショ | chapters/03-.../screenshots/01-authenticator-signin.png |
| client（Sandbox URL） | chapters/03-.../snapshots/client.sandbox.js |

## セッション 2 — 資料整備 + 第2章検証準備（02:16 以降）

### 実施内容

1. Phase 0 README に Sandbox 成功記録・ハイブリッド構成メモを反映
2. `scripts/run-sandbox.sh` / `run-sandbox-delete.sh` — `.env.local` の `AWS_PROFILE` を `ampx --profile` に渡す
3. `scripts/verify-chapter2-auth.sh` + `npm run verify:chapter2` を追加
4. マスク outputs を `amplify_outputs.masked.example.json` に改名（gitignore 回避）
5. Authenticator スクショを Phase 0 にもコピー（`02-post-sandbox-authenticator.png`）

### セッション 2 — 第2章 API 分離検証（02:22 JST）

```bash
bash scripts/ensure-chapter2-users.sh   # user-a / user-b @ example.com
npm run verify:chapter2 | tee docs/chapters/03-chapter2-cognito-auth/commands/02-verify-chapter2-auth.log
# → OK — userId partition isolation verified
```

| ユーザー | email | Sandbox Blocks API |
| --- | --- | --- |
| A | user-a@example.com | `A のタスク` のみ list |
| B | user-b@example.com | `B のタスク` のみ list |

**トラブル:** CLI の `initiate-auth` / `USER_PASSWORD_AUTH` は Amplify App Client で無効 → `verify-chapter2-auth.ts` が Amplify SRP `signIn` を使用。

### 残作業（任意）

- ブラウザで Sign In → Todo UI スクショ（`02-user-a-todos.png`, `03-user-b-todos.png`）
- GitHub 公開

## 関連

- 記事初稿: [`ARTICLE-DRAFT.md`](ARTICLE-DRAFT.md)
- 第2章 README: [`chapters/03-chapter2-cognito-auth/README.md`](chapters/03-chapter2-cognito-auth/README.md)
