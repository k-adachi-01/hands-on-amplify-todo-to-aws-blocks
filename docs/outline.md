# ハンズオン記事構成（実行版）

> 詳細な更新履歴・執筆メモは親ワークスペースの
> `docs/hands-on-amplify-todo-to-blocks-outline.md` を参照。
> **公開リポジトリ上の正本は本ファイルと `docs/chapters/` である。**

## リポジトリの位置づけ

本リポジトリ（`hands-on-walkthrough`）は、記事「Amplify Todo を AWS Blocks で書き直す」の**再現用リポジトリ**である。

- 起点: [aws-samples/amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template)
- 移行: in-place（`npx @aws-blocks/create-blocks-app .` → 段階的書き換え）
- 環境: **Nix dev shell** 内で npm を実行（ホスト環境を汚さない）

## Git タグ

| タグ | 内容 |
| --- | --- |
| `phase-0-amplify-baseline` | クローン + Amplify Sandbox 確認済み |
| `phase-1-blocks-scaffold` | `create-blocks-app .` 直後 |
| `chapter-1-minimal-crud` | 認証なし Todo CRUD |
| `chapter-2-cognito-auth` | Cognito + ユーザー分離 |
| `chapter-3-advanced` | Realtime / index 等（任意） |

## 章一覧

| 章 | ディレクトリ | 状態 |
| --- | --- | --- |
| Phase 0 | [chapters/00-clone-and-amplify-baseline](chapters/00-clone-and-amplify-baseline/) | Sandbox 完了・Authenticator スクショ済 |
| Phase 1 | [chapters/01-blocks-scaffold](chapters/01-blocks-scaffold/) | 完了 |
| 第1章 | [chapters/02-chapter1-minimal-crud](chapters/02-chapter1-minimal-crud/) | 完了・API 検証済 |
| 第2章 | [chapters/03-chapter2-cognito-auth](chapters/03-chapter2-cognito-auth/) | 完了（verify:chapter2 + UI スクショ） |
| 第3章 | [chapters/04-chapter3-advanced](chapters/04-chapter3-advanced/) | 完了（verify:chapter3） |

**公開リポジトリ:** https://github.com/k-adachi-01/hands-on-amplify-todo-to-aws-blocks

記事初稿: [ARTICLE-DRAFT.md](ARTICLE-DRAFT.md)

## 公開時の注意

GitHub 公開時は **本リポジトリのみ** を push する。親ワークスペースの `aws-blocks/` サンプル群などハンズオン無関係のディレクトリは含めない。

秘密情報（`amplify_outputs.json` の API Key 等）は `.gitignore` 済み。資料用は `snapshots/` にマスク版のみ置く。
