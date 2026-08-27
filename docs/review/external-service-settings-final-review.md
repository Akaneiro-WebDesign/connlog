# リポジトリ外のSupabase・Vercel設定 最終確認

確認日：2026年8月26日

## 1. この文書の目的

この文書は、ConnLogの少人数テストユーザー招待前に、リポジトリだけでは確認できないSupabaseとVercelの設定を実環境で確認し、その結果と判断根拠を記録するものである。

確認対象は、認証・招待制運用・パスワード設定・URL設定・環境変数・デプロイ設定・Preview保護・ログとソースの保護である。

秘密情報の値は記録せず、設定名、適用環境、機能上の確認結果だけを記載する。

## 2. 確認方法と制約

次の方法で確認した。

- Supabase DashboardのAuthentication設定を目視確認
- SupabaseのURL Configurationを目視確認
- Supabase Security Advisorを再確認
- Vercel DashboardのProject Settingsを目視確認
- ConnLogのProduction環境で招待制表示と認証動作を確認
- 環境変数の値そのものは表示・記録しない
- 設定変更が必要な項目は、コードと実環境の不整合が生じないよう個別に確認する

本記録は、2026年8月26日時点のDashboard設定とProductionでの実地確認に基づく。SupabaseまたはVercelの仕様変更、プラン変更、環境変数の更新、認証機能の追加を行った場合は再確認が必要になる。

## 3. Supabase設定

### URL Configuration

確認結果は次のとおり。

- Site URLはConnLogのProduction URL
- Site URLはHTTPSを使用
- Site URL末尾に不要なスラッシュはない
- Redirect URLsはlocalhost用4件、Production用3件の合計7件
- Vercel Preview専用URLは登録されていない
- ConnLogと無関係なドメインは登録されていない

localhostとProductionには同一オリジン内で重複するRedirect URLが含まれるが、許可先はConnLogで使用するオリジンに限定されている。現時点では安全性を損なう設定ではなく、MVP公開前の変更は不要と判断した。

### Supabase Auth

確認した設定は次のとおり。

| 設定 | 状態 | 判断 |
| --- | --- | --- |
| Email Provider | ON | メールアドレスとパスワードによる認証に使用 |
| Allow new users to sign up | OFF | 一般登録をSupabase側でも拒否 |
| Allow manual linking | OFF | 現在は不要 |
| Allow anonymous sign-ins | OFF | 匿名ユーザーを使用しない構成と一致 |
| Confirm email | OFF | 管理者招待制の現行運用では許容 |
| Secure email change | OFF | メールアドレス変更機能は提供していない |
| Secure password change | OFF | 現在のパスワードを直接確認する方式を採用 |
| Require current password when updating | ON | パスワード変更時にSupabase側でも現在のパスワードを検証 |
| Prevent use of leaked passwords | OFF | Free Planでは利用できないため既知の制約として許容 |
| Minimum password length | 8文字 | 画面側の入力制限と一致 |
| Password requirements | 追加要件なし | MVPでは最低8文字を必須とする |
| Email OTP expiration | 3600秒 | 招待リンクを1時間で失効 |
| Email OTP length | 6桁 | 現在の設定として許容 |

Productionでは次を確認した。

- `/signup`に一般登録フォームが表示されない
- 「ConnLogは現在、招待制で公開しています」と表示される
- 7文字の新しいパスワードは画面側で拒否される
- SupabaseのMinimum password lengthを8文字へ変更後も、既存ユーザーがログインできる
- 正しい現在のパスワードを使用したパスワード変更が成功する
- 誤った現在のパスワードでは変更できない

### Security Advisor

2026年8月26日にSecurity Advisorを再確認した結果は次のとおり。

- Errors：0件
- Warnings：1件
- Info：0件

残っているWarningは`Leaked Password Protection Disabled`である。

これは、漏えい済みパスワードを検知・拒否する機能が無効であることを示す。この機能はSupabaseのPro Plan以上で利用でき、現在のFree Planでは有効化できない。

認証回避、RLS、DB関数、データ漏えいなどの実装上の問題を示すWarningではない。最低8文字、招待制、重要操作時の現在のパスワード確認を実装していることも踏まえ、既知のプラン制約として許容する。

## 4. Vercel設定

### Environment Variables

確認した環境変数は次のとおり。

