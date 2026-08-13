# Claude一次セキュリティ監査 入力範囲一覧

作成日：2026年8月13日
目的：Claudeによる独立一次セキュリティ監査へ渡すファイル範囲と除外方針を固定する。
状態：監査準備用の管理文書。Claudeへの入力には含めず、アプリケーションの安全性に関する結論も含めない。

## 1. 基本方針

一次監査では、ConnLogの実装、設定、依存関係、DB変更SQL、および中立な監査仕様書だけを渡す。

既存の監査結果、Codexによる事前確認記録、OWASP ZAPレポートは、一次監査の報告が確定するまで渡さない。

監査用コピーは、リポジトリ本体とは別の場所に作成する。コピーを作成する前に、この一覧と実際の全ファイル一覧を照合する。

## 2. 監査用コピーへ含めるファイル

### アプリケーション実装

- `src/app/**/*.ts`
- `src/app/**/*.tsx`
- `src/app/**/*.css`
- `src/components/**/*.ts`
- `src/components/**/*.tsx`
- `src/lib/**/*.ts`
- `src/types/**/*.ts`
- `middleware.ts`

### アプリケーション設定と依存関係

- `.gitignore`
- `eslint.config.mjs`
- `next.config.ts`
- `postcss.config.mjs`
- `tsconfig.json`
- `package.json`
- `package-lock.json`

### DB定義と中立な監査資料

- `docs/db/**/*.sql`
- `docs/architecture/connlog-system-overview.md`
- `docs/review/independent-security-audit-test-spec.md`

## 3. 一次監査から除外するもの

### 既存の監査結果・評価

以下は既存の結論や評価を含むため、一次監査の入力から除外する。

- `docs/review/account-delete-api-security-review.md`
- `docs/review/auth-flow-security-review.md`
- `docs/review/independent-security-audit-primary-report.md`
- `docs/review/notes-users-rls-security-review.md`
- `docs/review/owasp-zap-baseline-security-review.md`
- `docs/review/route-handler-audit-inventory.md`
- `docs/review/secret-management-security-review.md`
- `docs/review/supabase-security-advisor-audit.md`
- `zap-reports/`
- `zap.yaml`

### 秘密情報・個人情報・環境依存データ

以下は監査用コピーへ含めない。

- `.env`、`.env.*`
- APIキー、トークン、Cookie、認証情報
- DBバックアップ、実ユーザーのデータ、ログ、エクスポート
- `backups/`
- `.vercel/`
- `supabase/.temp/`

### 生成物・監査に不要なファイル

以下は実装監査に不要、または環境依存・生成物であるため除外する。

- `node_modules/`
- `.next/`
- `coverage/`
- `out/`
- `build/`
- `next-env.d.ts`
- `*.tsbuildinfo`
- `public/`
- `src/app/favicon.ico`
- `README.md`
- `docs/troubleshooting.md`
- `file-tree.txt`

### 監査準備用の管理文書

以下は監査用コピーの作成・確認に使う内部管理文書であり、Claudeへの入力には含めない。

- `docs/review/claude-primary-audit-input-manifest.md`

## 4. 秘密情報に関する確認結果

許可対象のソースコードには、次の環境変数参照がある。

- `CONNPASS_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

監査用コピーには、環境変数の参照コードは含める。一方で、`.env`などの値を保持するファイルは含めない。

許可対象に対して、典型的なAPIキー・JWT形式をファイル名のみ出力する検索を実施した範囲では、キー実値らしき文字列は検出されなかった。この確認は実値が存在しないことを保証するものではなく、監査用コピー作成直前にも全ファイル一覧を確認する。

## 5. リポジトリ外で確認する事項

以下はリポジトリのソースコードだけでは確定できない。必要な場合は、秘密情報を含めないチェックリストまたは画面上の設定値として別途提示する。

- Supabase Authの招待・メール・リダイレクト関連設定
- Supabaseの現在のRLS有効化状態、Policy、DB関数権限
- Vercelの環境変数名・Production / Preview / Developmentごとの設定有無
- Vercel Preview環境のURL、対応するcommit SHA、監査実施を許可した日時
- GitHub、Supabase、Vercelのアクセス権限と公開設定

## 6. 監査用コピー作成時の確認手順

1. `main`のcommit SHAを記録する。
2. この一覧の許可対象だけを別ディレクトリへコピーする。
3. コピー後の全ファイル一覧を出力し、この一覧と照合する。
4. `.env`、バックアップ、ZAPレポート、既存監査文書、生成物が含まれないことを確認する。
5. Claudeへ渡す前に、プロジェクト所有者が全ファイル一覧を確認する。
6. 監査中は、ソースコード・設定・クラウド環境を変更しない。
