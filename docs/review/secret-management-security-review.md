# 秘密情報・環境変数 安全性調査

調査日：2026年7月21日

## 対象

```txt
.gitignore
README.md
Git管理中のファイル
Gitの全履歴
Vercel Environment Variables
GitHub Secret scanning
```

主な確認対象の環境変数：

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CONNPASS_API_KEY
NEXT_PUBLIC_SIGNUP_MODE
NEXT_PUBLIC_DEV_SKIP_AUTH
```

## 調査目的

Supabaseのservice role keyやconnpass API keyなどの秘密情報について、現在のコードやGit履歴に実値が含まれていないか確認する。

あわせて、公開用環境変数とサーバー側秘密情報が適切に分離されているか、VercelとGitHubの設定を確認する。

## 結論

現時点では、Git管理中のファイルやGit履歴に、`.env`ファイル、秘密鍵ファイル、service role key、connpass API keyの実値が含まれている形跡は確認されなかった。

`SUPABASE_SERVICE_ROLE_KEY`と`CONNPASS_API_KEY`は、いずれも`NEXT_PUBLIC_`を付けず、サーバー側コードからのみ参照している。

Vercelでは両変数がSensitiveとして設定され、ProductionとPreviewに適用されていた。

GitHub Secret scanningも、Open・Closedともに0件で、未解決または過去に検出された秘密情報アラートは確認されなかった。

過去の開発用環境変数`NEXT_PUBLIC_DEV_SKIP_AUTH`は現在のコードでは使用されておらず、Vercelにのみ残っていたため削除した。

現時点では、秘密情報管理についてCritical・High・Medium相当の問題は確認されなかった。

## `.gitignore`の確認

`.gitignore`には、次の除外設定が存在する。

```gitignore
*.pem
.env*
.vercel
```

そのため、通常の`.env`系ファイル、PEM形式の秘密鍵、Vercelのローカル設定ディレクトリはGit管理対象から除外される。

## 現在の追跡ファイル

次の種類のファイルがGit管理されていないことを確認した。

```txt
.env
.env.local
.env.development
.env.production
その他の.env系ファイル

secret / secrets / credentialsディレクトリ
.pem
.key
.p12
.pfx
```

公開用の`.env.example`も、確認時点ではGit管理されていなかった。

## Git履歴の確認

Gitの全履歴を対象に、次を確認した。

- `.env`系ファイルがcommitされた形跡
- 秘密鍵・認証情報ファイルがcommitされた形跡
- `SUPABASE_SERVICE_ROLE_KEY`へ実値を直接記載した形跡
- `CONNPASS_API_KEY`へ実値を直接記載した形跡

確認に使用した主な検索：

```txt
git log --all --name-only
git log --all -G
git log --all -S
```

確認した範囲では、該当する秘密情報のcommit履歴は見つからなかった。

READMEには環境変数名と空の設定例が記載されているが、実値は含まれていない。

## 現在のコードでの使用場所

### SUPABASE_SERVICE_ROLE_KEY

使用場所：

```txt
src/app/api/account/delete/route.ts
```

アカウント削除用のRoute Handler内で、サーバー側環境変数として参照している。

ブラウザ側コードや`NEXT_PUBLIC_`環境変数としての使用は確認されなかった。

service role keyはRLSを回避できる強い権限を持つため、現在のようにサーバー側だけで使用する必要がある。

### CONNPASS_API_KEY

使用場所：

```txt
src/pages/api/search-event.ts
src/pages/api/search-user.ts
```

connpass API v2を呼び出すサーバー側APIで参照している。

ブラウザ側コードや`NEXT_PUBLIC_`環境変数としての使用は確認されなかった。

### NEXT_PUBLIC_SUPABASE_URL

Supabaseプロジェクトの接続先URL。

ブラウザからSupabaseへ接続するために使用する公開前提の値であり、`NEXT_PUBLIC_`が付いていることは適切。

### NEXT_PUBLIC_SUPABASE_ANON_KEY

ブラウザからSupabaseへ接続するための公開anon key。

公開前提のキーであり、データへのアクセス範囲はRLSとログインユーザーの認証情報によって制御する。

service role keyとは異なり、ブラウザへ含まれることを前提としている。

### NEXT_PUBLIC_SIGNUP_MODE

使用場所：

```txt
src/app/login/page.tsx
src/app/signup/page.tsx
```

次の表示切り替えに使用している。

```txt
invite：招待制の案内を表示
public：新規登録フォームを表示
未設定：invite
```

秘密情報ではなく、ブラウザへ公開されても問題ない設定値。

VercelではSensitiveになっていたが、セキュリティ上の問題はない。一方、秘密情報ではないためSensitive設定は必須ではない。

この変数は画面表示の切り替え用であり、Supabase Auth側での新規登録可否は別途設定確認が必要。

## NEXT_PUBLIC_DEV_SKIP_AUTH

過去には、未ログイン時に架空の開発ユーザーを返すための`useDevUser`フックで参照されていた。

```txt
src/hooks/useDevUser.ts
```

ただし、削除直前の履歴を確認したところ、`useDevUser`は定義されているだけで、ほかのコードからimport・使用されていなかった。

そのため、この変数によって実際に認証スキップ処理が動作していた形跡は確認されなかった。

`useDevUser.ts`は2026年5月22日のコミットで削除され、READMEからの記載も2026年6月16日に削除されている。

現在のコードには使用箇所がない一方、Vercelに設定だけが残っていたため、2026年7月21日にVercelから削除した。

## Vercel Environment Variables

確認時点の設定は次のとおり。

```txt
NEXT_PUBLIC_SIGNUP_MODE
適用環境：Production / Preview
Sensitive：あり

