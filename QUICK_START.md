# クイックスタートガイド

「うちの子の気持ち」をすぐに始めるための手順です。

## 1. 依存関係のインストール

```bash
npm install
```

**注意**: インストールには数分かかる場合があります。完了するまでお待ちください。

## 2. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を設定してください：

```env
# Firebase設定（Firebase Consoleから取得）
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini API設定（Google AI Studioから取得）
GEMINI_API_KEY=your_gemini_api_key_here
```

### Firebase設定の取得方法

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを作成または選択
3. プロジェクト設定（⚙️アイコン）を開く
4. 「アプリを追加」→「ウェブ」を選択
5. 表示される設定値をコピーして`.env.local`に貼り付け

### Gemini APIキーの取得方法

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 「Create API Key」をクリック
3. 生成されたAPIキーを`.env.local`の`GEMINI_API_KEY`に設定

## 3. Firebase設定

### Firestoreデータベースの作成

1. Firebase Consoleで「Firestore Database」を開く
2. 「データベースを作成」をクリック
3. セキュリティルールを「テストモードで開始」または「本番モードで開始」を選択
4. ロケーションを選択

### Storageバケットの作成

1. Firebase Consoleで「Storage」を開く
2. 「始める」をクリック
3. セキュリティルールを確認
4. ロケーションを選択

### セキュリティルールのデプロイ

```bash
# Firebase CLIがインストールされていない場合
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化（まだの場合）
firebase init

# セキュリティルールをデプロイ
firebase deploy --only firestore,storage
```

または、Firebase Consoleから直接ルールを設定することもできます。

## 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 5. 動作確認

### 基本的な動作確認

1. **トップページ**: [http://localhost:3000](http://localhost:3000) が表示される
2. **新規登録**: `/auth/signup`でアカウントを作成
3. **ログイン**: `/auth/login`でログイン
4. **うちの子手帳作成**: `/techo/create`で猫のプロフィールを作成
5. **投稿作成**: `/post/create`で画像をアップロードし、AI翻訳を生成
6. **投稿一覧**: `/posts`で投稿一覧を確認

### よくある問題

#### エラー: "Firebase: Error (auth/configuration-not-found)"
- `.env.local`ファイルが正しく作成されているか確認
- 環境変数名が`NEXT_PUBLIC_`で始まっているか確認
- サーバーを再起動（Ctrl+Cで停止後、`npm run dev`で再起動）

#### エラー: "Gemini API key is not set"
- `.env.local`に`GEMINI_API_KEY`が設定されているか確認
- サーバーを再起動

#### エラー: "Permission denied"
- Firestore と Storage のセキュリティルールを確認
- Firebase Consoleでルールが正しく設定されているか確認

#### 画像がアップロードできない
- Storage セキュリティルールを確認
- ファイルサイズが5MB以下か確認
- ファイル形式が許可されているか確認（JPG, PNG, GIF, WebP, HEIC）

## 次のステップ

動作確認が完了したら、[CHECKLIST.md](./CHECKLIST.md)を参照して、すべての機能を確認してください。

詳細なセットアップ手順は[SETUP.md](./SETUP.md)を参照してください。














