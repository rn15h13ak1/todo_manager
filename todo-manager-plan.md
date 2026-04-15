# todo-manager 実装計画

## 概要

ブラウザで動作するTODO管理ツール **todo-manager** を、React + Tailwind CSS で実装し、Vite でビルドして **単一の `index.html`** に集約する。

---

## 機能要件

### タスクデータ構造

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | ユニークID（UUID） |
| `title` | string | タスクタイトル |
| `description` | string | 説明（任意） |
| `dueDate` | string (ISO) | 期限日 |
| `priority` | `high` \| `medium` \| `low` | 優先度 |
| `status` | `todo` \| `in_progress` \| `done` | ステータス |
| `createdAt` | string (ISO) | 作成日時 |

### CRUD

- タスクの**追加・編集・削除**
- モーダルダイアログで入力

### ソート

| ソートキー | 説明 |
|---|---|
| 期限日（昇順） | 直近のタスクが上 |
| 期限日（降順） | 遠いタスクが上 |
| 優先度 | high → medium → low |
| 作成日 | 新しい順 |

### フィルター

| フィルター | 説明 |
|---|---|
| ステータス | `すべて` / `未着手` / `進行中` / `完了` |
| 優先度 | `すべて` / `高` / `中` / `低` |
| 期限切れのみ | 今日以前の未完了タスクを抽出 |

### データ永続化

- `localStorage` を使用して自動保存・自動読み込み
- タスク変更のたびに即時保存

### HTMLエクスポート機能

- 現在表示中のタスク一覧を**静的HTMLファイル**として出力
- タスクデータをテーブル形式で埋め込み
- スタイルもインライン化し、そのままブラウザで閲覧可能
- `Blob` + `<a download>` でダウンロード

---

## 技術構成

```
React 18
├── Vite（ビルドツール）
│   └── vite-plugin-singlefile（JS・CSSをHTMLにインライン化）
├── Tailwind CSS（スタイリング）
└── lucide-react（アイコン）
```

---

## ディレクトリ構成（ビルド前）

```
todo-manager/
├── index.html
├── vite.config.js
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx          # エントリーポイント
    ├── App.jsx           # ルートコンポーネント
    ├── index.css         # Tailwind ディレクティブ
    ├── components/
    │   ├── Header.jsx        # タイトル・追加ボタン
    │   ├── FilterBar.jsx     # フィルター・ソート操作
    │   ├── TaskList.jsx      # タスク一覧
    │   ├── TaskCard.jsx      # タスクカード
    │   └── TaskModal.jsx     # 追加・編集モーダル
    ├── hooks/
    │   └── useTasks.js       # タスク状態管理・localStorage連携
    └── utils/
        ├── storage.js        # localStorage ラッパー
        └── exportHtml.js     # HTMLエクスポート処理
```

---

## ビルドフロー

```
npm install
    ↓
npm run build（Vite）
    ↓
vite-plugin-singlefile が JS・CSS を index.html にインライン化
    ↓
dist/index.html（単一ファイル・完全動作）
```

---

## 成果物

| ファイル | 説明 |
|---|---|
| `dist/index.html` | ビルド済み単一HTMLファイル。ブラウザで直接開くだけで動作。 |

### 動作要件

- モダンブラウザ（Chrome / Firefox / Edge / Safari 最新版）
- サーバー不要、ローカルで `index.html` をダブルクリックするだけで起動

---

## UIレイアウト（概略）

```
┌──────────────────────────────────────────┐
│  📋 todo-manager        [+ タスク追加]    │
├──────────────────────────────────────────┤
│  ステータス: [すべて▼]  優先度: [すべて▼] │
│  ソート: [期限日▼]  [□ 期限切れのみ]     │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ タスクタイトル          [高] [進行中]│  │
│  │ 説明テキスト...                    │  │
│  │ 期限: 2026-05-01    [編集] [削除]  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ ...                               │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│              [📄 HTMLでエクスポート]       │
└──────────────────────────────────────────┘
```
