# GitHub リポジトリメタデータ（手動設定用）

公開済みリポジトリの description / topics を整える場合:

```bash
gh repo edit k-adachi-01/hands-on-amplify-todo-to-aws-blocks \
  --description "Hands-on: rewrite Amplify Todo quickstart to AWS Blocks (in-place migration, Nix dev shell)" \
  --add-topic aws-amplify \
  --add-topic aws-blocks \
  --add-topic react \
  --add-topic vite \
  --add-topic hands-on \
  --add-topic aws-cdk \
  --add-topic typescript
```

## 自動生成ファイル方針

- `aws-blocks/client.js` — **commit しない**（[GENERATED-FILES.md](../GENERATED-FILES.md)）
- Git タグ — `git push origin --tags` で GitHub と同期済み

## Release（任意）

マイルストーンごとに GitHub Release を切る場合:

```bash
gh release create chapter-2-cognito-auth \
  --title "Chapter 2: Cognito auth + user isolation" \
  --notes "See docs/chapters/03-chapter2-cognito-auth/README.md"
```
