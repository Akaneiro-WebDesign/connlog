# 認証フロー・Supabase Auth 安全性調査

調査日：2026年7月22日

最終更新：2026年7月23日

## 対象

```txt
src/app/auth/callback/route.ts
src/app/auth/confirm/route.ts
src/app/login/page.tsx
src/app/signup/page.tsx
src/app/set-password/page.tsx
src/app/profile/page.tsx
src/app/page.tsx
src/app/layout.tsx
src/components/ClientLayout.tsx
src/components/UserProvider.tsx
src/lib/supabase/server.ts
src/lib/supabase/client.ts
src/lib/supabase/browser.ts
src/lib/supabase.ts
src/lib/supabaseClient.ts
src/app/api/search-event/route.ts
src/app/api/search-user/route.ts
middleware.ts
Supabase Authentication設定
```

## 調査目的

ConnLogのログイン、新規登録、招待、パスワード設定・変更、認証が必要な画面とAPIについて、未認証アクセスや認証回避につながる問題がないか確認する。

あわせて、Supabase Authの新規登録設定、匿名ログイン、メールリンク有効期限、Site URL、招待メールテンプレートを確認する。

## 結論

ログイン、招待トークンの確認、主要画面の未ログイン時リダイレクト、主要データAPIの本人確認について、Critical・High相当の問題は確認されなかった。

Supabaseでは一般ユーザーの新規登録と匿名ログインが無効になっており、ConnLogの招待制運用が画面表示だけでなくAuth側でも強制されていた。

調査時点では、connpass APIを呼び出す次の検索APIにログイン確認がなく、未ログイン状態でもHTTP 200で検索結果を取得できる問題があった。

```txt
/api/search-event
/api/search-user
```

この問題は、2026年7月23日に別の修正ブランチで対応し、PR #77としてmainへマージした。

両APIをPages RouterからApp Routerへ移行し、`supabase.auth.getUser()`によるログイン確認を追加した。

修正後は、未ログイン状態で両APIがHTTP 401を返すことを、ローカル環境とVercel Previewで確認した。

ログイン後についても、イベントID・URL検索、connpassユーザー名検索、ページ送りが正常に動作することを確認した。

現時点で、この監査で確認されたconnpass検索APIの未認証アクセス問題は対応済みである。

## Supabase Authの設定

確認時点では、次の状態だった。

```txt
Email Provider：有効
Allow new users to sign up：OFF
Allow manual linking：OFF
Allow anonymous sign-ins：OFF
Confirm email：OFF
```

### 新規登録

`Allow new users to sign up`がOFFになっているため、通常の`signUp()`を使用した一般ユーザー登録はSupabase側で拒否される。

ConnLogでは、次の環境変数によって新規登録画面の表示も招待制へ切り替えている。

```txt
NEXT_PUBLIC_SIGNUP_MODE=invite
```

したがって、現在は次の二重の制限がある。

```txt
ConnLogの画面
- 一般登録フォームを表示しない

Supabase Auth
- 通常の新規登録APIを拒否する
```

現在の招待制運用として適切な状態と判断した。

### 匿名ログイン

`Allow anonymous sign-ins`はOFFになっている。

ConnLogはログインユーザーごとにデータを分離するアプリであり、匿名ユーザーを必要としないため、この設定は適切。

### Confirm email

`Confirm email`はOFFになっている。

現在は通常の新規登録自体が無効で、管理者からの招待リンクを使用する運用のため、現時点で重大な問題とは判断しない。

将来、一般登録を有効にする場合は、メールアドレスの所有確認を行うため、`Confirm email`の有効化を先に検討する。

## 招待フロー

現在の招待フローは次のとおり。

```txt
管理者がSupabaseからユーザーを招待
↓
利用者が招待メールのリンクを開く
↓
/auth/confirmでtoken_hashを検証
↓
招待ユーザーのセッションを作成
↓
/set-passwordへ移動
↓
利用者が初回パスワードを設定
```

## 招待確認Route

対象：

```txt
src/app/auth/confirm/route.ts
```

確認結果：

