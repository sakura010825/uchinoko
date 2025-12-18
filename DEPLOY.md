# インターネット公開手順

このアプリをインターネット上で公開する方法を説明します。

## 推奨方法: Vercel（最も簡単）

VercelはNext.jsの開発元が提供するホスティングサービスで、GitHubと連携して自動デプロイが可能です。

### 前提条件

1. **GitHubアカウント**を持っていること
2. **GitHubリポジトリ**にコードをプッシュしていること

### デプロイ手順

#### 1. GitHubにコードをプッシュ

まだGitHubにプッシュしていない場合：

```bash
# Gitリポジトリの初期化（まだの場合）
git init

# リモートリポジトリを追加（GitHubでリポジトリを作成後）
git remote add origin https://github.com/あなたのユーザー名/uchinoko.git

# ファイルをコミット
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git push -u origin main
```

#### 2. Vercelに登録・ログイン

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択してGitHubアカウントでログイン

#### 3. プロジェクトをインポート

1. Vercelのダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択
3. 「Import」をクリック

#### 4. 環境変数の設定

Vercelのプロジェクト設定画面で、以下の環境変数を設定します：

**Firebase設定:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Gemini API:**
- `GEMINI_API_KEY`

設定方法：
1. プロジェクト設定画面で「Environment Variables」を開く
2. 各環境変数を追加
3. 「Save」をクリック

#### 5. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待つ（通常1-3分）
3. デプロイが完了すると、URLが表示されます（例: `https://uchinoko.vercel.app`）

#### 6. カスタムドメインの設定（オプション）

独自ドメインを使用する場合：
1. プロジェクト設定で「Domains」を開く
2. ドメイン名を入力
3. DNS設定の指示に従って設定

### 自動デプロイ

GitHubにプッシュするたびに、自動的にデプロイが実行されます。

---

## 代替方法: Firebase Hosting

既にFirebaseを使用しているため、Firebase Hostingも選択肢の一つです。

### 前提条件

1. Firebase CLIがインストールされていること
2. Firebaseプロジェクトが作成されていること

### デプロイ手順

#### 1. Firebase CLIのインストール

```bash
npm install -g firebase-tools
```

#### 2. Firebaseにログイン

```bash
firebase login
```

#### 3. Firebaseプロジェクトの初期化

```bash
firebase init hosting
```

以下の質問に答えます：
- **What do you want to use as your public directory?** → `out`（Next.jsの静的エクスポートの場合）または `.next`（SSRを使用する場合）
- **Configure as a single-page app?** → `No`
- **Set up automatic builds and deploys with GitHub?** → `Yes`（推奨）または `No`

#### 4. Next.jsの設定

`next.config.js`で静的エクスポートを有効にする場合：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静的エクスポート
  images: {
    unoptimized: true, // 画像最適化を無効化（静的エクスポートの場合）
  },
}
```

ただし、このアプリはFirebase AuthenticationやAPI Routesを使用しているため、**静的エクスポートは推奨されません**。

#### 5. Firebase Hostingの設定ファイル作成

`firebase.json`を作成：

```json
{
  "hosting": {
    "public": ".next",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 6. ビルドとデプロイ

```bash
# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

---

## その他の選択肢

### Netlify

1. [Netlify](https://www.netlify.com) に登録
2. GitHubリポジトリを連携
3. ビルドコマンド: `npm run build`
4. 公開ディレクトリ: `.next`
5. 環境変数を設定

### AWS Amplify / Google Cloud Run / Azure Static Web Apps

各クラウドプロバイダーのホスティングサービスも利用可能ですが、設定が複雑になります。

---

## デプロイ後の確認事項

### 1. 環境変数の確認

本番環境で正しく動作するか確認：
- Firebase Authenticationが動作するか
- Firestoreへの接続が正常か
- Gemini APIが呼び出せるか

### 2. Firebase設定の確認

Firebase Consoleで以下を確認：
- **Authentication**: 承認済みドメインに本番URLを追加
- **Firestore**: セキュリティルールが適切に設定されているか
- **Storage**: セキュリティルールが適切に設定されているか

### 3. パフォーマンスの確認

- ページの読み込み速度
- 画像の最適化
- APIレスポンス時間

---

## トラブルシューティング

### ビルドエラー

- `npm run build`をローカルで実行してエラーを確認
- TypeScriptの型エラーを修正
- 環境変数が正しく設定されているか確認

### 環境変数が読み込まれない

- Vercel/Firebase Hostingの環境変数設定を確認
- `NEXT_PUBLIC_`プレフィックスが必要な変数が正しく設定されているか確認
- デプロイ後に再ビルドが必要な場合があります

### Firebase認証エラー

- Firebase Consoleで承認済みドメインに本番URLを追加
- Firebase設定（`NEXT_PUBLIC_FIREBASE_*`）が正しいか確認

---

## 推奨: Vercelを使用する理由

1. **Next.jsに最適化**: Next.jsの開発元が提供するため、最適な設定が自動で適用される
2. **簡単な設定**: GitHubと連携するだけで自動デプロイ
3. **無料プラン**: 個人プロジェクトには十分な無料プランがある
4. **高速**: グローバルCDNで高速配信
5. **プレビュー**: プルリクエストごとにプレビューURLが自動生成される

---

## 次のステップ

デプロイが完了したら：

1. 本番URLをメモしておく
2. 動作確認を行う
3. 必要に応じてカスタムドメインを設定
4. 定期的にバックアップを取る（Firestoreデータなど）












