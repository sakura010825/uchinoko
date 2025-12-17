# 動作確認ガイド

このドキュメントは、プロジェクトの環境構築と動作確認の手順を説明します。

## 前提条件

- Node.js 18以上がインストールされていること
- npm または yarn が利用可能であること

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

インストールが完了するまで数分かかる場合があります。

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API設定
GEMINI_API_KEY=your_gemini_api_key_here
```

**重要**: `.env.local`ファイルは`.gitignore`に含まれているため、Gitにはコミットされません。

### 3. Firebase設定の確認

Firebase Consoleで以下を確認してください：

- [ ] Firestoreデータベースが作成されている
- [ ] Storageバケットが作成されている
- [ ] Authenticationが有効になっている（Email/Password）
- [ ] Firestoreセキュリティルールがデプロイされている（`firestore.rules`を参照）
- [ ] Storageセキュリティルールがデプロイされている（`storage.rules`を参照）

### 4. ビルドの確認

```bash
npm run build
```

ビルドが成功することを確認してください。エラーがある場合は修正が必要です。

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 動作確認チェックリスト

### 基本動作

- [ ] トップページが表示される
- [ ] ヘッダーが表示される
- [ ] ナビゲーションメニューが表示される

### 認証機能

- [ ] 新規登録ページ（`/auth/signup`）が表示される
- [ ] ログインページ（`/auth/login`）が表示される
- [ ] 新規登録ができる（テスト用のメールアドレスとパスワードで）
- [ ] ログインができる
- [ ] ログアウトができる

### うちの子手帳機能

- [ ] うちの子手帳作成ページ（`/techo/create`）が表示される
- [ ] うちの子手帳が作成できる
- [ ] うちの子手帳一覧ページ（`/techo`）が表示される
- [ ] うちの子手帳が編集できる

### 投稿機能

- [ ] 投稿作成ページ（`/post/create`）が表示される
- [ ] 画像がアップロードできる
- [ ] HEICファイルが変換される（HEICファイルがある場合）
- [ ] AI翻訳が生成される（Gemini APIキーが設定されている場合）
- [ ] 投稿が作成できる
- [ ] 投稿一覧ページ（`/posts`）が表示される
- [ ] 投稿詳細ページ（`/post/[id]`）が表示される
- [ ] 投稿が編集できる（自分の投稿の場合）
- [ ] 投稿が削除できる（自分の投稿の場合）

### カリカリ機能

- [ ] 投稿にカリカリ（いいね）ができる
- [ ] カリカリが解除できる
- [ ] カリカリ数が正しく表示される

### スタンプチャレンジ

- [ ] スタンプチャレンジページ（`/stamp-challenge`）が表示される
- [ ] 投稿数が正しくカウントされる
- [ ] 進捗バーが表示される
- [ ] 8投稿でスタンプがダウンロードできる

### シェア機能

- [ ] シェアダイアログが開く
- [ ] おみくじ結果が表示される
- [ ] シェア画像が生成される
- [ ] 画像がダウンロードできる

### 検索機能

- [ ] 検索ボックスが表示される
- [ ] 検索が動作する
- [ ] 検索結果が表示される

## トラブルシューティング

### エラー: "Module not found"

依存関係がインストールされていない可能性があります。以下を実行してください：

```bash
npm install
```

### エラー: "Firebase: Error (auth/configuration-not-found)"

`.env.local`ファイルが正しく設定されているか確認してください。環境変数名が`NEXT_PUBLIC_`で始まっているか確認してください。

### エラー: "Gemini API key is not set"

`.env.local`に`GEMINI_API_KEY`が設定されているか確認してください。サーバーを再起動してください。

### エラー: "Permission denied"

Firestore と Storage のセキュリティルールを確認してください。Firebase Consoleでルールが正しくデプロイされているか確認してください。

### ビルドエラー

TypeScriptの型エラーやリンターエラーがある可能性があります。以下を実行して確認してください：

```bash
npm run lint
```

## 次のステップ

動作確認が完了したら、本番環境へのデプロイを検討してください。

- Vercelへのデプロイ: [Vercel Documentation](https://vercel.com/docs)
- Firebase Hostingへのデプロイ: `firebase deploy --only hosting`













