# ハンズオン記事構成：Amplify Todo を AWS Blocks で書き直す

作成日: 2026-06-23  
ステータス: 執筆中（ハンズオン実行並行）  
想定読者: AWS Amplify Gen 2 の Todo クイックスタートを触ったことがあるフロントエンド寄りの開発者

## 実行リポジトリ（公開予定）

ハンズオンの**正本**は [`hands-on-walkthrough/`](../hands-on-walkthrough/)（独立 Git リポジトリ）である。

- 起点: [aws-samples/amplify-vite-react-template](https://github.com/aws-samples/amplify-vite-react-template) @ `a7f2a70`
- 移行: in-place（`npx @aws-blocks/create-blocks-app .`）
- 環境: **Nix dev shell** 内で npm を実行（`nix develop`）
- 資料: `hands-on-walkthrough/docs/chapters/` にログ・snapshots・diffs を章ごとに保存
- 公開: 本リポジトリのみ GitHub push。親ワークスペースの他サンプルは含めない

## 記事タイトル案

- **本命:** Amplify の Todo チュートリアルを AWS Blocks で書き直す — バックエンドの中身が見えるハンズオン
- **副題案:** モデル CRUD から domain API へ。同じ Todo アプリで学ぶ Amplify と Blocks の違い

## 記事の目的

読者がハンズオンを終えたとき、次を説明できる状態にする。

1. Amplify の `defineData` + `client.models.*` と、Blocks の `aws-blocks/index.ts` + `api.*` の対応関係
2. 「モデルを宣言する」方式と「API 関数を書く」方式の違い
3. AWS Blocks でローカル開発（AWS アカウント不要）→ 同じコードで AWS デプロイ、という流れ
4. ログインユーザーごとにデータを分離するバックエンドの基本形

## 記事の位置づけ

| 項目 | 内容 |
| --- | --- |
| 形式 | ハンズオン（Before: Amplify / After: Blocks） |
| 題材 | Todo アプリ（Amplify 公式クイックスタート相当） |
| 進め方 | 3 段階。いきなり完成版 Blocks テンプレート全部は載せない |
| 初回記事のゴール | 第1章 + 第2章まで（最小 CRUD + ログイン付きユーザー分離） |
| 発展編 | 第3章（Realtime / index / toggle など）は別セクションまたは続編 |

## 参照素材

| 用途 | パス |
| --- | --- |
| **実行・記録（正本）** | `hands-on-walkthrough/` |
| 章ごとの手順・ログ | `hands-on-walkthrough/docs/chapters/` |
| Blocks 完成形（参照のみ） | 親 WS `blocks-vite-react-template/` |
| 比較ドキュメント | `docs/backend-beginner-template-differences.md` 等 |

## 前提条件（読者向けに明記）

- [Nix](https://nixos.org/download/)（flakes 対応）— Node.js / npm は dev shell 内のみ使用
- AWS Amplify Gen 2 の Todo クイックスタートを読んだ、または触った経験
- React の基本（useState, useEffect）
- **Phase 0 から AWS アカウント必要**（`npx ampx sandbox`）
- 第1章以降の Blocks ローカル開発（`npm run blocks:dev`）は Sandbox なしでも可

## 想定所要時間

| 範囲 | 時間 |
| --- | --- |
| 第1章のみ | 45〜60 分 |
| 第1章 + 第2章（初回記事の推奨範囲） | 90〜120 分 |
| 第3章まで含む | 150〜180 分 |

---

## 全体構成

```
0. はじめに
1. 完成イメージと概念マップ
1.5 Phase 0 — GitHub クローン + Amplify Sandbox ベースライン
1.6 Phase 1 — create-blocks-app . で Blocks 統合
2. 第1章 — 最小 CRUD（Blocks api.*）
3. 第2章 — Cognito 連携 + ユーザー分離（CognitoVerifier）
4. 第3章 — 発展（Realtime / ソート / 更新・削除）※任意
5. Amplify ↔ Blocks 対応表
6. AWS へのデプロイ（概要）
7. まとめ
付録（Blocks-native 移行 / AuthBasic）
```

---

## 0. はじめに

### 書くこと

- この記事で何を作るか（Todo アプリ。UI は Amplify 版と似せる）
- なぜ Amplify から書き換えるのか
    - Amplify quickstart は動くが、バックエンドの処理順が見えにくい
    - Todo モデルが `publicApiKey()` で、Auth 定義とつながっていない
- Blocks の一言説明
    - `aws-blocks/index.ts` にバックエンドを書く
    - ローカルではモック、デプロイ時は CDK が AWS リソースを生成
- 記事の進め方（第1章 → 第2章 → 第3章）

### 読者への約束

> Amplify 版は「少ないコードで使える」。Blocks 版は「バックエンドの中身が見える」。

### 載せないこと

- AWS Blocks の全 Block カタログ
- Amplify と Blocks の詳細な選定指針（別記事向け）

---

## 1. 完成イメージと概念マップ

### 1-1. Before / After のスクリーンショット

- Amplify 版: シンプルな Todo 一覧 + 「+ new」ボタン
- Blocks 版（第2章完了時点）: ログイン UI + Todo 追加フォーム + 一覧
- Blocks 版（第3章完了時点）: 優先度、ソート、完了トグル（発展編として提示）

### 1-2. アーキテクチャ比較（1 枚図）

**Amplify 版**

```
React → Amplify Data Client → Amplify Backend (AppSync/DynamoDB)
         client.models.Todo.*
```

**Blocks 版**

```
React → api / authApi → Blocks dev server（ローカル）/ Lambda（本番）
         aws-blocks/index.ts
              ├ AuthBasic
              ├ DistributedTable
              ├ Realtime（第3章）
              └ ApiNamespace
```

PlantUML は `docs/template-comparison.md` の図を流用または簡略化。

### 1-3. ファイル対応表（概念）

| 役割 | Amplify | Blocks |
| --- | --- | --- |
| データ定義 | `amplify/data/resource.ts` | `aws-blocks/index.ts` の `DistributedTable` + Zod schema |
| 認証定義 | `amplify/auth/resource.ts` | `aws-blocks/index.ts` の `CognitoVerifier`（統合パス） |
| フロントからの呼び出し | `client.models.Todo.create()` | `api.createTodo()` |
| バックエンド設定の読み込み | `amplify_outputs.json` | `aws-blocks/client.js`（生成） |
| ローカル開発 | Vite のみ（backend は sandbox 依存） | Phase 1 以降: `npm run blocks:dev` + `npm run dev` |

---

## 1.5 Phase 0 — GitHub クローン + Amplify ベースライン

**ゴール:** 公式テンプレートの Todo を Sandbox + Vite で動かし「Before」を記録する。

### 手順

```bash
git clone https://github.com/aws-samples/amplify-vite-react-template.git hands-on-walkthrough
cd hands-on-walkthrough
nix develop
npm install
```

**ターミナル A:** `npx ampx sandbox`  
**ターミナル B:** `npm run dev`

### 記録するもの

- 上流 commit hash、`npm install` ログ（`docs/chapters/00-.../commands/`）
- `amplify/data/resource.ts` / `src/App.tsx` の snapshots
- `amplify_outputs.json` は **マスク版のみ** snapshots に（生ファイルは gitignore）
- スクリーンショット: 初回画面、Todo 作成後
- git tag: `phase-0-amplify-baseline`

---

## 1.6 Phase 1 — Blocks スキャフォールド

**ゴール:** 同一リポジトリに Blocks を載せる。

```bash
nix develop
npx @aws-blocks/create-blocks-app .
```

Amplify 検出時は `CognitoVerifier` 付き scaffold が生成される。git tag: `phase-1-blocks-scaffold`

---

## 2. 第1章 — 最小 CRUD を Blocks で再現

**ゴール:** Amplify Data から Blocks `api.createTodo` / `api.listTodos` へ切り替え。

### 2-1. 前提（Phase 0 / 1 完了）

新規 `create-blocks-app --template react` ではなく、Phase 1 済みリポジトリ上で `aws-blocks/index.ts` と `src/App.tsx` を書き換える。

### 2-2. Amplify 版のおさらい（Phase 0 snapshots を引用）

- `Todo` モデルは `content` フィールドのみ
- `authorization: publicApiKey()` — **誰でも読み書きできる**
- フロントは `client.models.Todo.create()` / `observeQuery()`

ここで「Amplify はモデルを宣言すると CRUD が自動で生える」と説明。

### 2-3. Blocks 版 — 最小の `aws-blocks/index.ts`

第1章では **認証なし・Realtime なし** の最小版を書く。

#### 実装する Block

| Block | 用途 |
| --- | --- |
| `Scope` | リソースの名前空間 |
| `DistributedTable` | Todo 永続化（ローカル mock / 本番 DynamoDB） |
| `ApiNamespace` | `createTodo`, `listTodos` |

#### データモデル（第1章版）

```typescript
const todoSchema = z.object({
    todoId: z.string(),
    content: z.string(),
    createdAt: z.number(),
});

const todos = new DistributedTable(scope, 'todos', {
    schema: todoSchema,
    key: { partitionKey: 'todoId' },
});
```

- Amplify の `content` だけに近づける意図を説明
- `userId` は第2章で追加（第1章では全員共通の Todo でよい）

#### API（第1章版）

```typescript
export const api = new ApiNamespace(scope, 'api', (context) => ({
    async createTodo(content: string) { /* put */ },
    async listTodos() { /* query or scan */ },
}));
```

- `context` は第2章まで触れない（または「後で使う」と一言）

### 2-4. フロントエンドの書き換え

Amplify 版:

```typescript
client.models.Todo.create({ content });
client.models.Todo.observeQuery().subscribe(...);
```

Blocks 版:

```typescript
await api.createTodo(content);
setTodos(await api.listTodos());
```

- `observeQuery` の代わりに、第1章では **作成後に手動で `listTodos` を呼ぶ**
- Realtime は第3章で補う

### 2-5. ローカル起動

```bash
nix develop
npm run blocks:dev   # ターミナル A
npm run dev          # ターミナル B
```
- **AWS アカウント不要** を強調
- `.bb-data/` にローカルデータが保存される（任意で触って確認）

### 2-6. 第1章の振り返り

読者が理解すべきポイント:

1. Amplify の「モデル CRUD」が、Blocks では「API 関数」になった
2. バックエンドの処理（保存・取得）が `aws-blocks/index.ts` に見える
3. フロントは `import { api } from 'aws-blocks'` で型安全に呼べる

---

## 3. 第2章 — ログイン付き Todo（ユーザー分離）

**ゴール:** 「自分の Todo だけ見える」アプリにする。Amplify quickstart が教えてくれない部分の核心。

### 3-1. Amplify 版の課題を示す

- `amplify/auth/resource.ts` には email login がある
- しかし Todo は `allow.publicApiKey()` — **Auth と Data が未接続**
- ログインユーザーごとに分離するには authorization rule の理解が必要

→ Blocks（Amplify 統合パス）では `CognitoVerifier` + API 内 `auth.requireAuth(context)` + `userId` キー設計、という対比。

### 3-2. CognitoVerifier（AuthBasic は付録）

Phase 1 scaffold の `CognitoVerifier` を Todo API に適用する。`AuthBasic` / `AccountMenuBar` は **Blocks-native 移行の付録** で紹介。

```typescript
const auth = new CognitoVerifier({
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_CLIENT_ID!,
    tokenUse: 'id',
});
```

- フロント: `@aws-amplify/ui-react` の `Authenticator` でサインイン → Blocks API

### 3-3. データモデルの拡張

```typescript
const todoSchema = z.object({
    userId: z.string(),      // partition key — ユーザーごとに分離
    todoId: z.string(),      // sort key
    title: z.string(),       // content から改名（UI と揃える）
    completed: z.boolean(),
    createdAt: z.number(),
});

const todos = new DistributedTable(scope, 'todos', {
    schema: todoSchema,
    key: { partitionKey: 'userId', sortKey: 'todoId' },
});
```

- **partition key / sort key** を初めて説明（DynamoDB 的な考え方）
- 「ユーザーごとに Todo を分ける」がキー設計の理由

### 3-4. API に認証を組み込む

各 API の先頭:

```typescript
const user = await auth.requireAuth(context);
```

保存時:

```typescript
userId: user.sub,
```

取得時:

```typescript
todos.query({ where: { userId: { equals: user.sub } } })
```

- 処理の流れを番号付きで説明（比較 doc の 3-3 節と同じ）
    1. ログイン済みか確認
    2. ID を生成
    3. データを組み立て
    4. テーブルに保存
    5. 結果を返す

### 3-5. フロントエンドの更新

- `Authenticator` でログイン後に Todo UI を表示
- `api.createTodo(content)` / `api.listTodos()`
- 2 ユーザーで Todo 分離を検証

### 3-6. 第2章の振り返り

- Amplify の authorization rule vs Blocks の `requireAuth` + `userId`
- 「バックエンド API は domain 操作を公開する」という実務寄りの形
- **初回記事はここで一区切り** — 読者は「Blocks の基本」を掴める

---

## 4. 第3章 — 発展（任意 / 続編向け）

**ゴール:** `blocks-vite-react-template` 相当の機能を段階的に追加。

第3章は初回記事から外してもよい。載せる場合の章立て。

### 4-1. 更新・削除 API

- `toggleTodo(todoId)` — 完了状態の切り替え
- `deleteTodo(todoId)`
- `updatePriority(todoId, priority)`

### 4-2. Secondary Index とソート

```typescript
indexes: {
    byPriority: { partitionKey: 'userId', sortKey: 'priority' },
    byTitle: { partitionKey: 'userId', sortKey: 'title' },
},
```

- `listTodos(sortBy?: 'priority' | 'title')`

### 4-3. 楽観的ロック（任意）

- `version` フィールド + `ifFieldEquals`
- 初心者向け記事では **概要のみ** または省略可

### 4-4. Realtime 通知

```typescript
const realtime = new Realtime(scope, 'live', { namespaces: { ... } });
await realtime.publish('todos', user.username, { action: 'created', todoId });
```

- フロント: `api.subscribeTodos()` → channel.subscribe → `load()` 再実行
- Amplify の `observeQuery()` との対比

### 4-5. 第3章の振り返り

- domain API に side effect（通知）を載せられる Blocks の強み
- Amplify では model イベント + subscription ルールの理解が必要

---

## 5. Amplify ↔ Blocks 対応表（記事内に掲載）

| やりたいこと | Amplify | Blocks |
| --- | --- | --- |
| データモデル定義 | `a.model({ content: a.string() })` | `DistributedTable` + Zod schema |
| 作成 | `client.models.Todo.create({ content })` | `api.createTodo(title)` |
| 一覧 | `client.models.Todo.list()` または `observeQuery()` | `api.listTodos()` |
| リアルタイム更新 | `observeQuery().subscribe()` | `api.subscribeTodos()` + Realtime |
| 認可（自分のデータのみ） | `.authorization((allow) => [allow.owner()])` 等 | `auth.requireAuth(context)` + `userId` |
| バックエンドの中心ファイル | `amplify/data/resource.ts` | `aws-blocks/index.ts` |
| ローカル開発 | sandbox または mock 限定的 | `npm run dev`（AWS 不要） |
| デプロイ | `ampx pipeline-deploy` / Amplify Hosting | `npm run sandbox` / CDK |

---

## 6. AWS へのデプロイ（概要）

初回記事では **触るだけ・詳細は別記事** に留める。

### 書くこと

```bash
npm run sandbox
```

- 同じ `aws-blocks/index.ts` から CDK が DynamoDB / Lambda 等を生成
- デプロイ後もフロントの呼び方は変わらない（`api.*` のまま）
- `npm run sandbox:destroy` で片付け

### 載せないこと（別記事）

- CDK スタックの中身の詳細レビュー
- 本番 CI/CD パイプライン
- AuthBasic → AuthCognito への移行

---

## 7. まとめ

### 書くこと

- Amplify = モデル宣言 → 自動 CRUD。早く動かすのに向く
- Blocks = API 関数を書く → 認証・DB・通知の流れが見える
- 同じ Todo でも、バックエンドの「見え方」が根本的に違う
- 次のステップ（公式ドキュメント、Block カタログ、Cognito 移行）

### CTA

- [AWS Blocks Developer Guide](https://docs.aws.amazon.com/blocks/latest/devguide/what-is-blocks.html)
- リポジトリ内 `blocks-vite-react-template` の完成コード

---

## 付録

### A. 第1章完了時の `aws-blocks/index.ts` チェックリスト

- [ ] `Scope` を定義している
- [ ] `DistributedTable` に Zod schema がある
- [ ] `ApiNamespace` に `createTodo` / `listTodos` がある
- [ ] フロントから `api.createTodo` / `api.listTodos` が呼べる
- [ ] `npm run dev` で AWS アカウントなしで動く

### B. 第2章完了時のチェックリスト

- [ ] `CognitoVerifier` があり全 Todo API で `auth.requireAuth(context)` している
- [ ] `userId`（`user.sub`）を partition key にしている
- [ ] Amplify Authenticator でログイン後のみ Todo 操作できる
- [ ] 2 ユーザーでデータが分離される

### C. 執筆時の注意

1. **完成版テンプレートを最初から丸写ししない** — 段階的に積み上げる
2. Amplify 版の `publicApiKey()` は「quickstart の簡略化」と説明し、セキュリティ上の問題として軽く触れる
3. コード引用は `hands-on-walkthrough/docs/chapters/*/snapshots/` から取る
4. 実行ログは `scripts/log-run.sh` で `commands/*.log` に残す
5. 秘密情報はコミットしない（`.gitignore` + マスク snapshots）

### D. 関連ドキュメント

- `docs/backend-beginner-template-differences.md` — 初心者向け比較のたたき台
- `docs/template-comparison.md` — データフロー図、ファイル構成
- `docs/template-comparison-part2.md` — 設計思想、選定指針

### E. 執筆後の検証手順

1. 第1章のコードだけで `npm run dev` が通ることを確認
2. 第2章のコードでサインアップ → 作成 → 別ユーザーで一覧が分離されることを確認
3. 第3章を載せる場合、`blocks-vite-react-template` との diff が意図通りか確認

---

## 変更履歴

| 日付 | 内容 |
| --- | --- |
| 2026-06-23 | 初版作成。題材: Amplify Todo → Blocks Todo（3 段階リライト） |
| 2026-06-23 | 実行版: GitHub クローン起点、Nix、公開用 `hands-on-walkthrough`、CognitoVerifier パス |
