# Vercelでデプロイする完全ガイド

このガイドでは、ステップバイステップでVercelにデプロイする方法を説明します。

## 📋 前提条件

- GitHubアカウントを持っていること
- `.env.local`ファイルに環境変数が設定されていること

---

## ステップ1: GitHubにコードをプッシュ

### 1-1. Gitリポジトリの初期化（まだの場合）

プロジェクトフォルダで以下を実行：

```bash
git init
```

### 1-2. ファイルをステージング

```bash
git add .
```

### 1-3. 初回コミット

```bash
git commit -m "Initial commit: うちの子の気持ちアプリ"
```

### 1-4. GitHubでリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `uchinoko`）
4. 「Public」または「Private」を選択
5. 「Create repository」をクリック

### 1-5. リモートリポジトリを追加してプッシュ

GitHubでリポジトリを作成すると表示されるURLを使用：

```bash
# リモートリポジトリを追加（URLはGitHubで表示されるものを使用）
git remote add origin https://github.com/あなたのユーザー名/uchinoko.git

# ブランチ名をmainに変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**注意**: 初回プッシュ時、GitHubのユーザー名とパスワード（またはPersonal Access Token）の入力が求められます。

---

## ステップ2: Vercelに登録・ログイン

### 2-1. Vercelにアクセス

1. ブラウザで [https://vercel.com](https://vercel.com) を開く

### 2-2. アカウント作成

1. 「Sign Up」ボタンをクリック
2. 「Continue with GitHub」を選択
3. GitHubの認証画面で「Authorize Vercel」をクリック

これでVercelアカウントが作成され、GitHubと連携されます。

---

## ステップ3: プロジェクトをインポート

### 3-1. 新しいプロジェクトを作成

1. Vercelのダッシュボードで「Add New...」をクリック
2. 「Project」を選択

### 3-2. GitHubリポジトリを選択

1. リポジトリ一覧から `uchinoko`（または作成したリポジトリ名）を選択
2. 「Import」ボタンをクリック

---

## ステップ4: 環境変数を設定

### 4-1. 環境変数設定画面を開く

プロジェクト設定画面で「Environment Variables」セクションを開きます。

### 4-2. Firebase設定を追加

`.env.local`ファイルから以下の環境変数をコピーして追加：

| 環境変数名 | 説明 |
|-----------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase APIキー |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase認証ドメイン |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | FirebaseプロジェクトID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storageバケット |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging送信者ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | FirebaseアプリID |

**追加方法:**
1. 「Add New」ボタンをクリック
2. Key欄に環境変数名を入力
3. Value欄に値を入力
4. 「Save」をクリック
5. すべての環境変数を追加するまで繰り返す

### 4-3. Gemini APIキーを追加

| 環境変数名 | 説明 |
|-----------|------|
| `GEMINI_API_KEY` | Google Gemini APIキー |

同様の手順で追加します。

**重要**: `NEXT_PUBLIC_`で始まる環境変数は、ブラウザ側でも使用されるため、公開されても問題ない値であることを確認してください。

---

## ステップ5: デプロイ実行

### 5-1. デプロイを開始

1. 環境変数の設定が完了したら、画面下部の「Deploy」ボタンをクリック

### 5-2. ビルドの進行を確認

- ビルドログが表示され、進行状況を確認できます
- 通常、1-3分で完了します

### 5-3. デプロイ完了

- ビルドが成功すると、「Congratulations!」メッセージが表示されます
- デプロイされたURLが表示されます（例: `https://uchinoko-xxxxx.vercel.app`）

---

## ステップ6: Firebase設定の更新（重要）

### 6-1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com) にログイン
2. プロジェクトを選択

### 6-2. 承認済みドメインを追加

1. **Authentication** → **Settings** → **Authorized domains** を開く
2. 「Add domain」をクリック
3. VercelのURL（例: `uchinoko-xxxxx.vercel.app`）を入力
4. 「Add」をクリック

これにより、VercelでデプロイされたアプリからFirebase認証が使用できるようになります。

### 6-3. セキュリティルールの確認

**Firestore:**
- **Firestore Database** → **Rules** で、本番環境用のルールが適切に設定されているか確認

**Storage:**
- **Storage** → **Rules** で、本番環境用のルールが適切に設定されているか確認

---

## ステップ7: 動作確認

### 7-1. アプリにアクセス

デプロイされたURL（例: `https://uchinoko-xxxxx.vercel.app`）にブラウザでアクセスします。

### 7-2. 主要機能を確認

以下を確認してください：

- ✅ トップページが表示される
- ✅ ログイン・新規登録が動作する
- ✅ うちの子手帳の作成・編集が動作する
- ✅ 投稿の作成が動作する
- ✅ AI翻訳が動作する
- ✅ プロフィール画面で年齢が表示される

---

## 自動デプロイの設定

### GitHubにプッシュするたびに自動デプロイ

Vercelは、GitHubリポジトリにプッシュするたびに自動的にデプロイを実行します。

**動作:**
- `main`ブランチにプッシュ → 本番環境にデプロイ
- 他のブランチにプッシュ → プレビュー環境にデプロイ
- プルリクエストを作成 → プレビューURLが自動生成

### デプロイの確認方法

1. Vercelのダッシュボードで「Deployments」タブを開く
2. デプロイ履歴とステータスを確認できます

---

## トラブルシューティング

### ビルドエラーが発生する

**原因:**
- TypeScriptの型エラー
- 環境変数が不足している
- 依存関係の問題

**対処法:**
1. ローカルで `npm run build` を実行してエラーを確認
2. エラーを修正
3. GitHubにプッシュして再デプロイ

### 環境変数が読み込まれない

**原因:**
- 環境変数名のタイプミス
- `NEXT_PUBLIC_`プレフィックスの欠如

**対処法:**
1. Vercelの環境変数設定を確認
2. 環境変数名が正確か確認
3. デプロイを再実行

### Firebase認証が動作しない

**原因:**
- 承認済みドメインにVercelのURLが追加されていない

**対処法:**
1. Firebase Consoleで承認済みドメインを確認
2. VercelのURLを追加
3. ブラウザをリロード

### 画像が表示されない

**原因:**
- Firebase Storageのセキュリティルール
- CORS設定

**対処法:**
1. Firebase Storageのセキュリティルールを確認
2. 本番環境用のルールが適切に設定されているか確認

---

## カスタムドメインの設定（オプション）

独自ドメインを使用する場合：

1. Vercelのプロジェクト設定で「Domains」を開く
2. ドメイン名を入力
3. DNS設定の指示に従って設定
4. 設定完了後、Firebase Consoleの承認済みドメインにも追加

---

## 次のステップ

デプロイが完了したら：

1. **パフォーマンスの確認**: Vercelのダッシュボードでパフォーマンスメトリクスを確認
2. **エラーログの監視**: Vercelの「Logs」タブでエラーを確認
3. **カスタムドメインの設定**: 独自ドメインを使用する場合
4. **SEO設定**: メタタグやOGPの設定を確認

---

## まとめ

Vercelでのデプロイは以下の手順で完了します：

1. ✅ GitHubにコードをプッシュ
2. ✅ Vercelに登録・ログイン
3. ✅ プロジェクトをインポート
4. ✅ 環境変数を設定
5. ✅ デプロイ実行
6. ✅ Firebase設定を更新
7. ✅ 動作確認

これで、インターネット上でアプリにアクセスできるようになります！