- `token_hash`がない場合はログイン画面へ戻す
- `type=invite`以外は拒否する
- `verifyOtp()`を使って招待トークンを検証する
- トークン検証に失敗した場合はログイン画面へ戻す
- 検証成功後は`/set-password`へ移動する
- `next`はアプリ内の相対パスだけを許可する
- `//`から始まる値は拒否する

招待トークンの検証とリダイレクト先の制限は適切と判断した。

## 認証callback

対象：

```txt
src/app/auth/callback/route.ts
```

認証コードが存在する場合は`exchangeCodeForSession()`を実行し、成功後に指定された画面へ移動する。

一方、`next`について、`/auth/confirm`と同じ安全なパス検証は行われていない。

現在は`origin`を先頭に付けているため、直ちに外部サイトへ移動できる問題とは断定しない。

ただし、想定外のパスへの遷移を防ぐため、`/auth/confirm`と同じ`getSafeNextPath()`相当の処理を追加する改善候補として残す。

## 招待メールテンプレート

確認した招待リンク：

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=invite&amp;next=/set-password
```

`TokenHash`をConnLogの`/auth/confirm`へ渡し、サーバー側で`verifyOtp()`を実行する構成になっている。

現在のコードと一致しており、招待フローとして適切。

## Email OTP expiration

確認時点では次の設定だった。

```txt
変更前：86400秒（24時間）
変更後：3600秒（1時間）
```

Supabase Dashboardに推奨値を超えている警告が表示されていたため、2026年7月22日に3600秒へ変更した。

変更後、警告が消えたことを確認した。

招待メールにも、リンクを受信後1時間以内に開くよう案内を追加した。

## Site URL

変更前は、Site URLの末尾に`/`が付いていた。

```txt
https://your-app.vercel.app/
```

招待メールテンプレート側でも`/auth/confirm`を付けているため、二重スラッシュになる可能性を避ける目的で、末尾の`/`を削除した。

```txt
変更後
https://your-app.vercel.app
```

## Redirect URLs

確認時点では、localhostと本番ドメインについて複数のRedirect URLが登録されていた。

```txt
http://localhost:3000
http://localhost:3000/dashboard
http://localhost:3000/auth/callback
http://localhost:3000/**

