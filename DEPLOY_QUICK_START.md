# クイックスタート: Vercelでデプロイ

## 最短5分でデプロイする手順

### 1. GitHubにコードをプッシュ（まだの場合）

```bash
# Gitリポジトリの初期化
git init

# すべてのファイルをステージング
git add .

# コミット
git commit -m "Initial commit"

# GitHubでリポジトリを作成後、以下を実行
git remote add origin https://github.com/あなたのユーザー名/uchinoko.git
git branch -M main
git push -u origin main
```

### 2. Vercelでデプロイ

1. **Vercelにアクセス**: https://vercel.com
2. **「Sign Up」をクリック** → 「Continue with GitHub」を選択
3. **「Add New...」→「Project」をクリック**
4. **GitHubリポジトリを選択** → 「Import」をクリック

### 3. 環境変数を設定

プロジェクト設定画面で、以下の環境変数を追加：

#### Firebase設定（`.env.local`からコピー）
```
NEXT_PUBLIC_FIREBASE_API_KEY=あなたのAPIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=あなたのドメイン
NEXT_PUBLIC_FIREBASE_PROJECT_ID=あなたのプロジェクトID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=あなたのストレージバケット
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=あなたのメッセージング送信者ID
NEXT_PUBLIC_FIREBASE_APP_ID=あなたのアプリID
```

#### Gemini API
```
GEMINI_API_KEY=あなたのGemini APIキー
```

**設定方法:**
1. プロジェクト設定画面で「Environment Variables」タブを開く
2. 「Add New」をクリック
3. KeyとValueを入力
4. 「Save」をクリック
5. すべての環境変数を追加したら、「Deploy」ボタンをクリック

### 4. デプロイ完了

- ビルドが完了すると、URLが表示されます（例: `https://uchinoko-xxxxx.vercel.app`）
- このURLでアプリにアクセスできます

### 5. Firebase設定の更新（重要）

Firebase Consoleで以下を設定：

1. **Authentication → Settings → Authorized domains**
   - 本番URL（例: `uchinoko-xxxxx.vercel.app`）を追加

2. **Firestore → Rules** と **Storage → Rules**
   - 本番環境用のセキュリティルールが適切に設定されているか確認

### 6. 自動デプロイの設定

- GitHubにプッシュするたびに、自動的にデプロイが実行されます
- プルリクエストを作成すると、プレビューURLが自動生成されます

---

## トラブルシューティング

### ビルドエラーが出る場合

1. ローカルで `npm run build` を実行してエラーを確認
2. TypeScriptの型エラーを修正
3. 環境変数が正しく設定されているか確認

### 環境変数が読み込まれない

1. Vercelの環境変数設定を確認
2. `NEXT_PUBLIC_` プレフィックスが必要な変数が正しく設定されているか確認
3. デプロイを再実行

### Firebase認証が動作しない

1. Firebase Consoleで承認済みドメインに本番URLを追加
2. Firebase設定（`NEXT_PUBLIC_FIREBASE_*`）が正しいか確認

---

## 次のステップ

- カスタムドメインの設定（オプション）
- パフォーマンスの最適化
- エラーログの確認

詳細は `DEPLOY.md` を参照してください。











