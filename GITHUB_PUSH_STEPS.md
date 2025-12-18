# GitHubにコードをプッシュする手順

## 前提条件

1. GitHubアカウントを持っていること
2. GitHubでリポジトリを作成済みであること

---

## 手順

### ステップ1: GitHubでリポジトリを作成（まだの場合）

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `uchinoko`）
4. 「Public」または「Private」を選択
5. **「Initialize this repository with a README」のチェックは外す**（既にコードがあるため）
6. 「Create repository」をクリック

### ステップ2: Cursorのターミナルでコマンドを実行

Cursorのターミナル（下部のターミナルパネル）で、以下のコマンドを**順番に**実行してください：

```bash
# 1. プロジェクトフォルダ内のファイルをステージング
git add .

# 2. 初回コミット
git commit -m "Initial commit: うちの子の気持ちアプリ"

# 3. ブランチ名をmainに変更（GitHubのデフォルトに合わせる）
git branch -M main

# 4. リモートリポジトリを追加
# 注意: 以下のURLの「あなたのユーザー名」と「uchinoko」を実際の値に置き換えてください
git remote add origin https://github.com/あなたのユーザー名/uchinoko.git

# 5. GitHubにプッシュ
git push -u origin main
```

### ステップ3: 認証

`git push` を実行すると、認証が求められる場合があります：

- **GitHubユーザー名**を入力
- **パスワード**の代わりに、**Personal Access Token (PAT)** を入力する必要があります

#### Personal Access Tokenの作成方法

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. Note（メモ）を入力（例: "Vercel deploy"）
4. スコープで「repo」にチェック
5. 「Generate token」をクリック
6. 表示されたトークンをコピー（再表示されないので注意）
7. パスワード入力時に、このトークンを貼り付け

---

## トラブルシューティング

### 「remote origin already exists」エラー

既にリモートリポジトリが設定されている場合：

```bash
# 既存のリモートを削除
git remote remove origin

# 再度追加
git remote add origin https://github.com/あなたのユーザー名/uchinoko.git
```

### 「fatal: not a git repository」エラー

Gitリポジトリが初期化されていない場合：

```bash
git init
```

### 認証エラー

Personal Access Tokenを使用しているか確認してください。パスワードではなく、トークンが必要です。

---

## 確認方法

プッシュが成功すると、GitHubのリポジトリページでコードが表示されます。

ブラウザで `https://github.com/あなたのユーザー名/uchinoko` にアクセスして確認してください。












