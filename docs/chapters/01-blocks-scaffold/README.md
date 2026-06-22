# Phase 1 — Blocks スキャフォールド

## 目的

`npx @aws-blocks/create-blocks-app . --yes` で Amplify プロジェクトに Blocks を統合する。

## 実行コマンド

```bash
nix develop
npx @aws-blocks/create-blocks-app@latest . --yes
```

ログ: [`commands/01-create-blocks-app.log`](commands/01-create-blocks-app.log)

## 自動生成・変更された主なファイル

| 操作 | パス |
| --- | --- |
| CREATE | `aws-blocks/`（index.ts, index.cdk.ts, cognito-verifier.ts 等） |
| CREATE | `amplify/blocks.ts` |
| MODIFY | `amplify/backend.ts` |
| MODIFY | `package.json`（workspaces, blocks:dev, sandbox スクリプト） |
| MODIFY | `amplify.yml`（CDK conditions） |

diff: [`diffs/from-phase-0.patch`](diffs/from-phase-0.patch)

## 初期 scaffold の `aws-blocks/index.ts`

- `CognitoVerifier` + `KVStore` デモ（greet / putNote / getNote）
- 第1章で Todo 用 `DistributedTable` に差し替える

スナップショット: [`snapshots/aws-blocks-index.ts`](snapshots/aws-blocks-index.ts)

## ローカル開発（第1章以降）

Amplify 統合テンプレートには当初 `server.ts` が含まれないため、第1章で追加した。

```bash
nix develop
npm run dev    # Blocks dev server + Vite（ポート 3000）
```

## デプロイ（要 AWS）

```bash
npm run sandbox    # Amplify + Blocks
```

## git tag

`phase-1-blocks-scaffold`
