# 実行記録テンプレート

各ステップ実行時に、このテンプレートをコピーして `docs/chapters/XX-.../README.md` または `commands/` 配下に追記する。

## メタ情報

| 項目 | 値 |
| --- | --- |
| 章 | （例: 00-clone-and-amplify-baseline） |
| 日時 | YYYY-MM-DD HH:MM |
| 作業者 | |
| git tag | （マイルストーン到達時） |
| git commit | `git rev-parse HEAD` |
| 上流 Amplify テンプレート commit | （Phase 0 のみ） |

## 環境

```bash
pwd
node -v
npm -v
git rev-parse HEAD
nix flake metadata . 2>/dev/null | head -5 || true
echo "AWS_PROFILE=${AWS_PROFILE:-default}"
aws sts get-caller-identity 2>/dev/null || echo "AWS CLI not configured"
```

## 実行コマンド

```bash
# ここに実行したコマンドを順番に記載
```

## 結果

- 成功 / 失敗:
- 備考:

## 生成・変更ファイル

- （リスト）

## スクリーンショット

| ファイル | 内容 |
| --- | --- |
| `screenshots/...` | |

## 学び・記事用メモ

- 

## トラブルシュート（あれば）

- 現象:
- 原因:
- 対処:
