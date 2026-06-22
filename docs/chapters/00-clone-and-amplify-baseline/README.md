# Phase 0 — クローンと Amplify ベースライン

構成案: Phase 0 / 記事セクション 1.5

## 目的

公式 [amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) の Todo アプリを、改変前の状態で動かし「Before」を記録する。

## メタ情報

| 項目 | 値 |
| --- | --- |
| 上流テンプレート commit | `a7f2a70036f8d5007fcd510317e38d4540a5bc2f` |
| 本リポジトリ初期 commit | `6b48c4a`（テンプレート + Nix + docs 統合） |
| 実行日 | 2026-06-23 |
| Nix Node | v22.22.3 / npm 10.9.8（`nix develop` 内） |

## 手順 0-1: リポジトリ準備（完了）

本リポジトリは次の手順で初期化済みである。

```bash
# 公開用リポジトリとして独立管理（親ワークスペースとは別 git）
git clone https://github.com/aws-samples/amplify-vite-react-template.git hands-on-walkthrough
cd hands-on-walkthrough

# Nix dev shell（ホストに Node/npm を入れない）
nix develop

# 依存関係
npm install
```

ログ: [`commands/01-npm-install.log`](commands/01-npm-install.log)

## 手順 0-2: コード確認（Before）

### データモデル — `amplify/data/resource.ts`

- `Todo` は `content` のみ
- `authorization: allow.publicApiKey()` — **誰でも CRUD 可能**
- Auth 定義（`amplify/auth/resource.ts`）とは未接続

スナップショット: [`snapshots/resource.ts`](snapshots/resource.ts)（`amplify/data/resource.ts`）

### フロント — `src/App.tsx`

```typescript
client.models.Todo.create({ content });
client.models.Todo.observeQuery().subscribe(...);
```

スナップショット: [`snapshots/App.tsx`](snapshots/App.tsx)

## 手順 0-3: Amplify Sandbox + Vite（要 AWS 認証）

**2 ターミナル**で実行する。いずれも `nix develop` 内。

### ターミナル A — Sandbox

```bash
cd hands-on-walkthrough
nix develop
npx ampx sandbox
```

成功すると `amplify_outputs.json` が生成される（**gitignore 済み — コミットしない**）。

資料用には API Key 等をマスクした版のみ `snapshots/amplify_outputs.masked.json` に保存する。

### ターミナル B — フロント

```bash
cd hands-on-walkthrough
nix develop
npm run dev
```

ブラウザで http://localhost:5173（または Vite 表示ポート）を開く。

### 確認項目

- [ ] 初回画面が表示される → `screenshots/01-initial.png`
- [ ] 「+ new」で Todo 作成 → `screenshots/02-after-create.png`
- [ ] 一覧が `observeQuery` で更新される

### 実行環境メモ

自動実行環境では AWS 認証情報が未設定のため、Sandbox 起動ログのみ [`commands/02-ampx-sandbox-attempt.log`](commands/02-ampx-sandbox-attempt.log) に記録した。**読者環境では上記手順で Sandbox を完了すること。**

```bash
aws sts get-caller-identity   # 認証確認
aws configure list
```

## 手順 0-4: Sandbox 片付け（任意）

```bash
nix develop
npx ampx sandbox delete --yes
```

## 学び

- Amplify Gen 2 は `defineData` でモデルを宣言すると CRUD + subscription が自動生成される
- quickstart の Todo は `publicApiKey()` のため、バックエンドの認可設計を学びにくい
- ローカル Vite だけでは GraphQL API は動かず、Sandbox またはデプロイが必要

## git tag

```bash
git tag -a phase-0-amplify-baseline -m "Amplify template baseline before Blocks integration"
```

コード状態は Blocks 統合前。Sandbox 完了後にスクリーンショットを追加し、必要なら tag を annotated message で更新してよい。