| 変数名 | 適用環境 | Vercel上の分類 |
| --- | --- | --- |
| `NEXT_PUBLIC_SIGNUP_MODE` | Production / Preview | Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Production / Preview | Secret |
| `CONNPASS_API_KEY` | Production / Preview | Secret |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production / Preview / Development | Config |
| `NEXT_PUBLIC_SUPABASE_URL` | Production / Preview / Development | Config |

`SUPABASE_SERVICE_ROLE_KEY`と`CONNPASS_API_KEY`は、秘密情報として管理されている。値そのものは表示・記録していない。

Supabase URLとanon keyは、ブラウザから使用する公開前提の設定であり、Configとして管理されていることは想定どおりである。

`NEXT_PUBLIC_SIGNUP_MODE`はSecretとして保存されているが、`NEXT_PUBLIC_`が付く変数はブラウザへ公開される前提である。これは秘密情報ではなく、Productionで招待制表示が有効であることを実際の画面で確認した。

### Build and Deployment

確認結果は次のとおり。

- Node.js Versionは`22.x`
- Production Branchは`main`
- `main`へpushまたはマージするとProduction Deploymentが作成される
- Auto-assign Custom Production DomainsはEnabled
- Production環境でNext.js 15.5.23のビルドが成功している
- Productionの主要画面へアクセスできる

Node.js 22は、使用中の`@supabase/supabase-js 2.102.0`が要求するNode.js 20以上を満たしている。

### Deployment Protection

確認結果は次のとおり。

- Vercel Authenticationは有効
- Require Log InはON
- 保護範囲は`(Legacy) Standard Protection`
- Previewおよび個別のDeployment URLはVercel Authenticationで保護される
- 最新のProductionドメインは一般利用者がアクセスできる
- Build Logs and Source ProtectionはEnabled
- Git Fork ProtectionはEnabled

Build Logs and Source Protectionにより、`/_logs`と`/_src`はVercelのチームメンバー以外へ公開されない。

Git Fork Protectionにより、外部フォーク由来のPull Requestは、チームメンバーの承認なしに環境変数を使用してデプロイされない。

`(Legacy) Standard Protection`は現行の設定として意図どおり機能している。新しいStandard Protectionへの移行はPreview確認や自動テストへ影響する可能性があるため、この最終確認では変更しない。

## 5. 既知の制約と運用上の注意

### PreviewとProductionのSupabase共有

VercelのProductionとPreviewには、同じ設定項目としてSupabaseの環境変数が適用されている。

Previewでアカウント削除やデータ変更を行うと、Productionと共有するSupabaseのデータへ影響する可能性がある。そのため、Previewで破壊的な動作確認を行う場合は、今後もテスト専用アカウントとテストデータだけを使用する。

PreviewはVercel AuthenticationとGit Fork Protectionで保護されているため、現時点の少人数MVPではこの構成を許容する。将来、開発者や外部コントリビューターが増えた場合は、Preview専用のSupabaseプロジェクトを分離することを検討する。

### ローカルNode.jsとの差異

確認時点のローカルNode.jsは`v21.5.0`、Vercelは`22.x`である。

どちらも現在の依存パッケージが要求するNode.js 20以上を満たし、ローカルのlintとbuild、Vercelのデプロイは成功しているため、MVP開始のブロッカーとはしない。

将来は`.nvmrc`や`package.json`の`engines`を使用し、ローカルとVercelをNode.js 22へ統一することを検討する。

## 6. 最終判断

Supabaseでは、一般登録と匿名ログインが無効で、招待制運用がAuth側でも強制されている。パスワード最低文字数は画面とSupabaseの双方で8文字に統一され、重要操作時の現在のパスワード確認も有効である。

Vercelでは、必要な5件の環境変数が適切な環境へ設定され、秘密情報はSecretとして管理されている。Production Branch、Node.js、Deployment Protection、ログとソースの保護、Git Fork Protectionも意図どおり設定されている。

Security Advisorに残る1件のWarningと、Preview・ProductionでSupabaseを共有する構成は、既知の制約と運用上の注意として記録した。

以上から、この確認範囲では、少人数テストユーザーの招待を直ちに中止すべきリポジトリ外設定の問題は確認されなかった。ほかのMVP公開前タスクと最終QAが完了した段階で、テストユーザー招待の可否を最終判断する。
