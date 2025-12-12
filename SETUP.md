# セットアップガイド

「うちの子の気持ち」のセットアップ手順を詳しく説明します。

## 前提条件

- Node.js 18以上
- npm または yarn
- Firebase プロジェクト
- Google Gemini API キー

## 1. リポジトリのクローン

```bash
git clone <repository-url>
cd uchinoko
```

## 2. 依存関係のインストール

```bash
npm install
```

## 3. 環境変数の設定

`.env.local`ファイルを作成し、`.env.example`を参考に環境変数を設定してください。

```bash
cp .env.example .env.local
```

`.env.local`ファイルを編集して、実際の値を設定します。

### Firebase設定の取得方法

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクトの設定（⚙️アイコン）を開く
4. 「アプリを追加」→「ウェブ」を選択
5. 表示される設定値を`.env.local`にコピー

### Gemini API キーの取得方法

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 「Create API Key」をクリック
3. 生成されたAPIキーを`.env.local`の`GEMINI_API_KEY`に設定

## 4. Firebase プロジェクトの初期化

```bash
# Firebase CLIがインストールされていない場合
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化
firebase init
```

初期化時に以下を選択：
- ✅ Firestore
- ✅ Storage
- ✅ Hosting（オプション）

## 5. Firestore セキュリティルールの設定

Firebase Consoleで以下のコレクションを作成：
- `uchinoKoTecho`
- `posts`
- `karikari`

セキュリティルールは`firestore.rules`ファイルを参照してください（必要に応じて作成）。

## 6. Storage セキュリティルールのデプロイ

```bash
firebase deploy --only storage
```

または、Firebase Consoleから直接設定することもできます。

## 7. Firestore インデックスの作成

Firebase Consoleで以下のインデックスを作成：

**コレクション: posts**
- フィールド: `createdAt` (降順)

## 8. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## トラブルシューティング

### エラー: "Firebase: Error (auth/configuration-not-found)"
- `.env.local`ファイルが正しく設定されているか確認
- 環境変数の名前が`NEXT_PUBLIC_`で始まっているか確認

### エラー: "Gemini API key is not set"
- `.env.local`に`GEMINI_API_KEY`が設定されているか確認
- サーバーを再起動

### エラー: "Permission denied"
- Firestore と Storage のセキュリティルールを確認
- 認証が正しく設定されているか確認

### 画像がアップロードできない
- Storage セキュリティルールを確認
- ファイルサイズが5MB以下か確認
- ファイル形式が許可されているか確認

## 本番環境へのデプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com)にアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

### Firebase Hosting へのデプロイ

```bash
npm run build
firebase deploy --only hosting
```

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。



