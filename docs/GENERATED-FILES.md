# 自動生成ファイルの扱い

## `aws-blocks/client.js`

- **生成元:** `npm run dev` または `npm run blocks:generate-client`
- **コミット:** しない（dev server 起動のたびに上書きされる）
- **資料用スナップショット:** `docs/chapters/03-chapter2-cognito-auth/snapshots/client.sandbox.js`

Sandbox デプロイ後は:

```bash
npm run blocks:generate-client
```

## `amplify_outputs.json`

- Sandbox 成功時にルートに生成
- **gitignore 済み** — commit しない
- マスク例: `docs/**/snapshots/amplify_outputs.masked.example.json`
