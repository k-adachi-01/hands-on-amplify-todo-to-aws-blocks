# 実行ログ — 2026-06-23 Sandbox セッション

## 環境

| 項目 | 値 |
| --- | --- |
| 日時 | 2026-06-23 02:00–02:16 JST 頃 |
| AWS Profile | aws-poc-sandbox |
| Region | ap-northeast-1 |
| Nix Node | v22.22.3 |
| GitHub | https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks |

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
| user A/B UI スクショ | chapters/03-.../screenshots/02-user-a-todos.png, 03-user-b-todos.png |
| client（Sandbox URL） | chapters/03-.../snapshots/client.sandbox.js |
| 第3章 API 検証ログ | chapters/04-.../commands/01-verify-chapter3.log |

## セッション 2 — 資料整備 + 第2章検証（02:16–02:22 JST）

- `scripts/run-sandbox.sh` / `run-sandbox-delete.sh`
- `npm run verify:chapter2` → OK（Amplify SRP signIn）
- トラブル: CLI `USER_PASSWORD_AUTH` 非許可

## セッション 3 — UI スクショ（02:30 頃）

```bash
npx tsx scripts/capture-chapter2-screenshots.ts
# → 02-user-a-todos.png, 03-user-b-todos.png
```

commit: `c8cbb14`

## セッション 4 — GitHub 公開 + 第3章検証（夜間自律）

```bash
gh repo create hands-on-amplify-todo-to-aws-blocks --public --source=. --push
git push origin --tags
npm run verify:chapter3 | tee docs/chapters/04-chapter3-advanced/commands/01-verify-chapter3.log
# → OK — toggle, sort, delete verified
```

## 関連

- 記事初稿: [`ARTICLE-DRAFT.md`](ARTICLE-DRAFT.md)
- 第2章: [`chapters/03-chapter2-cognito-auth/README.md`](chapters/03-chapter2-cognito-auth/README.md)
- 第3章: [`chapters/04-chapter3-advanced/README.md`](chapters/04-chapter3-advanced/README.md)
