# ConnLog
ConnLogは、connpassのイベント参加履歴を記録し、タグやメモを付けて学習履歴として可視化するアプリです。

参加した勉強会や技術イベントを単なる履歴として残すだけでなく、自分がどの分野に関心を持ち、どのように学習を積み重ねてきたかを振り返れるようにすることを目的としています。

## 主な機能
* connpassイベントの検索

  * イベントID / URL検索
  * connpassユーザー名による参加イベント検索
* イベント登録

  * connpass APIから取得したイベント情報を保存
  * タグ・メモを付けて登録
* イベント履歴管理

  * 登録済みイベントの一覧表示
  * タグ・メモの編集
  * イベント削除
* ダッシュボード

  * タグ別の参加傾向をグラフ表示
  * 週ごとのイベント参加数を可視化
* スキル分析

  * 登録イベントに付与したタグをもとに学習傾向を表示
* 認証

  * Supabase Authによるログイン / 新規登録
  * MVP公開時はSupabase招待制で運用し、環境変数で新規登録フォームの表示を切り替え
* アカウント設定

  * 表示名・自己紹介の編集

## 使用技術

| 項目      | 技術                      |
| ------- | ----------------------- |
| フレームワーク | Next.js 15 / App Router |
| 言語      | TypeScript              |
| UI      | React / Tailwind CSS    |
| 認証      | Supabase Auth           |
| データベース  | Supabase PostgreSQL     |
| グラフ表示   | Recharts                |
| 日付処理    | dayjs                   |
| アイコン    | lucide-react            |
| 外部API   | connpass API v2         |
| デプロイ    | Vercel                  |

## 主な画面
| パス           | 内容                |
| ------------ | ----------------- |
| `/login`     | ログイン              |
| `/signup`    | 新規登録 / 招待制案内      |
| `/set-password` | 招待ユーザーのパスワード設定 |
| `/search`    | connpassイベント検索・登録 |
| `/events`    | 登録済みイベント一覧        |
| `/dashboard` | 学習履歴のダッシュボード      |
| `/skills`    | スキル分析             |
| `/profile`   | アカウント設定           |

## 公開・利用について

現在はMVP公開前の最終調整中です。

公開時は、少人数のテスト利用を想定したSupabase招待制で運用します。

新規登録フォーム自体はSupabase Authで実装済みですが、MVP公開時は一般新規登録を開放せず、招待されたユーザーのみが利用できる形にしています。

`NEXT_PUBLIC_SIGNUP_MODE=public` を設定すると新規登録フォームを表示できます。未設定、または `invite` の場合は招待制案内を表示します。

一般公開を行う場合は、ユーザーデータを扱うアプリとして以下の対応を整備する予定です。

* プライバシーポリシーの作成
* 問い合わせ先の設置
* ユーザーデータ削除方針の明確化
* 認証・権限設定の最終確認
* 環境変数・秘密情報管理の確認

## ローカル開発

このリポジトリは、ConnLogのアプリケーション実装を確認するためのものです。

ローカル環境で動作させる場合は、各自でSupabaseプロジェクトとconnpass APIキーを用意し、必要な環境変数を設定してください。

```bash
git clone https://github.com/Akaneiro-WebDesign/connlog.git
cd connlog
npm install
```

`.env.local` を作成し、以下の環境変数を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SIGNUP_MODE=invite
SUPABASE_SERVICE_ROLE_KEY=
CONNPASS_API_KEY=
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下にアクセスします。

```txt
http://localhost:3000
```

## 環境変数

| 変数名 | 用途 |
| ------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase公開anon key |
| `NEXT_PUBLIC_SIGNUP_MODE` | `/signup` の表示モード。`invite` で招待制案内、`public` で新規登録フォームを表示 |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー側APIで使用するSupabase service role key |
| `CONNPASS_API_KEY` | connpass API v2のAPIキー |

`SUPABASE_SERVICE_ROLE_KEY` と `CONNPASS_API_KEY` はサーバー側で使用する値です。
公開リポジトリに含めないでください。

`NEXT_PUBLIC_SIGNUP_MODE` は公開されても問題ない表示切り替え用の値です。MVP公開時は `invite` を推奨します。

## 開発コマンド

| コマンド | 内容 |
| --------------- | ----------- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルドを実行 |
| `npm run start` | ビルド済みアプリを起動 |
| `npm run lint` | lintを実行 |

## 開発ステータス

MVP公開前の最終調整中です。

主要機能の実装は概ね完了しており、現在は公開前の品質改善と最終確認を進めています。

### 実装済み

* ログイン / 新規登録
* Supabase招待制に向けた新規登録表示切り替え
* 招待ユーザー向けパスワード設定画面
* connpassイベント検索
* イベント登録
* タグ・メモ保存
* イベント履歴一覧
* タグ・メモ編集
* イベント削除
* ダッシュボード表示
* スキル分析表示
* アカウント設定
* アカウント削除
* loading / empty / error状態の整理

### 公開前に対応したいこと

* 公開前ドキュメントの最終確認
* 主要導線の最終通し確認
* プライバシーポリシーの作成
* Supabase招待制の運用確認
* 認証・権限設定の最終確認
* 環境変数・秘密情報管理の確認

## 今後の改善候補

* デモアカウントまたは招待ユーザー管理フローの整備
* データ削除依頼への対応フロー整備
* エラーハンドリングの追加改善
* UIの細部調整
* テストの追加
* プロフィール情報やイベント分析機能の拡張
