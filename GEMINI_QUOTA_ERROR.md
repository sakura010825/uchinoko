# Gemini API クォータ超過エラーの対処方法

## エラーメッセージ

```
[429 Too Many Requests] You exceeded your current quota, please check your plan and billing details.
```

このエラーは、Gemini APIの無料プランの使用制限に達したことを示しています。

## 原因

Gemini APIの無料プランには以下の制限があります：

- **1日あたりのリクエスト数**: 制限あり
- **1分あたりのリクエスト数**: 制限あり
- **1分あたりの入力トークン数**: 制限あり

これらの制限に達すると、429エラーが発生します。

## 解決方法

### 方法1: しばらく待ってから再試行

エラーメッセージに「Please retry in XX seconds」と表示されている場合は、その時間待ってから再試行してください。

例: `Please retry in 41.152880637s` → 約41秒後に再試行

### 方法2: Google AI Studioでクォータを確認

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 左メニューから「Usage」を選択
3. 現在の使用状況と制限を確認
4. 制限に達している場合は、時間が経過するまで待つ

### 方法3: 有料プランにアップグレード（オプション）

無料プランの制限を超えて使用する場合は、Google Cloud Consoleで有料プランにアップグレードできます。

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「Billing」を設定
4. Gemini APIの有料プランにアップグレード

### 方法4: リクエスト頻度を減らす

- 投稿の作成頻度を減らす
- 複数のリクエストを同時に送信しない
- エラーが発生した場合は、しばらく待ってから再試行

## エラーメッセージの確認

アプリでエラーが発生した場合、以下のようなメッセージが表示されます：

```
Gemini APIの使用制限に達しました。無料プランの制限に達した可能性があります。
XX秒後に再試行するか、Google AI Studioでクォータを確認してください。
```

## 参考リンク

- [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Google AI Studio Usage](https://ai.dev/usage?tab=rate-limit)
- [Google Cloud Console](https://console.cloud.google.com/)

## 一時的な対処

エラーが発生した場合：

1. エラーメッセージに表示されている時間（例: 41秒）待つ
2. アプリで再度投稿を試す
3. それでもエラーが出る場合は、Google AI Studioでクォータを確認

## 長期的な対処

- 有料プランにアップグレードする
- リクエスト頻度を最適化する
- キャッシュ機能を実装して、同じリクエストを繰り返さない