https://your-app.vercel.app/**
https://your-app.vercel.app/set-password
https://your-app.vercel.app/auth/callback
```

`/**`が同じドメイン内のほかのパスを含むため、一部は重複している。

ただし、現在の招待メールは`.SiteURL`から直接`/auth/confirm`を組み立てており、今回の招待フローだけを見る限り、Redirect URLの整理は緊急対応ではない。

ほかの認証フローやPreview環境への影響を確認してから、別タスクで整理を検討する。

## パスワード設定

対象：

```txt
src/app/set-password/page.tsx
```

画面ではブラウザ内のセッションを確認し、有効なセッションがある場合だけ`updateUser()`でパスワードを設定する。

変更対象はログイン中のユーザー本人であり、任意のユーザーIDを指定する処理はない。

そのため、別ユーザーのパスワードを変更できる問題は確認されなかった。

一方、招待によるセッションか、通常ログインによるセッションかは区別していない。

通常ログイン中のユーザーも`/set-password`を開ける可能性があるため、画面用途を明確にする改善候補として残す。

## プロフィールからのパスワード変更

対象：

```txt
src/app/profile/page.tsx
```

ログイン中の本人に対し、次の処理でパスワードを変更している。

```txt
supabase.auth.updateUser({
  password: newPassword
})
```

他人のユーザーIDを指定する処理はなく、変更対象はログイン中のユーザー本人。

現在のSupabase設定では、次の機能がOFFになっている。

```txt
Secure password change：OFF
Require current password when updating：OFF
```

そのため、有効なログインセッションがあれば、現在のパスワードの再入力なしで変更できる。

直ちにCritical・High相当の問題とは判断しないが、セッションを第三者に操作された場合の被害を小さくするため、再認証や現在のパスワード確認を追加する改善候補として残す。

設定だけを先に有効化すると現在の画面が動作しなくなる可能性があるため、コード修正とSupabase設定変更を同じタスクで行う。

## パスワード最低文字数

現在は次のすべてが6文字以上で統一されている。

```txt
新規登録画面
招待後のパスワード設定画面
プロフィールのパスワード変更画面
Supabase Minimum password length
```

表示とSupabase設定に不整合はない。

ただし、安全性向上のため、8文字以上への変更を改善候補とする。

変更する場合は、画面側3か所とSupabase設定を同時に変更する。

## 主要画面の認証確認

次の主要画面では、`UserProvider`からログイン状態を取得している。

```txt
/dashboard
/events
/search
/skills
/profile
```

ログイン状態の確認が完了し、ユーザーが存在しない場合は`/login`へ移動する。

また、ユーザーが確認できるまではデータ取得APIを呼ばない実装になっている。

未ログイン状態で主要画面をそのまま利用できる問題は確認されなかった。

## UserProvider

対象：

```txt
src/components/UserProvider.tsx
src/components/ClientLayout.tsx
src/app/layout.tsx
```

`ClientLayout`がアプリ全体を`UserProvider`で包んでいる。

`UserProvider`はブラウザ内のセッションを取得し、認証状態の変化を監視している。

画面表示の切り替えには`getSession()`を使用しているが、重要なデータ操作を行う主要APIでは、サーバー側で`getUser()`を使用している。

次の使い分けになっている。

```txt
画面表示・ログイン状態の監視
- getSession()

APIでの本人確認
- getUser()
```

現在の用途として適切と判断した。

## middleware

対象：

```txt
middleware.ts
```

middlewareでは`supabase.auth.getUser()`を実行しているが、その結果を使って未ログインユーザーを拒否していない。

現在の主な役割は、認証セッションのCookieを取得・更新すること。

```txt
ログイン済み
- そのまま処理を続ける

未ログイン
- そのまま処理を続ける
```

middlewareが存在するだけで、すべてのページやAPIが自動的に認証必須になるわけではない。

現在の役割として不自然ではないため、今回middleware全体へ認証拒否処理は追加しない。

認証が必要なAPI自身で`getUser()`を実行する方針とする。

## connpass検索APIの未認証アクセス（対応済み）

現在の対象：

```txt
src/app/api/search-event/route.ts
src/app/api/search-user/route.ts
```

両APIは、サーバー側環境変数`CONNPASS_API_KEY`を使ってconnpass API v2を呼び出す。

APIキーそのものをレスポンスへ含める処理はなく、ブラウザ側への直接露出は確認されなかった。

### 発見時の状態

調査時点では、両APIは次のPages Router形式で実装されていた。

```txt
src/pages/api/search-event.ts
src/pages/api/search-user.ts
```

両APIにはログインユーザーを確認する処理がなく、ログインCookieを送らないcurlからも検索結果を取得できた。

未ログイン状態で本番APIへアクセスした結果：

```txt
search-event：HTTP 200
search-user：HTTP 200
```

connpassのイベント情報自体は公開情報のため、今回の結果だけでユーザーの非公開データ漏洩とは判断しなかった。

また、`CONNPASS_API_KEY`の値そのものが漏洩した形跡も確認されなかった。

一方、次の影響が考えられるため、テストユーザー招待前の修正対象とした。

* 第三者がConnLogをconnpass検索の代理サーバーとして利用できる
* ConnLogのサーバーへ不要な負荷がかかる
* connpass APIの利用回数や制限へ影響する可能性がある
* 大量アクセスにより、本来の利用者が検索しにくくなる可能性がある

### 2026年7月23日の対応

別の`fix/`ブランチで次を修正し、PR #77としてmainへマージした。

* 両APIをPages RouterからApp Routerへ移行
* `supabase.auth.getUser()`によるログイン確認を追加
* 未ログイン時にHTTP 401を返すよう変更
* `event_id`の入力チェックを追加
* `nickname`の入力チェックを追加
* `start`と`count`の整数・範囲チェックを追加
* connpass API v2の`start`が1始まりであることに合わせて変換処理を追加
* 旧Pages Router APIを削除

削除した旧API：

```txt
src/pages/api/search-event.ts
src/pages/api/search-user.ts
```

修正後のAPI：

```txt
src/app/api/search-event/route.ts
src/app/api/search-user/route.ts
```

### 修正後の確認結果

未ログイン状態：

```txt
ローカル環境
- /api/search-event：HTTP 401
- /api/search-user：HTTP 401

Vercel Preview
- /api/search-event：HTTP 401
- /api/search-user：HTTP 401
```

ログイン状態：

* イベントIDによる検索が成功
* connpassイベントURLによる検索が成功
* connpassユーザー名による参加イベント検索が成功
* 検索結果のページ送りが正常に動作
* lint成功
* build成功

このため、監査時にMedium候補として記録した未認証アクセス問題は対応済みとする。

## connpass検索APIの追加改善候補

認証、基本的な入力チェック、URLエンコード、connpass APIのエラー内容を直接露出しない処理は追加済みである。

今後の改善候補として、次が残る。

* アプリケーション側で追加のレート制限が必要か検討する

## Supabase Client関連ファイル

現在は、似た役割のファイルが複数存在する。

```txt
src/lib/supabase/server.ts
src/lib/supabase/client.ts
src/lib/supabase/browser.ts
src/lib/supabase.ts
src/lib/supabaseClient.ts
```

確認時点の主な用途：

```txt
supabase/server.ts
- APIや認証Routeなどのサーバー側で使用

supabase/client.ts
- 現在の中心的なブラウザ用Client

supabase.ts
- ログイン画面で使用

supabaseClient.ts
- 新規登録画面で使用

supabase/browser.ts
- 使用箇所が見つからず、未使用候補
```

管理者用のservice role keyが通常のブラウザ用・サーバー用Clientへ混入している問題は確認されなかった。

ただし、同じブラウザ用Clientを複数のファイル名から呼び出しており、開発初期の重複ファイルが残っている可能性がある。

今回の認証監査では削除せず、別タスクでCodexを使った重複・未使用調査を行う候補とする。

## 重大度

```txt
Critical：なし
High：なし
Medium（未対応）：なし

対応済みのMedium候補：
- connpass検索APIを未ログイン状態で利用できる問題

Low・改善候補：
- /auth/callbackのnext検証
- /set-passwordが招待セッションを区別していない
- 現在のパスワード再確認なしでパスワード変更できる
- パスワード最低文字数が6文字
- Redirect URLsの重複
- Supabase Client関連ファイルの重複
- connpass検索APIの追加レート制限
```

## 対応済み

### 2026年7月22日

Supabase Dashboardで次を変更した。

```txt
Email OTP expiration
86400秒から3600秒へ変更

Site URL
末尾の/を削除

招待メール
リンクを受信後1時間以内に開く案内を追加
```

### 2026年7月23日

connpass検索APIについて、次を変更した。

```txt
Pages RouterからApp Routerへ移行

supabase.auth.getUser()による認証確認を追加

未ログイン時
HTTP 401を返すよう変更

event_id・nickname・start・count
入力チェックを追加

connpass APIのstart
1始まりに合わせて変換
```

ローカル環境とVercel Previewで、未ログイン時に両APIがHTTP 401を返すことを確認した。

ログイン後のイベントID・URL検索、connpassユーザー名検索、ページ送りが正常に動作することも確認した。

修正はPR #77としてmainへマージ済みである。

## 次の対応

この監査で確認されたconnpass検索APIの未認証アクセス問題は対応済みである。

残る項目は、影響範囲を確認したうえで、別タスク・別PRとして扱う。

### 次に行う調査

* Supabase Client関連ファイルをCodexで調査
* 各ファイルの使用箇所とGit履歴を確認
* 重複・未使用ファイルの有無を確認
* 認証セッションへの影響を確認
* 安全な統合案と対応時期を整理

### 改善候補

* パスワード最低文字数を8文字へ変更
* パスワード変更時の再認証を検討
* Supabase Secure password change設定を確認
* `/auth/callback`のリダイレクト先検証を追加
* `/set-password`で招待セッションを区別する必要性を確認
* Redirect URLsを整理
* connpass検索APIの追加レート制限を検討
* Supabase Client関連の未使用・重複ファイルを整理
