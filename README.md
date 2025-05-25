# ConnLog（コンログ）

📊 **ConnLog** は、connpass のイベント参加履歴からスキルを可視化するポートフォリオ拡張アプリです。  
学習の足跡や得意分野を可視化・アピールできるよう設計されています。

---

## 🧩 主な機能

- ✅ イベント参加履歴の登録（connpassイベントIDから情報取得）
- 🏷️ タグ（スキル）付けによる分類・分析
- 📈 ダッシュボードでのグラフ表示（カテゴリ別割合・週ごとの参加数）
- 🔐 Supabase Auth による認証機能（メール認証）
- 👤 プロフィール編集機能（自己紹介・アイコンなど）

---

## 🛠 使用技術

| 項目          | 内容                                           |
|---------------|------------------------------------------------|
| フレームワーク | Next.js 14（App Router）                     |
| 認証           | Supabase Auth                                 |
| データベース   | Supabase（PostgreSQL）                        |
| UI/UX         | Tailwind CSS、Figma                           |
| グラフ表示     | Recharts（円グラフ・棒グラフ）                |
| デプロイ       | Vercel（予定）                                |

---

## 🚀 ローカル環境での起動方法

1. リポジトリをクローン：

```bash
git clone https://github.com/your-username/connlog.git
cd connlog
```

2. パッケージをインストール：

```bash
npm install
```

3. `.env.local` を作成し、以下を記述：

```
NEXT_PUBLIC_SUPABASE_URL=（あなたの Supabase プロジェクトURL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（Supabase の公開鍵）
NEXT_PUBLIC_DEV_SKIP_AUTH=true
```

4. 開発サーバーを起動：

```bash
npm run dev
```

---

## ✅ 開発ステータス（2025/05/24 時点）

- [x] Supabase プロジェクト作成
- [x] 認証（メールログイン / Magic Link）
- [x] サインイン・サインアウトUI
- [x] 認証スキップ設定（開発用）
- [x] ER図作成・テーブル設計（users, events, user_events, tags など）
- [x] Figma による画面デザイン作成
- [ ] タグ機能・スキル分析ページ
- [ ] Vercelへのデプロイ

---

## 📌 補足メモ

- 開発途中のデモURLは近日中に公開予定
- Supabase の権限管理やセキュリティロール設定は後日実装
- 今後、Clerk + Prisma への移行も検討中

---

## 📫 作者について

このアプリは、あかねいろによって開発されています。  
勉強会・イベント参加を可視化し、自分の「努力」をアピールする場を作るために作りました。
