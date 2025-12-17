# Gemini APIキー漏洩エラーの対処方法

## エラーメッセージ

```
[403 Forbidden] Your API key was reported as leaked. Please use another API key.
```

このエラーは、Gemini APIキーが漏洩として報告されているため、新しいAPIキーが必要です。

## 解決手順

### ステップ1: 新しいGemini APIキーを取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. **既存のAPIキーを削除または無効化**（セキュリティのため）
4. 「Create API Key」ボタンをクリック
5. プロジェクトを選択（または新規作成）
6. 生成された**新しいAPIキーをコピー**（再表示されないので注意）

### ステップ2: Vercelの環境変数を更新

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「uchinoko」プロジェクトを開く
3. 「Settings」→「Environment Variables」を開く
4. `GEMINI_API_KEY` を見つける
5. 「Edit」または「-」ボタンで既存のキーを削除
6. 「+ Add New」をクリック
7. 以下を入力：
   - **Key**: `GEMINI_API_KEY`
   - **Value**: 新しいAPIキーを貼り付け
8. 「Save」をクリック

### ステップ3: 再デプロイ

環境変数を更新したら、再デプロイが必要です：

1. Vercelのダッシュボードで「Deployments」タブを開く
2. 最新のデプロイの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 確認ダイアログで「Redeploy」をクリック

または、GitHubにプッシュすると自動的に再デプロイされます。

### ステップ4: ローカルの環境変数も更新（オプション）

開発環境でも新しいAPIキーを使用する場合：

1. プロジェクトルートの`.env.local`ファイルを開く
2. `GEMINI_API_KEY`の値を新しいAPIキーに更新
3. 開発サーバーを再起動

```bash
# 開発サーバーを停止（Ctrl+C）
# その後、再起動
npm run dev
```

## セキュリティのベストプラクティス

### APIキーの保護

- ✅ **GitHubにコミットしない**: `.env.local`は`.gitignore`に含まれています
- ✅ **Vercelの環境変数を使用**: 本番環境では環境変数を使用
- ✅ **定期的にローテーション**: 定期的にAPIキーを更新する
- ❌ **公開リポジトリにAPIキーをコミットしない**
- ❌ **スクリーンショットや共有でAPIキーを公開しない**

### 漏洩を防ぐために

1. **APIキーの制限を設定**
   - Google Cloud ConsoleでAPIキーの使用を制限
   - 特定のIPアドレスやリファラーからのみ使用可能にする

2. **定期的な監視**
   - 異常な使用量がないか確認
   - 定期的にAPIキーをローテーション

3. **最小権限の原則**
   - 必要最小限の権限のみを付与

## 確認方法

再デプロイ後、以下を確認してください：

1. アプリにアクセス: https://uchinoko-app.vercel.app/
2. 投稿作成ページで画像をアップロード
3. 「肉球翻訳する！」ボタンをクリック
4. エラーが表示されないことを確認

## トラブルシューティング

### エラーが続く場合

1. **新しいAPIキーが正しく設定されているか確認**
   - Vercelの環境変数設定を再確認
   - 前後にスペースや引用符がないか確認

2. **再デプロイが完了しているか確認**
   - Vercelのデプロイメントページで最新のデプロイが成功しているか確認

3. **APIキーの制限を確認**
   - Google Cloud Consoleで「Generative Language API」が有効になっているか確認

4. **ブラウザのキャッシュをクリア**
   - ブラウザのキャッシュをクリアして再試行

## 参考リンク

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API ドキュメント](https://ai.google.dev/docs)
- [Vercel 環境変数](https://vercel.com/docs/concepts/projects/environment-variables)











