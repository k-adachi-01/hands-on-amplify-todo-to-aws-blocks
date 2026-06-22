# Sandbox 運用メモ

## 現状の方針（記事執筆時）

**Sandbox は記事検証用に残す**ことを推奨します。`npm run verify:chapter2` / `verify:chapter3` は Sandbox 上の Blocks Lambda と Cognito に依存します。

| 項目 | 値（2026-06-23 実行例） |
| --- | --- |
| Profile | 著者の実行例のみ（読者は `aws login` で可） |
| Region | `ap-northeast-1` |
| Identifier | `adachi` |
| Stack | `amplify-amplifyvitereacttemplate-adachi-sandbox-a14ca47146` |

## 起動・再開

```bash
aws login
aws sts get-caller-identity   # 通ることを確認してから

nix develop
npm run sandbox    # ターミナル A
npm run dev        # ターミナル B
```

セッション切れ時は `aws login` からやり直してください。

## 片付け（任意）

記事公開後やコスト整理時:

```bash
nix develop
npm run sandbox:delete
```

ログ保存例:

```bash
npm run sandbox:delete 2>&1 | tee docs/chapters/00-clone-and-amplify-baseline/commands/05-sandbox-delete.log
```

削除後は `amplify_outputs.json` が無効になり、`verify:chapter2` / `verify:chapter3` は再デプロイまで実行できません。記事のログ・スクショ・マスク outputs は残るため、**資料としての再現性は維持**されます。

## コスト

Sandbox は個人開発用の一時スタックです。不要になったら `sandbox:delete` で CloudFormation スタックを削除してください。