SUPABASE_SERVICE_ROLE_KEY
適用環境：Production / Preview
Sensitive：あり

CONNPASS_API_KEY
適用環境：Production / Preview
Sensitive：あり

NEXT_PUBLIC_SUPABASE_URL
適用環境：All Environments
Sensitive：なし

NEXT_PUBLIC_SUPABASE_ANON_KEY
適用環境：All Environments
Sensitive：なし
```

秘密情報である`SUPABASE_SERVICE_ROLE_KEY`と`CONNPASS_API_KEY`は、Sensitiveとして管理されている。

公開前提のSupabase URLとanon keyはSensitiveではないが、これは想定どおり。

不要になっていた`NEXT_PUBLIC_DEV_SKIP_AUTH`は削除した。

環境変数の削除は新しいデプロイから反映される。現在のコードではこの変数を参照していないため、削除直後の再デプロイは行わず、次回の通常デプロイで反映する方針とした。

## GitHub Secret scanning

GitHubの次の画面を確認した。

```txt
Security and quality
→ Secret scanning
```

確認結果：

```txt
Open：0件
Closed：0件
No secrets found
```

GitHub Secret scanningで、未解決または過去に検出された秘密情報アラートは確認されなかった。

## 重大度

```txt
Critical：なし
High：なし
Medium：なし
Low：未使用のNEXT_PUBLIC_DEV_SKIP_AUTHがVercelに残っていた
対応済み：NEXT_PUBLIC_DEV_SKIP_AUTHをVercelから削除
整理候補：NEXT_PUBLIC_SIGNUP_MODEのSensitive設定
```

## 調査の限界

今回の確認は、Gitのファイル名・履歴検索、現在のコード参照、GitHub Secret scanning、Vercel設定を組み合わせて実施した。

ただし、次の理由から、秘密情報が一度も存在しなかったことを完全に保証するものではない。

- Secret scanningがすべての秘密情報形式を検出するとは限らない
- 任意の文字列として記載された秘密情報は、変数名検索だけでは検出できない場合がある
- Git管理外のローカルファイルや、過去に削除された外部サービス上の設定までは確認できない
- Vercel上のSensitiveな実値そのものが正しいかは、値を表示せずに確認している

秘密情報の漏洩が疑われる場合は、Gitから削除するだけではなく、対象キーの失効・再発行を優先する。

## 外部レビューで確認したいこと

- service role keyの使用範囲がアカウント削除APIだけで適切か
- connpass API keyを使用するAPIの構成が適切か
- VercelでのProduction・Previewの適用範囲が妥当か
- Supabase Auth側で新規登録を制限する設定が必要か
- 追加の秘密情報スキャンツールを導入する必要があるか

## 対応方針

現時点では、秘密情報のローテーションやGit履歴の書き換えは不要と判断する。

今後は次を継続する。

- 秘密情報を`.env.local`またはVercel Environment Variablesで管理する
- `.env`系ファイルをcommitしない
- service role keyをブラウザ側コードで使用しない
- 秘密情報へ`NEXT_PUBLIC_`を付けない
- GitHub Secret scanningのアラートを定期的に確認する
- 漏洩が疑われた場合は、対象キーを直ちに失効・再発行する
