# Gemini APIキーの設定方法

このドキュメントでは、Gemini APIキーの取得と設定方法を説明します。

## エラーについて

以下のエラーが表示された場合、Gemini APIキーが正しく設定されていません：

```
API key not valid. Please pass a valid API key.
```

## 解決手順

### 1. Gemini APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」ボタンをクリック
4. プロジェクトを選択（または新規作成）
5. 生成されたAPIキーをコピー

**重要**: APIキーは秘密情報です。他人に共有しないでください。

### 2. 環境変数ファイルの確認と設定

プロジェクトルートに`.env.local`ファイルがあるか確認してください。

#### `.env.local`ファイルが存在しない場合

1. プロジェクトルートに`.env.local`ファイルを作成
2. 以下の内容を追加：

```env
# Gemini API設定
GEMINI_API_KEY=your_actual_api_key_here
```

**注意**: `your_actual_api_key_here`を実際のAPIキーに置き換えてください。

#### `.env.local`ファイルが既に存在する場合

1. `.env.local`ファイルを開く
2. `GEMINI_API_KEY`が設定されているか確認
3. 設定されていない、または間違っている場合は修正：

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 開発サーバーの再起動

環境変数を変更した後は、**必ず開発サーバーを再起動**してください。

```bash
# 現在のサーバーを停止（Ctrl+C）
# その後、再起動
npm run dev
```

**重要**: 環境変数の変更は、サーバーを再起動しないと反映されません。

### 4. APIキーの確認

`.env.local`ファイルで以下の点を確認してください：

- ✅ `GEMINI_API_KEY`が設定されている
- ✅ APIキーの前後に余分なスペースや引用符がない
- ✅ 実際のAPIキーが正しく入力されている（プレースホルダーではない）

**よくある間違い**:
```env
# ❌ 間違い: 引用符で囲んでいる
GEMINI_API_KEY="your_api_key_here"

# ❌ 間違い: 前後にスペースがある
GEMINI_API_KEY= your_api_key_here 

# ✅ 正しい: そのまま記述
GEMINI_API_KEY=your_api_key_here
```

### 5. 動作確認

1. 開発サーバーを再起動
2. ブラウザでアプリを開く
3. 投稿作成ページで画像をアップロード
4. 「肉球翻訳する！」ボタンをクリック
5. エラーが表示されないことを確認

## トラブルシューティング

### エラーが続く場合

1. **APIキーが正しいか確認**
   - [Google AI Studio](https://makersuite.google.com/app/apikey)でAPIキーを再確認
   - 新しいAPIキーを生成してみる

2. **環境変数が正しく読み込まれているか確認**
   - `.env.local`ファイルの場所が正しいか（プロジェクトルート）
   - ファイル名が`.env.local`であるか（`.env`や`.env.example`ではない）

3. **サーバーを完全に再起動**
   ```bash
   # サーバーを停止
   # Ctrl+C で停止
   
   # 再度起動
   npm run dev
   ```

4. **APIキーの制限を確認**
   - Google Cloud ConsoleでAPIキーの制限を確認
   - 「Generative Language API」が有効になっているか確認

### その他のエラー

- **"API key not valid"**: APIキーが無効です。新しいAPIキーを生成してください。
- **"Quota exceeded"**: APIの使用制限に達しています。しばらく待ってから再試行してください。
- **"Permission denied"**: APIキーに適切な権限がありません。Google Cloud Consoleで設定を確認してください。

## 参考リンク

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API ドキュメント](https://ai.google.dev/docs)
- [Next.js 環境変数](https://nextjs.org/docs/basic-features/environment-variables)













