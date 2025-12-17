# Vercel環境変数の確認と再デプロイ手順

## 現在の設定

- **Google AI StudioのAPIキー**: `AIzaSyAf4mbOQ_A3k4XaiDZyf72DdCHOncsDmvc`
- **VercelのGEMINI_API_KEY**: `AIzaSyAf4mbOQ_A3k4XaiDZyf72DdCHOncsDmvc`

両方とも同じキーが設定されていることを確認しました。

## 確認と修正手順

### ステップ1: Vercelの環境変数を再確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「uchinoko」プロジェクトを開く
3. 「Settings」→「Environment Variables」を開く
4. `GEMINI_API_KEY` を確認：
   - 値が `AIzaSyAf4mbOQ_A3k4XaiDZyf72DdCHOncsDmvc` であることを確認
   - **前後にスペースや引用符がないことを確認**
   - もし余分な文字があれば、削除して再保存

### ステップ2: 環境変数を一度削除して再追加（推奨）

念のため、環境変数を一度削除して再追加することをお勧めします：

1. `GEMINI_API_KEY` の右側にある「-」ボタンをクリックして削除
2. 「+ Add New」をクリック
3. 以下を入力：
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyAf4mbOQ_A3k4XaiDZyf72DdCHOncsDmvc`
   - **注意**: 値の前後にスペースや引用符を付けない
4. 「Save」をクリック

### ステップ3: 再デプロイ

環境変数を更新したら、**必ず再デプロイ**が必要です：

1. Vercelのダッシュボードで「Deployments」タブを開く
2. 最新のデプロイの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 確認ダイアログで「Redeploy」をクリック
5. ビルドが完了するまで待つ（通常1-3分）

### ステップ4: 動作確認

再デプロイが完了したら：

1. アプリにアクセス: https://uchinoko-app.vercel.app/
2. 投稿作成ページで画像をアップロード
3. 「肉球翻訳する！」ボタンをクリック
4. エラーが表示されないことを確認

## トラブルシューティング

### エラーが続く場合

1. **APIキーの有効性を確認**
   - [Google AI Studio](https://makersuite.google.com/app/apikey) でAPIキーが有効か確認
   - 新しいAPIキーを生成してみる

2. **環境変数の形式を確認**
   - 値に余分なスペースや引用符がないか
   - 値が完全にコピーされているか

3. **再デプロイの確認**
   - 最新のデプロイが成功しているか
   - デプロイログにエラーがないか確認

4. **ブラウザのキャッシュをクリア**
   - ブラウザのキャッシュをクリアして再試行

## 注意事項

- APIキーは秘密情報です。他人に共有しないでください
- このドキュメントにAPIキーが含まれているため、GitHubにプッシュする前に削除することをお勧めします










