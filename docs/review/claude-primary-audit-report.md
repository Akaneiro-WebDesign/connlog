> [!NOTE]
> この文書は、2026年8月17日にClaude Code 2.1.233を使用し、主監査モデルClaude Opus 5・effort highで実施した独立静的監査の出力です。
> JSON形式の実行結果から`result`本文を抽出し、公開リポジトリへの保存にあたってローカル絶対パス1件を相対表記へ変更し、会話用の前置き・終了文と原出力形式の表記を整理しています。監査内容・指摘事項・結論には変更を加えていません。

# ConnLog 独立一次セキュリティ監査報告（静的確認）

作成日：2026年8月17日
監査区分：一次監査／静的確認のみ
原出力形式：Claude CodeのJSON出力（監査中のファイル作成なし）

---

## 1. 監査対象と実施範囲

### 対象

* 対象：現在の作業ディレクトリ `../connlog-claude-audit-2026-08-14` 配下のファイルのみ
* 提示されたコピー元commit SHA：`d6c6b0bf5216677911f30c00d396a1df4037e512`
* 提示ファイル数：60ファイル

### ファイル数の確認結果

ディレクトリ配下を列挙した結果、**ドットファイル（`.gitignore`）を含めて60ファイル**を確認しました。提示された60ファイルと件数は一致します。

**重要な制約：** commit SHA `d6c6b0b...` との一致は、この限定コピー内だけでは独立に証明できません。`.git`ディレクトリが提供されておらず、コミットオブジェクト・ツリーハッシュ・タグ・署名のいずれも参照できないためです。したがって「提示された内容が元リポジトリの当該commitと同一である」ことは**プロジェクト所有者の申告に依存する前提**であり、監査側で検証していません。

### 秘密情報・生成物の混入確認（ファイル名の範囲）

| 確認対象 | 結果 |
| --- | --- |
| `.env`、`.env.local`等 | 存在しない（`.gitignore`の`.env*`で除外設定あり） |
| APIキー・トークン・Cookieを含むファイル | 該当ファイル名なし |
| 既存監査報告・調査文書 | `docs/review`配下は`independent-security-audit-test-spec.md`のみ |
| ZAPレポート | `zap-reports/`、`zap.yaml`とも存在しない（`.gitignore`に除外記載あり） |
| DBバックアップ | `backups/`は存在しない（`.gitignore`に除外記載あり） |
| ビルド生成物・`node_modules` | 存在しない |

ファイル名の範囲では、参照禁止対象の混入は確認されませんでした。なお、ファイル**内容**に秘密情報が含まれていないことまでは、全ファイル精読を行った`src`・設定・SQLの範囲で確認しており、`package-lock.json`は文字列検索の範囲での確認です。

### 対象外・未実施

仕様書「6. 禁止する操作」および今回の依頼「5. 禁止する操作」に従い、以下は一切実施していません：ファイル変更・作成・削除、npm操作、アプリ起動、SQL実行、ネットワーク接続、Web検索、`npm audit`、API送信、Preview/Production環境アクセス、サブエージェント起動、作業ディレクトリ外へのアクセス、攻撃コード作成。実地の動的検証（2アカウント間のデータ分離確認、ヘッダー実返却確認、RLS実状態確認）は**すべて未実施**です。

---

## 2. 実施した確認方法

1. ディレクトリ全体のファイル列挙（グロブ検索、ドットファイル含む）
2. `docs/review/independent-security-audit-test-spec.md`の精読
3. `docs/architecture/connlog-system-overview.md`の精読
4. `package.json`、`next.config.ts`、`tsconfig.json`、`eslint.config.mjs`、`middleware.ts`、`.gitignore`の精読
5. `package-lock.json`は文字列検索で対象を絞り、主要パッケージのバージョン行と`resolved`/`integrity`/レジストリ出所の件数のみを確認（全文精読は監査上不要と判断）
6. `src/app/**/route.ts`（8メソッド／7ファイル）の全文精読
7. `src/lib`配下9ファイルの全文精読
8. `src/app/**/page.tsx`のうち認証・秘密情報・入力に関わるもの（`page.tsx`、`login`、`signup`、`set-password`、`profile`）を全文精読、`dashboard`/`events`/`skills`/`search`は認証ガードとデータ取得経路を検索＋該当箇所読み取りで確認
9. `src/components`は`dangerouslySetInnerHTML`・`innerHTML`・`eval`・`href`・`target`・`maxLength`・Supabaseクライアント利用箇所を横断検索し、該当箇所を読み取り
10. `process.env.*`参照箇所の全件抽出
11. `docs/db`配下SQL 3ファイルの全文精読とアプリケーションコードとの照合

---

## 3. Route Handlerと認証関連処理の一覧

### API Route Handler（すべて保護対象・公開APIは存在しない）

| # | パス | メソッド | ファイル | Handler内認証 | 所有者条件 | 入力検証 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `/api/search-event` | GET | `src/app/api/search-event/route.ts` | `auth.getUser()` L8-15 | 該当なし（外部API中継） | `^\d+$` L19 |
| 2 | `/api/search-user` | GET | `src/app/api/search-user/route.ts` | `auth.getUser()` L12-20 | 該当なし（外部API中継） | 長さ・整数・範囲 L33-54 |
| 3 | `/api/dashboard-data` | POST | `src/app/api/dashboard-data/route.ts` | `auth.getUser()` L64-72 | `.eq("user_id", userId)` L81/87/90 | 入力なし（ボディ不使用） |
| 4 | `/api/events/update` | PUT | `src/app/api/events/update/route.ts` | `auth.getUser()` L8-15 | `.eq("user_id", user.id)` L33/78、挿入時`user.id`固定 L50-52/93 | `event_id`必須のみ L19 |
| 5 | `/api/events/delete` | DELETE | `src/app/api/events/delete/route.ts` | `auth.getUser()` L52-60 | `.eq("user_id", user.id)` L13/43/93 | `event_id`必須のみ L82 |
| 6 | `/api/profile` | GET | `src/app/api/profile/route.ts` | `auth.getUser()` L11-18 | `.eq("id", user.id)` L23 | 入力なし |
| 7 | `/api/profile` | PUT | `src/app/api/profile/route.ts` | `auth.getUser()` L53-60 | `.eq("id", user.id)` L92/130、挿入時`user.id`固定 L108 | 型・長さ検証 L64-85 |
| 8 | `/api/account/delete` | DELETE | `src/app/api/account/delete/route.ts` | `auth.getUser()` L25-35 | `user.id`のみを条件に使用 L37以降 | 入力なし（引数を受け取らない） |

**共通事実：** 8メソッドすべてがRoute Handler内で`createSupabaseServerClient()`＋`auth.getUser()`を実行し、失敗時に401を返します。middlewareの通過のみに依存している保護対象APIは確認されませんでした。また、**リクエストボディ・クエリから`user_id`や所有者IDを受け取っているHandlerは1つも存在しません**（横断検索で確認）。所有者はすべてサーバー側の`user.id`から導出されています。

### 認証関連ルート

| パス | ファイル | 処理内容 |
| --- | --- | --- |
| `/auth/confirm` | `src/app/auth/confirm/route.ts` | `type === "invite"`のみ許可（L21）、`verifyOtp`（L27-30）、既定`/set-password`へ遷移（L4, L36） |
| `/auth/callback` | `src/app/auth/callback/route.ts` | `exchangeCodeForSession`（L21）、既定`/dashboard`へ遷移（L4, L23） |
| `middleware.ts` | ルート直下 | `auth.getUser()`によるセッション更新のみ（L37）。認可判定・リダイレクトは行わない。matcherは静的アセット以外の全パス（L42-46） |
| `src/app/logout/actions.ts` | Server Action | `signOut()`のみ |

### 認証状態を扱うクライアント処理

| ファイル | 処理 |
| --- | --- |
| `src/components/UserProvider.tsx` | `getSession()`＋`onAuthStateChange`でコンテキスト提供 |
| `src/app/page.tsx` | サーバー側`getUser()`で`/dashboard`または`/login`へリダイレクト（L4-15） |
| `src/app/login/page.tsx` | `signInWithPassword`（L36） |
| `src/app/signup/page.tsx` | `signUp`（L32）。`NEXT_PUBLIC_SIGNUP_MODE !== "public"`のとき登録フォーム自体を描画しない（L59-125） |
| `src/app/set-password/page.tsx` | `getSession()`確認（L25）→`updateUser({password})`（L61） |
| `src/app/profile/page.tsx` | `updateUser({password})`（L254）、`/api/account/delete`呼び出し（L287）、`signOut`（L300） |
| `src/app/{dashboard,events,skills,search}/page.tsx` | `useUser()`＋`router.replace("/login")`によるクライアント側ガード |
| `src/lib/saveEventWithTagsAndNote.ts` | ブラウザ用クライアントで`events`/`tags`/`notes`へ直接書き込み（RLS依存） |

---

## 4. 指摘事項の一覧

**Critical・High相当の問題は、提供ファイルの範囲では確認されませんでした。**（「確認されなかった」ことは「安全性が証明された」ことを意味しません。第7・8節の未確認事項を必ず併読してください。）

| 識別子 | タイトル | 重大度 | 確信度 | MVP前対応 |
| --- | --- | --- | --- | --- |
| CL-01 | `notes`・`users`のRLS定義がリポジトリ内に存在せず、静的に検証不能 | Informational（リスクは未確定） | 高（不在の事実） | 必須（環境側での確認） |
| CL-02 | パスワード変更・アカウント削除に再認証（現行パスワード確認）がない | Medium | 中 | 推奨 |
| CL-03 | タグ・メモに文字数・件数の上限がサーバー・クライアント双方で存在しない | Medium | 高 | 推奨 |
| CL-04 | DBエラーメッセージが`details`としてレスポンスへ露出する | Low | 高 | 推奨 |
| CL-05 | イベント保存がブラウザ直接書き込みで、`event_url`が`href`へ無検証で渡る（自己XSSの可能性） | Low | 中 | 後続検討 |
| CL-06 | CSPの`script-src`に`'unsafe-inline'`が含まれる | Low | 高 | 後続検討 |
| CL-07 | 保護対象画面の認証ガードがクライアント側のみでSSRガードがない | Low | 高 | 後続検討 |
| CL-08 | アカウント削除処理が非トランザクションで、部分失敗時に不整合が残る | Low | 高 | 後続検討 |
| CL-09 | `handle_new_user()`の定義がリポジトリに存在せず、`SECURITY DEFINER`・`search_path`・実行権限を検証不能 | Informational | 高（不在の事実） | 必須（環境側での確認） |
| CL-10 | connpass中継APIにレート制限がなく、認証ユーザーがAPIキーの利用枠を消費できる | Informational | 高 | 後続検討 |
| CL-11 | `/api/events/delete`の`external_event_id`に型検証がない | Informational | 高 | 後続検討 |
| CL-12 | `getSafeNextPath`がバックスラッシュ始まりのパスを個別に弾いていない（外部遷移は成立しないと判断） | Informational | 中 | 対応不要 |

---

## 5. 各指摘の詳細

### CL-01：`notes`・`users`のRLS定義がリポジトリ内に存在せず、静的に検証不能

* **重大度：** Informational（実際のリスクは環境依存で未確定）
* **対象ファイル：** `docs/db/`配下全3ファイル、`src/lib/saveEventWithTagsAndNote.ts`、`src/app/api/profile/route.ts`
* **該当箇所：** `docs/db/2026-07-14-fix-events-tags-rls-ownership.sql` L48・L95（`events`・`tags`のみRLS有効化とPolicy定義）／`saveEventWithTagsAndNote.ts` L204-210（ブラウザクライアントから`notes`へ直接INSERT）
* **確認済み事実：**
  * `docs/db`に存在するSQLは3件のみ。RLSを定義しているのは`2026-07-14-fix-events-tags-rls-ownership.sql`だけで、対象は`public.events`と`public.tags`に限られる。
  * 同SQLは`ENABLE ROW LEVEL SECURITY`、SELECT/INSERT/UPDATE/DELETEの4Policy、`TO authenticated`ロール限定、`(SELECT auth.uid()) = user_id`条件を定義しており、内容自体は適切。
  * `public.notes`と`public.users`のRLS有効化・Policy定義は、提供ファイル内に**一切存在しない**。
  * 一方でアプリは、ブラウザ用anonキークライアントから`notes`へ直接INSERT/DELETEを行う（`saveEventWithTagsAndNote.ts` L191-215）。`users`はRoute Handler経由だがanonキークライアント（`createSupabaseServerClient`）を使用する。
  * `connlog-system-overview.md` L197は「`events`、`tags`、`notes`の3テーブルに同条件が設定されていた（2026年8月8日にSQL Editorで確認）」と記載するが、これは文書上の記述であり、リポジトリ内のSQLはこれを裏付けない。`users`については同文書も明示していない。
* **推測・未確認事項：** 実際のSupabase環境で`notes`・`users`のRLSが有効か、どのPolicyが存在するかは未確認。仕様書の指示どおり「提供されていない定義は未確認」として扱う。
* **根拠：** `docs/db`配下のSQL全文精読、および`ENABLE ROW LEVEL SECURITY`／`CREATE POLICY`の全文検索結果（`notes`・`users`に対する記述なし）。
* **再現条件：** 実環境での`pg_policies`・`pg_class.relrowsecurity`の確認が必要。静的確認では再現不能。
* **必要な攻撃条件：** 仮にRLSが無効または不適切な場合、認証済みの任意ユーザーがブラウザのanonキークライアント経由で他ユーザーの`notes`・`users`行を読み書きできる可能性がある。攻撃者は正規のテストユーザー1名で足りる。
* **想定される影響：** RLSが不備であれば、他ユーザーのメモ本文・表示名・自己紹介の閲覧または改変（High相当）。ただしAPI経路は`.eq("user_id"/"id", user.id)`で絞り込むため、API経由でのみ利用する限り漏えいは発生しない。
* **確信度：** 高（「定義がリポジトリ内に存在しない」という事実について）／実リスクの有無は不明
* **誤検知の可能性：** 高い。過去のmigrationが`docs/db`に記録されていないだけで、実環境では適切に設定されている可能性が十分にある。
* **MVP公開前の対応必要性：** 必須（環境側での確認として）
* **推奨対応：** Supabase SQL Editorで`public.notes`・`public.users`のRLS有効状態と、SELECT/INSERT/UPDATE/DELETE各操作に対応するPolicyの有無・条件・対象ロールを確認し、結果を`docs/db`へSQLまたは確認記録として残すこと。`events`・`tags`と同様に`TO authenticated`かつ`auth.uid() = user_id`（`users`は`auth.uid() = id`）へ統一することを推奨。あわせて、`docs/db`のSQLが現在のDB状態の完全な表現ではない点を、文書側でも明示しておくこと。

---

### CL-02：パスワード変更・アカウント削除に再認証（現行パスワード確認）がない

* **重大度：** Medium
* **対象ファイル：** `src/app/profile/page.tsx`、`src/app/set-password/page.tsx`、`src/app/api/account/delete/route.ts`
* **該当箇所：** `profile/page.tsx` L230-278（`handleChangePassword`：新パスワードと確認用のみで`supabase.auth.updateUser`を実行）、L280-312（`handleDeleteAccount`：確認モーダルのクリックのみで`DELETE /api/account/delete`）／`set-password/page.tsx` L22-39（セッションの有無のみ確認）、L61（`updateUser`）／`api/account/delete/route.ts` L25-35（セッション確認のみ）
* **確認済み事実：**
  * パスワード変更フローで、現行パスワードの入力や再認証ステップは一切実装されていない。検証は「6文字以上」（L233）と「確認用と一致」（L239）のみ。
  * アカウント削除は`DELETE /api/account/delete`にボディなしで送信され、Handler側もセッション確認のみで削除を実行する。パスワード再入力、メール確認、「削除」文字列の入力といった追加確認はない。
  * `/set-password`はセッションの存在のみを条件とし、招待経由か通常ログイン中かを区別しない。ログイン済みユーザーが直接アクセスしてパスワードを変更できる。
* **推測・未確認事項：** Supabase Auth側の「Secure password change（パスワード変更時に再認証を要求）」設定の有無はダッシュボード設定であり、リポジトリからは確認できない。有効であればSupabase側で再認証が強制され、本指摘の前半は緩和される。セッションCookieの有効期限・`SameSite`属性も未確認。
* **根拠：** 上記ファイルの全文精読。`reauthenticate`・現行パスワード入力フィールドの全文検索で該当なし。
* **再現条件：** 認証済みセッション（Cookie）を保持した状態で`/profile`へアクセスし、パスワード変更または削除を実行。静的確認のため未再現。
* **必要な攻撃条件：** 被害者のセッションを取得済みであること（共用端末での放置、Cookie窃取、物理的アクセスなど）。認証情報自体は不要。
* **想定される影響：** 一時的にセッションを掌握した第三者が、パスワードを変更して正規利用者を締め出す（アカウント乗っ取りの完結）、またはアカウントと全データを不可逆に削除できる。単独では成立せず、先行してセッション奪取が必要なため二次的な影響。
* **確信度：** 中（コード上の不在は確定。Supabase側設定による緩和可能性が残る）
* **誤検知の可能性：** あり。Supabaseの`Secure password change`が有効な場合、`updateUser`は再認証なしでは失敗する。
* **MVP公開前の対応必要性：** 推奨
* **推奨対応：** Supabase Authの「Secure password change」設定を確認し、有効化することを推奨。アカウント削除については、パスワード再入力または確認文字列の入力を必須とし、Route Handler側でも受け取った値の検証を行う設計とすること。`/set-password`は、招待直後のセッション（`app_metadata`やユーザー作成からの経過時間など）に限定するか、通常ログイン中は`/profile`のパスワード変更へ誘導することを検討すること。

---

### CL-03：タグ・メモに文字数・件数の上限がサーバー・クライアント双方で存在しない

* **重大度：** Medium
* **対象ファイル：** `src/app/api/events/update/route.ts`、`src/lib/saveEventWithTagsAndNote.ts`、`src/components/NoteInput.tsx`、`src/components/SkillTagInput.tsx`、`src/components/EventListComponent.tsx`
* **該当箇所：** `api/events/update/route.ts` L17-24（`event_id`の存在確認のみ）、L44-53（`tags`は空文字除去のみで件数・長さ無制限）、L89-94（`note`は`trim()`のみ）／`saveEventWithTagsAndNote.ts` L165-215（同様に無制限）
* **確認済み事実：**
  * `PUT /api/events/update`は`tags`配列の要素数・各要素の文字数、`note`の文字数のいずれも検証しない。`Array.isArray(tags)`の型確認はあるが、各要素が文字列であることの確認はなく、非文字列要素に対して`tag.trim()`を呼ぶため実行時例外となりうる（catchで500応答）。
  * `event_id`は`String(event_id)`へ変換されるのみで、数値形式の検証がない（`/api/search-event` L19の`^\d+$`検証とは非対称）。
  * クライアント側でも、`src/components`全体に対する`maxLength`の全文検索でタグ・メモ入力に上限は見つからなかった。上限が設定されているのは`/profile`の表示名（50）と自己紹介（300）のみで、これらはサーバー側にも対応する検証がある（`api/profile/route.ts` L4-5, L69-85）。
* **推測・未確認事項：** DB側の列型（`text`か`varchar(n)`か）およびCHECK制約の有無は、提供SQLに`notes`・`tags`のスキーマ定義がないため未確認。列に長さ制限があれば実質的に緩和される。
* **根拠：** 上記ファイルの精読と`maxLength`・`MAX_`の全文検索結果。
* **再現条件：** 認証済みユーザーが`PUT /api/events/update`へ巨大な`note`文字列や大量の`tags`要素を送信する。静的確認のため未再現。
* **必要な攻撃条件：** 有効な認証セッション1つ。招待制のため外部の匿名者は該当しない。
* **想定される影響：** ストレージ肥大、`/api/dashboard-data`の応答遅延・メモリ消費増、UI表示崩れ。悪意ある利用者1名でもDBを膨張させられる。他ユーザーのデータへの影響はない。
* **確信度：** 高
* **誤検知の可能性：** 低（コード上の不在は確定）。ただしDB列制約による緩和の可能性は残る。
* **MVP公開前の対応必要性：** 推奨
* **推奨対応：** `/api/profile`と同様に、`/api/events/update`と保存処理へサーバー側の上限（例：タグ1件あたりの文字数、タグ件数の上限、メモの文字数上限）と型検証（各タグが文字列であること、`event_id`が数値形式であること）を追加すること。クライアント側の`maxLength`は補助であり、サーバー側検証と併用すること。DB列にもCHECK制約を設けると多層になる。

---

### CL-04：DBエラーメッセージが`details`としてレスポンスへ露出する

* **重大度：** Low
* **対象ファイル：** `src/app/api/events/update/route.ts`、`src/app/api/events/delete/route.ts`、`src/app/api/dashboard-data/route.ts`
* **該当箇所：** `events/update/route.ts` L38・L65・L83・L101（`details: <error>.message`）／`events/delete/route.ts` L22・L40・L99／`dashboard-data/route.ts` L102・L113・L124・L310（`details: error instanceof Error ? error.message : "Unknown error"`）
* **確認済み事実：** 上記の各500応答で、PostgRESTまたはSupabaseクライアントが返すエラーメッセージ本文がそのままJSONへ含まれる。対照的に、`/api/profile`と`/api/account/delete`は固定の日本語メッセージのみを返し、詳細は`console.error`へのみ出力しており、実装方針が統一されていない。
* **推測・未確認事項：** 実際に返される文字列の内容（列名・制約名・型情報がどこまで含まれるか）は、DBエラーを発生させないと確認できない。
* **根拠：** 上記各行の精読。`details:`の全文検索により露出箇所を特定。
* **再現条件：** DB制約違反や権限エラーを誘発するリクエストを認証済みユーザーが送信する。静的確認のため未再現。
* **必要な攻撃条件：** 有効な認証セッション1つ。
* **想定される影響：** 列名、制約名（例：`events_owner_columns_match_user_id_check`）、RLS違反の有無といった内部構造の断片が利用者へ伝わり、後続攻撃の情報収集に利用されうる。単独で直接の権限昇格やデータ漏えいには至らない。
* **確信度：** 高
* **誤検知の可能性：** 低
* **MVP公開前の対応必要性：** 推奨
* **推奨対応：** `/api/profile`・`/api/account/delete`の方式に統一し、クライアントへは固定メッセージのみを返して、詳細は`console.error`によるサーバーログのみに留めること。開発時のみ`details`を含める分岐にする方法もある。

---

### CL-05：イベント保存がブラウザ直接書き込みで、`event_url`が`href`へ無検証で渡る（自己XSSの可能性）

* **重大度：** Low
* **対象ファイル：** `src/lib/saveEventWithTagsAndNote.ts`、`src/components/EventListComponent.tsx`、`src/components/EventSearchForm.tsx`、`src/components/SearchTagMemoModal.tsx`
* **該当箇所：** `saveEventWithTagsAndNote.ts` L41-69（`convertConnpassToDatabase`：クライアント側stateをそのままDB行へ変換）、L140-151（ブラウザクライアントから`events`へINSERT）／`EventListComponent.tsx` L312-314・L492-494（`href={event.event_url || event.url}`）／`EventSearchForm.tsx` L494-496／`SearchTagMemoModal.tsx` L166-168
* **確認済み事実：**
  * イベントの保存経路はサーバーAPIを経由せず、ブラウザ用Supabaseクライアントから直接`events`へINSERT/UPDATEされる。保存される`title`・`description`・`event_url`・`organizer`等の値がconnpass API由来であることを、サーバー側で検証する処理は存在しない。
  * `event_url`はスキーム検証なしに`<a href={...}>`へ渡される。`target="_blank" rel="noopener noreferrer"`は3箇所すべてで正しく設定されている（リバースタブナビング対策は実施済み）。
  * `dangerouslySetInnerHTML`はプロジェクト全体で使用されていない（全文検索で0件）。`innerHTML`の使用は`sanitizeEventDescription.ts` L14の1箇所のみで、これはブラウザ環境でHTMLを**除去して`textContent`を取り出す**目的であり、取得したテキストはReactのJSX展開でエスケープされる。
  * `next.config.ts` L20-22のCSP `script-src`に`'unsafe-inline'`が含まれるため、`javascript:`スキームURLがCSPで遮断されない可能性がある（CL-06参照）。
* **推測・未確認事項：** React 18.3.1が`javascript:`スキームの`href`をレンダリング時に遮断するか警告のみかは、実行して確認していない。ブラウザ側の挙動も未確認。
* **根拠：** 上記各行の精読、`dangerouslySetInnerHTML`／`innerHTML`／`href=`の全文検索。
* **再現条件：** 利用者が自分のセッションでSupabaseへ直接INSERTを行い、自身の`events`行の`event_url`に`javascript:`スキームを設定したうえで、自分の`/events`画面でそのリンクをクリックする。静的確認のため未再現。
* **必要な攻撃条件：** 攻撃対象は自分自身のデータのみ。RLSにより他ユーザーの行は作成できない（`events`のINSERT Policyが`WITH CHECK (auth.uid() = user_id)`のため）。他者を攻撃するには、被害者自身に不正な値を保存させる必要がある。
* **想定される影響：** 現状は自己XSSに留まり、他ユーザーへの影響はない。ただし将来イベント共有・公開機能を追加した場合、格納型XSSへ発展しうる構造上のリスクがある。
* **確信度：** 中
* **誤検知の可能性：** あり。Reactまたはブラウザが`javascript:`スキームを遮断する場合、実害は生じない。
* **MVP公開前の対応必要性：** 後続検討
* **推奨対応：** 表示前に`event_url`のスキームを`https:`/`http:`のみへ制限するホワイトリスト検証を追加すること。より根本的には、イベント保存をサーバーのRoute Handler経由に変更し、サーバー側でconnpass APIから取得した値を用いて保存する設計へ寄せることで、DBへ入る値の出所を保証できる。

---

### CL-06：CSPの`script-src`に`'unsafe-inline'`が含まれる

* **重大度：** Low
* **対象ファイル：** `next.config.ts`
* **該当箇所：** L20-22（`script-src 'self' 'unsafe-inline'`、開発時のみ`'unsafe-eval'`追加）、L19（`style-src 'self' 'unsafe-inline'`）
* **確認済み事実：** Production環境でも`script-src`に`'unsafe-inline'`が付与される設定になっている。nonceやhashによる制御は実装されていない。一方で、`default-src 'self'`、`base-uri 'self'`、`form-action 'self'`、`frame-ancestors 'none'`、`object-src 'none'`、`connect-src`のSupabaseオリジン限定、`upgrade-insecure-requests`（Production時）は適切に設定されている。
* **推測・未確認事項：** 実際のHTTPレスポンスヘッダーとして返却されるかは、Preview環境での確認が必要。Vercel側で別途ヘッダーが上書き・追加されている可能性も未確認。
* **根拠：** `next.config.ts` L11-63の精読。
* **再現条件：** 別途XSSの注入点が存在する場合にのみ意味を持つ設定上の弱点。単独では再現条件なし。
* **必要な攻撃条件：** 他のXSS脆弱性の存在が前提。
* **想定される影響：** インラインスクリプト注入が可能になった場合、CSPによる緩和が効かない。現時点でXSS注入点は確認されていないため（CL-05の自己XSSを除く）、単独の影響は小さい。
* **確信度：** 高（設定内容について）
* **誤検知の可能性：** 低。ただしNext.jsのインラインブートストラップスクリプトの都合上、nonce導入には相応の実装が必要であり、`'unsafe-inline'`は現実的な選択でもある。
* **MVP公開前の対応必要性：** 後続検討
* **推奨対応：** middlewareでリクエストごとにnonceを生成し、`script-src 'self' 'nonce-...' 'strict-dynamic'`へ移行することを中期的に検討すること。MVP段階では、`dangerouslySetInnerHTML`不使用の維持とCL-05のURL検証で注入点を作らない方針を優先してよい。

---

### CL-07：保護対象画面の認証ガードがクライアント側のみでSSRガードがない

* **重大度：** Low
* **対象ファイル：** `src/app/dashboard/page.tsx`、`src/app/events/page.tsx`、`src/app/skills/page.tsx`、`src/app/search/page.tsx`、`src/app/profile/page.tsx`、`middleware.ts`
* **該当箇所：** `events/page.tsx` L92-98、`dashboard/page.tsx` L122、`skills/page.tsx` L89、`search/page.tsx` L64、`profile/page.tsx` L123-129（いずれも`useEffect`内の`router.replace("/login")`）／`middleware.ts` L37（`getUser()`のみで認可判定なし）
* **確認済み事実：**
  * 保護対象5画面はすべて`"use client"`であり、認証判定は`UserProvider`の`getSession()`結果に基づくクライアント側リダイレクトのみ。`src/app/page.tsx`のようなサーバー側`redirect()`は使用していない。
  * middlewareはセッションCookieのリフレッシュのみを行い、リダイレクトや403を返さない（matcherは全パスに及ぶが、認可には使われない）。
  * ただし、これらの画面が表示するデータはすべて`/api/dashboard-data`・`/api/profile`から取得され、各Route Handlerが独立に401を返すため、未認証状態でデータが返ることはない。`events/page.tsx` L188、`profile/page.tsx` L316のように`if (!user) return null;`でレンダリングも抑止される。
* **推測・未確認事項：** 未認証で保護URLへ直接アクセスした際に、画面の枠（Sidebar/Header）が一瞬描画されるか、白画面のままかは実際の動作確認が必要。
* **根拠：** 上記各行の精読、および`/api/dashboard-data`・`/api/profile`の401分岐（それぞれL69-72、L16-18）の確認。
* **再現条件：** 未認証状態で`/dashboard`等へ直接アクセス。静的確認のため未再現。
* **必要な攻撃条件：** なし（未認証でよい）。ただし取得できるデータは存在しない。
* **想定される影響：** 個人データの漏えいには至らない。UX上のちらつきと、防御層が1つ少ないという設計上の弱さ。
* **確信度：** 高
* **誤検知の可能性：** 低（ただし「脆弱性」というより多層防御上の改善点）
* **MVP公開前の対応必要性：** 後続検討
* **推奨対応：** middlewareで保護対象パスの未認証アクセスを`/login`へリダイレクトする、または各画面をServer Componentのラッパーで包んでサーバー側`redirect()`を行うこと。いずれの場合も、既存のRoute Handler内認証とRLSは維持すること（middlewareへの依存に置き換えないこと）。

---

### CL-08：アカウント削除処理が非トランザクションで、部分失敗時に不整合が残る

* **重大度：** Low
* **対象ファイル：** `src/app/api/account/delete/route.ts`
* **該当箇所：** L40-181（notes → tags×3列 → events×3列 → users → Auth userの順に、計9回の削除を逐次実行。各段階で失敗すると即座に500を返し、ロールバックしない）
* **確認済み事実：**
  * 削除はservice roleクライアントで9段階に分けて実行され、どの段階も直前の成功を巻き戻す処理がない。例えばevents削除に失敗した場合、notes・tagsは削除済みのまま、Authユーザーは残る。
  * すべての削除条件が`userId`（＝`auth.getUser()`で取得した本人のID）に固定されており、リクエストから所有者情報を受け取らない設計は適切。
  * `tags`は`user_id`・`owner_id`・`created_by_id`、`events`は`user_id`・`owner_id`・`created_by`と、旧所有者列を含めた網羅的な削除を行っている。`2026-07-14-fix-events-tags-rls-ownership.sql` L26-42のCHECK制約により、これらの列は`user_id`と一致することが保証されるため、他ユーザー行を巻き込む条件にはならない（`events.owner_id = user_id::text`、`tags.owner_id = user_id`）。
  * クライアント側（`profile/page.tsx` L293-302）は、レスポンスがokの場合のみ`signOut()`とリダイレクトを行い、失敗時はエラーを表示してセッションを維持する。
* **推測・未確認事項：** 実DBに`ON DELETE CASCADE`外部キーが設定されていれば、一部の削除は冗長になり、失敗リスクも下がる。提供SQLに定義がないため未確認。
* **根拠：** 上記行の精読、およびSQLのCHECK制約との照合。
* **再現条件：** 削除処理の途中でDBエラーが発生する状況。静的確認のため未再現。
* **必要な攻撃条件：** なし（攻撃ではなく障害時の挙動）。
* **想定される影響：** 利用者のデータが一部だけ消え、Authアカウントは残る状態になりうる。利用者は再ログインして再試行できるが、削除済みデータは戻らない。プライバシー観点では「消え残り」より「消え過ぎ」の順序（notesから先に削除）である点に留意が必要。
* **確信度：** 高
* **誤検知の可能性：** 低
* **MVP公開前の対応必要性：** 後続検討
* **推奨対応：** DB関数（`SECURITY DEFINER`、`search_path`固定、引数なしで`auth.uid()`を内部利用、`authenticated`にのみEXECUTE付与）へ一連の削除をまとめてトランザクション化するか、外部キーに`ON DELETE CASCADE`を設定して削除段数を減らすこと。少なくとも、部分失敗時に管理者が検知できるよう、失敗した段階と`userId`をログへ記録する現行方針は維持すること（現在も実装済み）。

---

### CL-09：`handle_new_user()`の定義がリポジトリに存在せず、`SECURITY DEFINER`等を検証不能

* **重大度：** Informational
* **対象ファイル：** `docs/db/`配下、`docs/architecture/connlog-system-overview.md`
* **該当箇所：** `connlog-system-overview.md` L238・L278-286（`public.handle_new_user()`と`on_auth_user_created`トリガーの存在を記載）／`docs/db`配下に対応するSQLなし
* **確認済み事実：**
  * `docs/db`に存在するのは、RLS修正・一意制約変更・不要関数削除の3ファイルのみ。`CREATE FUNCTION`は`2026-08-10-remove-unused-set-user-id-function.sql`の`DROP FUNCTION`を除いて1件も存在しない。
  * したがって`handle_new_user()`の本体、`SECURITY DEFINER`指定、`search_path`固定の有無、`anon`/`authenticated`へのEXECUTE権限、トリガー定義は**すべて静的に検証不能**。
  * 過度な権限付与（`GRANT ALL`等）、`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`、`GRANT ... TO anon`は、提供SQL 3ファイル全文の精読で1件も確認されなかった。`2026-08-10`のSQLは`RESTRICT`を明示して依存関係がある場合に失敗させる、慎重な書き方になっている。
* **推測・未確認事項：** 実環境における関数定義・権限の妥当性。
* **根拠：** `docs/db`配下SQL 3ファイルの全文精読。
* **再現条件・必要な攻撃条件：** 該当なし（未確認事項の記録）。
* **想定される影響：** 仮に`handle_new_user()`が`search_path`を固定しておらず、`anon`にEXECUTE権限があれば、権限昇格の起点となりうる。可能性の指摘であり、事実の指摘ではない。
* **確信度：** 高（定義がリポジトリ内に存在しないという事実について）
* **誤検知の可能性：** 高い（文書の記述どおり適切に設定されている可能性が十分にある）
* **MVP公開前の対応必要性：** 必須（環境側での確認として）
* **推奨対応：** Supabase上で`pg_get_functiondef`により`handle_new_user()`の定義を取得し、`SECURITY DEFINER`＋`SET search_path = ''`（またはスキーマ明示）＋`REVOKE EXECUTE ... FROM anon, authenticated`が設定されていることを確認のうえ、その定義SQLを`docs/db`へ記録すること。あわせて、DB定義をリポジトリで追跡できるよう`supabase/migrations`の導入を中期的に検討すること。

---

### CL-10：connpass中継APIにレート制限がなく、認証ユーザーがAPIキーの利用枠を消費できる

* **重大度：** Informational
* **対象ファイル：** `src/app/api/search-event/route.ts`、`src/app/api/search-user/route.ts`
* **該当箇所：** `search-event/route.ts` L37-45、`search-user/route.ts` L85-90（いずれも認証確認後、リクエストごとに`CONNPASS_API_KEY`付きで外部APIを呼び出す。回数制限・キャッシュなし。`cache: "no-store"`を明示）
* **確認済み事実：** 両Handlerとも認証必須であり、APIキーはサーバー側の`process.env.CONNPASS_API_KEY`からのみ読み込まれ、レスポンス本文・エラーメッセージへ含まれない（エラー時は`apiResponse.status`のみをサーバーログへ出力し、クライアントへは固定メッセージを返す）。ただし呼び出し回数の制限機構はない。
* **推測・未確認事項：** connpass API側のレート制限値、Vercel側のレート制限・WAF設定は未確認。
* **根拠：** 上記行の精読。
* **再現条件：** 認証済みユーザーが繰り返し検索を実行する。負荷試験は禁止操作のため未実施。
* **必要な攻撃条件：** 有効な認証セッション1つ。招待制のため外部の匿名者は該当しない。
* **想定される影響：** connpass APIの利用枠消費、キーの利用制限・停止。データ漏えいには至らない。招待制の少人数テストでは現実的なリスクは小さい。
* **確信度：** 高
* **誤検知の可能性：** 低
* **MVP公開前の対応必要性：** 後続検討
* **推奨対応：** 招待制・少人数のうちは対応不要と判断してよい。公開範囲拡大時に、ユーザー単位の簡易レート制限、または同一`event_id`に対する短時間キャッシュの導入を検討すること。

---

### CL-11：`/api/events/delete`の`external_event_id`に型検証がない

* **重大度：** Informational
* **対象ファイル：** `src/app/api/events/delete/route.ts`
* **該当箇所：** L62（分割代入）、L65-80（`event_id == null && external_event_id != null`のとき、`external_event_id`を無検証で`deleteRelatedData`へ渡す）、L4-8（引数型は`number`と宣言されるが実行時検証はない）
* **確認済み事実：** `external_event_id`の型・形式は検証されない。ただし削除条件は`.eq("event_id", externalEventId).eq("user_id", userId)`（L12-13、L42-43）と常に本人IDで絞られるため、他ユーザーのデータへは到達しない。異常な値はPostgRESTのエラーとなり、CL-04経由でエラー文字列が露出しうる。
* **推測・未確認事項：** 非スカラー値を渡した場合のPostgRESTの具体的な挙動は未確認。
* **根拠：** 上記行の精読。
* **再現条件：** 認証済みユーザーが`{"external_event_id": {...}}`のようなボディを送信する。静的確認のため未再現。
* **必要な攻撃条件：** 有効な認証セッション1つ。
* **想定される影響：** 自分のデータ範囲内での想定外の削除挙動、またはエラーメッセージ経由の軽微な情報露出。
* **確信度：** 高
* **誤検知の可能性：** 低
* **MVP公開前の対応必要性：** 後続検討
* **推奨対応：** `external_event_id`・`event_id`とも、数値または数値文字列であることを検証し、不正な場合は400を返すこと。CL-03・CL-04とあわせて、Route Handler全体の入力検証方針を統一するとよい。

---

### CL-12：`getSafeNextPath`がバックスラッシュ始まりのパスを個別に弾いていない

* **重大度：** Informational
* **対象ファイル：** `src/app/auth/callback/route.ts`、`src/app/auth/confirm/route.ts`
* **該当箇所：** `callback/route.ts` L6-12、`confirm/route.ts` L6-12（`!next.startsWith("/") || next.startsWith("//")`のとき既定値へフォールバック）、`callback` L23／`confirm` L36（`${origin}${next}`へリダイレクト）
* **確認済み事実：**
  * `next`が`/`で始まらない値（`https://evil.example`等）と`//`で始まる値（プロトコル相対URL）は、いずれも既定パス（`/dashboard`・`/set-password`）へフォールバックする。
  * リダイレクト先は必ず`origin`（リクエスト自身のオリジン）を前置して構築されるため、`next`に何を入れても遷移先のホストは自オリジンに固定される。`/\evil.example`のような値もWHATWG URLの正規化でホストは変わらない。
  * `/auth/confirm`は`type !== "invite"`のリクエストを拒否しており（L21）、招待以外のOTPタイプへの流用を防いでいる。
* **推測・未確認事項：** 各ブラウザにおけるバックスラッシュ入りURLの正規化挙動の差異は未検証。
* **根拠：** 上記行の精読。
* **再現条件：** `/auth/callback?code=...&next=<任意値>`へのアクセス。静的確認のため未再現。
* **必要な攻撃条件：** 有効な認証コードまたは招待トークンが必要。
* **想定される影響：** 外部ドメインへのオープンリダイレクトは成立しないと判断。自オリジン内の任意パス（`/api/...`等）への遷移は可能だが、各APIは独立に認証・認可を行うため実害は想定されない。
* **確信度：** 中
* **誤検知の可能性：** 高い（本項目は「問題を確認した」ではなく「確認したうえで成立しないと判断した」記録）
* **MVP公開前の対応必要性：** 対応不要
* **推奨対応：** 現状で問題ないが、堅牢性を高めるなら`next`を許可パスのホワイトリスト（`/dashboard`・`/set-password`等）に限定すること。

---

## 6. 問題が確認されなかった項目

以下は各観点について確認を行い、提供ファイルの範囲では問題を確認できなかった項目です。**「問題が見つからなかった」ことは「安全性が証明された」ことを意味しません。**

### 6-1. Route Handlerの認証（未認証拒否）

* **対象：** 全8メソッド（第3節の表）
* **確認方法：** 各`route.ts`の全文精読、`auth.getUser`の全文検索による網羅性確認
* **確認できた事実：** 8メソッドすべてが処理冒頭で`createSupabaseServerClient()`＋`auth.getUser()`を実行し、`authError || !user`で401を返す。middlewareの通過のみに依存する保護対象APIは存在しない。middleware（L37）は`getUser()`によるセッション更新のみを行い、認可判定を担っていないため、middlewareが無効化されてもAPIの認可は維持される設計。
* **制約：** 実際に未認証リクエストが401を返すことは動的確認が必要。Cookie不在時の`getUser()`の挙動、Supabase障害時のフェイルオープン有無も未確認。

### 6-2. クライアント由来の所有者情報の非信頼

* **対象：** 全Route Handler
* **確認方法：** `user_id`・`owner_id`・`created_by`のリクエスト入力からの取得箇所を全文検索
* **確認できた事実：** リクエストボディまたはクエリから所有者IDを受け取っているHandlerは**0件**。所有者はすべて`auth.getUser()`の戻り値`user.id`から導出される（`events/update` L50-52・L93、`profile` L108・L130、`account/delete` L37）。`/api/dashboard-data`はリクエストボディを一切読まない。
* **制約：** 静的確認のため、実際にボディへ`user_id`を混入させた場合の応答は未検証。

### 6-3. DBアクセスのユーザーID限定

* **対象：** 全Route Handler、`src/lib/saveEventWithTagsAndNote.ts`
* **確認方法：** `.from(`と`.eq(`の組み合わせを全件読み取り
* **確認できた事実：** anonキークライアント経由のDBアクセスはすべて`.eq("user_id", user.id)`または`.eq("id", user.id)`を伴う。`events`削除は`.eq("id", event_id).eq("user_id", user.id)`の複合条件で、削除0件時は404を返す（`events/delete` L104-109）。RLSに加えてアプリ側でも絞り込む二重防御になっており、`connlog-system-overview.md` L276の方針と整合。
* **制約：** RLSの実状態が未確認のため（CL-01）、アプリ側の絞り込みが唯一の防御になっている可能性は排除できない。

### 6-4. service role keyの取り扱い

* **対象：** `src/app/api/account/delete/route.ts`
* **確認方法：** `SUPABASE_SERVICE_ROLE_KEY`および`createClient`の全文検索、該当ファイルの精読
* **確認できた事実：**
  * `SUPABASE_SERVICE_ROLE_KEY`の参照は`api/account/delete/route.ts` L7の**1箇所のみ**。`"use client"`を持たないRoute Handler内であり、クライアントバンドルへは含まれない。
  * `NEXT_PUBLIC_`接頭辞は付いておらず、公開環境変数として露出する設計にはなっていない。
  * 未設定時は`throw new Error("Supabaseの環境変数が設定されていません。")`（L10）となり、catch節（L187-193）で固定メッセージの500へ変換されるため、キー値や環境変数名がレスポンスへ出ることはない。
  * 管理クライアントは`autoRefreshToken: false, persistSession: false`（L14-17）で生成され、セッションを永続化しない。
  * 用途はアカウント削除のみで、`connlog-system-overview.md` L270-272の方針と整合。RLS迂回前提での本人確認は、L25-35の`auth.getUser()`で先行実施され、以降すべての削除条件が`user.id`固定になっている。
  * `CONNPASS_API_KEY`も同様にRoute Handler内（`search-event` L26、`search-user` L56）のみで参照され、レスポンス・エラーメッセージへ含まれない。
* **制約：** Vercel側で当該環境変数が誤って`NEXT_PUBLIC_`として、またはPreview/Production双方に不適切に設定されていないかは、リポジトリからは確認できない。実際のビルド成果物にキーが含まれないことも未確認。

### 6-5. アカウント削除の本人限定

* **対象：** `src/app/api/account/delete/route.ts`
* **確認方法：** 全文精読、SQLのCHECK制約との照合
* **確認できた事実：** `DELETE()`は**引数を受け取らない**（L21）ため、他ユーザーのIDを指定する経路が構造的に存在しない。削除対象はすべて`auth.getUser()`由来の`userId`で限定される。`supabaseAdmin.auth.admin.deleteUser(userId)`（L170）も同様。旧所有者列（`owner_id`・`created_by`・`created_by_id`）による削除も、`2026-07-14`のSQL L26-42のCHECK制約により`user_id`と一致する行のみが対象となる。
* **制約：** 実環境でCHECK制約が適用されているかは未確認（提供SQLが実行済みである保証がない）。削除後のセッション無効化タイミングも動的確認が必要。

### 6-6. XSS・HTML直接出力

* **対象：** `src/`配下全ファイル
* **確認方法：** `dangerouslySetInnerHTML`・`innerHTML`・`eval(`・`new Function`・`document.write`の全文検索
* **確認できた事実：** `dangerouslySetInnerHTML`は**0件**。`eval`・`new Function`・`document.write`も0件。`innerHTML`は`sanitizeEventDescription.ts` L14の1件のみで、HTMLを除去して`textContent`を取り出す用途（結果はJSXでエスケープされて表示）。タグ・メモ・表示名・自己紹介・イベントタイトルはすべてJSXの通常展開で描画され、Reactの自動エスケープが働く。`target="_blank"`を使う3箇所すべてに`rel="noopener noreferrer"`が設定済み。
* **制約：** URLスキームの検証はReactのエスケープ対象外であり、CL-05として別途指摘。実ブラウザでの描画確認は未実施。

### 6-7. リダイレクト処理

* **対象：** `src/app/auth/callback/route.ts`、`src/app/auth/confirm/route.ts`、`src/app/page.tsx`
* **確認方法：** 全文精読
* **確認できた事実：** 外部URL・プロトコル相対URLは既定パスへフォールバックし、遷移先は常に自オリジン。`/auth/confirm`は`type === "invite"`のみ受け付け、それ以外・トークン不在・検証失敗はすべて`/login`へ。`/auth/callback`もコード不在・交換失敗時は`/login`へ。`src/app/page.tsx`はサーバー側で認証状態に応じた固定パスへリダイレクトする。オープンリダイレクトは成立しないと判断（詳細はCL-12）。
* **制約：** 実際の招待メールがどちらのルートを経由するかはSupabase側のメールテンプレート・Redirect URL許可リストに依存し、リポジトリからは確認できない（`connlog-system-overview.md` L232も同旨）。

### 6-8. 招待制の運用

* **対象：** `src/app/signup/page.tsx`、`src/app/login/page.tsx`
* **確認方法：** 全文精読
* **確認できた事実：** `NEXT_PUBLIC_SIGNUP_MODE`が`"public"`でない限り（既定値は`"invite"`、L9-10）、登録フォームは描画されず案内文のみが表示される。ConnLog内に一般利用者向けの招待送信APIは存在しない（Route Handler一覧で確認）。
* **制約：** これは**画面表示上の制御にすぎない**。`NEXT_PUBLIC_SIGNUP_MODE`が`invite`でも、Supabase Auth側で公開サインアップが有効であれば、anonキーを用いた`/auth/v1/signup`への直接リクエストで登録できる可能性がある。実効的な招待制はSupabaseダッシュボードの「Allow new users to sign up」設定に依存し、**リポジトリからは確認できない**。`connlog-system-overview.md` L220も「画面の表示制御だけに依存しない」と述べており、この点は環境側での確認が必要。

### 6-9. CSRF

* **対象：** 全Route Handler
* **確認方法：** HTTPメソッドとContent-Typeの確認
* **確認できた事実：** 状態を変更するエンドポイントはすべてPUT/DELETE/POSTであり、`GET`による状態変更は存在しない。`PUT`・`DELETE`および`application/json`のPOSTはクロスオリジンからはプリフライトを要し、CORS設定を明示していないため（`next.config.ts`に`Access-Control-Allow-Origin`の設定なし）ブラウザ経由の単純なCSRFは成立しにくい。
* **制約：** Supabaseの認証Cookieの`SameSite`属性は`@supabase/ssr`のデフォルトに依存し、実際の値は未確認。CSRFトークンは実装されていないため、Cookie属性の実確認が望ましい。

### 6-10. SQLの権限・RLS無効化・危険な定義

* **対象：** `docs/db/`配下3ファイル
* **確認方法：** 全文精読
* **確認できた事実：** `GRANT`・`DISABLE ROW LEVEL SECURITY`・`TO anon`・`TO public`・`SECURITY DEFINER`の記述は**1件もない**。`2026-07-14`のSQLはRLSを有効化しPolicyを`TO authenticated`に限定する方向の変更であり、`(SELECT auth.uid())`形式でPolicy評価を最適化している。`2026-06-22`は一意制約を「全体」から「ユーザー単位」へ変更するもので、`docs/architecture/connlog-system-overview.md` L205の記述およびアプリ側の重複チェック（`saveEventWithTagsAndNote.ts` L106-111）と整合。`2026-08-10`は不要関数を`RESTRICT`付きで削除する内容。3ファイルとも`BEGIN`/`COMMIT`で囲まれ、検証用SQLがコメントで併記されている。
* **制約：** これら3ファイルが現在のDB状態の完全な表現である保証はなく、依頼文の指示どおり、記載のない定義（`notes`・`users`のRLS、テーブルスキーマ、外部キー、関数、権限）はすべて未確認として扱った。

### 6-11. コード・SQL・設計文書の整合性

* **対象：** `connlog-system-overview.md`と実装
* **確認方法：** 文書記載のAPI一覧・所有者列・フローとコードの照合
* **確認できた事実：** 文書のAPI一覧（L160-169）は実装の8メソッドと完全に一致。所有者列（L197）、重複防止（L205）、service role keyの用途限定（L272）、middlewareの役割（L246）はいずれもコード・SQLと整合。**明確な矛盾は確認されなかった。**
* **留意点（矛盾ではないが差異）：** 文書L197は`notes`にも同一のRLS条件が設定されていると記載するが、リポジトリ内SQLにはその定義がない（CL-01）。文書は「2026年8月8日にSQL Editorで確認した」ものとしており、リポジトリ外の情報に基づく記述であるため、監査上は未確認として扱った。

### 6-12. セキュリティヘッダー設定

* **対象：** `next.config.ts`
* **確認方法：** 全文精読
* **確認できた事実：** `X-Content-Type-Options: nosniff`（MIME sniffing対策）、`X-Frame-Options: DENY`＋CSP `frame-ancestors 'none'`（クリックジャッキング対策、二重）、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy: camera=(), microphone=(), geolocation=()`、`poweredByHeader: false`がすべて設定済み。`source: "/:path*"`で全パスに適用。`connect-src`はSupabaseオリジンに限定される。HSTSの明示設定はないが、Vercel配信では通常プラットフォーム側で付与される。
* **制約：** 実際のレスポンスヘッダーとして返却されるかは動的確認が必要。Vercel側での上書き・追加も未確認。

### 6-13. 依存関係

* **対象：** `package.json`、`package-lock.json`
* **確認方法：** `package.json`全文精読、`package-lock.json`は文字列検索による主要パッケージのバージョン確認と出所の件数確認
* **確認できた事実：**

  | パッケージ | 解決バージョン |
  | --- | --- |
  | `next` | 15.5.22 |
  | `react` / `react-dom` | 18.3.1 |
  | `@supabase/ssr` | 0.7.0 |
  | `@supabase/supabase-js` | 2.52.0 |
  | `@supabase/auth-js` | 2.71.1 |
  | `recharts` | 3.1.2 |
  | `lucide-react` | 0.539.0 |
  | `tailwindcss` | 4.1.11 |
  | `typescript` | 5.8.3 |

  * lockfileの`resolved`エントリは457件で、そのうち`registry.npmjs.org`を指すものが457件。**レジストリ外（git・tarball・プライベートレジストリ）からの解決は0件**であり、すべてのエントリに`integrity`ハッシュが付与されている（457件）。
  * 本番依存は8パッケージと小規模で、認証・HTTP処理は`@supabase/*`とNext.js標準に集約されている。
  * `tsconfig.json`は`strict: true`。ESLintは`next/core-web-vitals`＋`next/typescript`を適用。
* **制約：** **既知脆弱性の有無は判定していません。** `npm audit`および外部脆弱性データベースへの照会は禁止操作のため実施していません。上記バージョンに既知のCVEが存在するかは**追加確認が必要**であり、推測での断定は行いません。なお、Next.jsのmiddleware関連の認証回避が仮に問題となる場合でも、本アプリはmiddlewareに認可を委ねていない（6-1参照）ため、影響は限定的と考えられます。これも静的な設計上の推論であり、確認済み事実ではありません。

### 6-14. 個人情報とログ

* **対象：** 全`console.error`呼び出し箇所
* **確認方法：** エラーログ出力箇所の読み取り
* **確認できた事実：** ログ出力はエラーオブジェクトとコンテキスト文字列が中心で、パスワード・トークン・APIキー・メールアドレスを意図的に出力する箇所は確認されなかった。`search-event` L48-51・`search-user` L93-96はステータスコードのみを記録し、APIキーやレスポンス本文を記録しない。
* **制約：** Supabaseのエラーオブジェクトに利用者識別情報が含まれる可能性は、実際のログ出力を見ないと判断できない。Vercel Runtime Logsの保持期間・アクセス範囲も未確認。本報告には実ユーザーのデータを一切含めていません。

---

## 7. 環境不足・静的確認のため未確認となった事項

| # | 未確認事項 | 理由 |
| --- | --- | --- |
| 1 | 提供コピーとcommit `d6c6b0b...`の同一性 | `.git`が提供されていない |
| 2 | `notes`・`users`のRLS有効状態とPolicy定義 | 提供SQLに定義がない／DB接続は禁止 |
| 3 | 全テーブルのスキーマ、列型、NOT NULL、外部キー、CASCADE設定 | 提供SQLにCREATE TABLEがない |
| 4 | `handle_new_user()`の定義、`SECURITY DEFINER`、`search_path`、EXECUTE権限 | 提供SQLに定義がない |
| 5 | schema・テーブル・関数に対する`anon`/`authenticated`のGRANT状況 | 提供SQLに記載がない |
| 6 | Supabase Authの設定（公開サインアップ可否、Secure password change、Redirect URL許可リスト、メールテンプレート、セッション有効期限、パスワード強度ポリシー） | Supabaseダッシュボードへのアクセスは禁止 |
| 7 | Vercelの環境変数設定（`SUPABASE_SERVICE_ROLE_KEY`・`CONNPASS_API_KEY`のスコープ、`NEXT_PUBLIC_SIGNUP_MODE`の実値） | Vercelへのアクセスは禁止／環境変数の実値は参照禁止 |
| 8 | 実際のHTTPレスポンスヘッダー（CSP・HSTS等の返却内容） | 環境起動・APIリクエストは禁止 |
| 9 | 認証Cookieの属性（`HttpOnly`・`Secure`・`SameSite`） | 動的確認が必要 |
| 10 | 依存パッケージの既知脆弱性 | `npm audit`・外部レジストリ照会・Web検索は禁止 |
| 11 | クライアントバンドルへの秘密情報混入の有無 | ビルド実行は禁止 |
| 12 | 2アカウント間のデータ分離の実動作 | テストアカウント・環境が提供されていない |
| 13 | `README`、Vercel設定ファイル、`supabase/`ディレクトリの内容 | 提供60ファイルに含まれない |
| 14 | `docs/review`配下の既存監査文書・ZAPレポート | 提供されておらず、一次監査では参照しない方針 |
| 15 | `src/app/globals.css`・`design-system.ts`等、セキュリティに直接関与しないファイルの詳細 | 監査観点上の優先度が低く、横断検索のみで代替 |

---

## 8. Preview環境での実地確認が必要な項目

以下は静的確認では結論を出せず、許可されたPreview環境と2つのテストアカウントによる確認が必要な項目です（本監査では未実施）。

1. **RLSの実状態確認（最優先）** — `notes`・`users`を含む4テーブルのRLS有効状態と、SELECT/INSERT/UPDATE/DELETE各Policyの有無・条件・対象ロールをSQL Editorで確認（CL-01）
2. **DB関数・権限の確認** — `handle_new_user()`の定義、`SECURITY DEFINER`、`search_path`、EXECUTE権限（CL-09）
3. **2アカウント間のデータ分離** — アカウントAのイベント・タグ・メモ・プロフィールをアカウントBが取得・更新・削除できないこと。特に、ブラウザのanonキークライアントから`notes`・`users`を直接クエリした場合の挙動
4. **未認証での保護API応答** — 全8メソッドがCookieなしで401を返すこと
5. **ID改ざん試験** — `/api/events/delete`・`/api/events/update`に他アカウントの`event_id`を指定した場合に404または無変更となること
6. **公開サインアップの実効性** — `NEXT_PUBLIC_SIGNUP_MODE=invite`の状態で、Supabase Authの`signup`エンドポイントへ直接登録できないこと（6-8）
7. **パスワード変更時の再認証** — Supabaseの`Secure password change`が有効か（CL-02）
8. **アカウント削除の完全性** — 削除後にデータが残らないこと、セッションが無効化されること、失敗時に不整合が残らないこと（CL-08）
9. **レスポンスヘッダー実測** — CSP・HSTS・その他ヘッダーの実返却内容
10. **認証Cookieの属性確認** — `HttpOnly`・`Secure`・`SameSite`
11. **クライアントバンドルの検査** — ビルド成果物に`SUPABASE_SERVICE_ROLE_KEY`・`CONNPASS_API_KEY`が含まれないこと
12. **依存関係の既知脆弱性確認** — `npm audit`および脆弱性DBの照会（本監査では禁止）
13. **エラー応答内容の実測** — CL-04で指摘した`details`に実際に含まれる文字列の確認
14. **招待メールの実経路** — `/auth/confirm`と`/auth/callback`のいずれを経由するか

---

## 9. MVP公開前に必要な対応の優先順位

### 必須（公開前に確認・対応すべき）

1. **CL-01：`notes`・`users`のRLS状態を実環境で確認する。** 本監査で最も重要な未確認事項です。`notes`はブラウザのanonキークライアントから直接書き込まれる設計であり、RLSが不備であれば他ユーザーのメモ閲覧・改変（High相当）につながります。API経由の絞り込みは実装されていますが、それだけに依存すべきではありません。
2. **CL-09：`handle_new_user()`の定義と権限を確認する。**
3. **6-8：Supabase Auth側で公開サインアップが無効であることを確認する。** 画面側の`NEXT_PUBLIC_SIGNUP_MODE`は表示制御にすぎず、招待制の実効性はSupabase設定に依存します。

上記3点はいずれも**コードの問題ではなく、静的確認で検証できなかった環境設定の確認**です。確認結果が想定どおりであれば、追加対応は不要です。

### 推奨（公開前の対応が望ましい）

4. **CL-03：** タグ・メモにサーバー側の長さ・件数・型検証を追加
5. **CL-04：** DBエラーメッセージの`details`露出を停止し、エラー応答方針を`/api/profile`方式へ統一
6. **CL-02：** Supabaseの「Secure password change」有効化、アカウント削除時の追加確認の検討

### 後続検討（公開後の改善で可）

7. CL-07（SSR/middlewareでの認証ガード追加）
8. CL-05（`event_url`のスキーム検証、保存経路のサーバー化）
9. CL-08（アカウント削除のトランザクション化）
10. CL-06（CSPのnonce化）
11. CL-11（`external_event_id`の型検証）
12. CL-10（レート制限）

### 対応不要

13. CL-12（オープンリダイレクトは成立しないと判断）

---

## 10. 監査上の制約

1. **本監査は静的確認のみです。** 動的検証を一切行っていないため、実行時の挙動、実環境の設定、実際のレスポンスに基づく結論は含みません。
2. **Critical・High相当の問題は確認されませんでしたが、これは存在しないことの証明ではありません。** 特にRLSの実状態（CL-01）が未確認である以上、データ分離に関するHigh相当のリスクが残存している可能性は排除できません。第7節の未確認事項15件は、いずれも結論を左右しうるものです。
3. **`docs/db`配下のSQLは現在のSupabase環境の完全な表現ではないという前提で評価しました。** 記載のない定義はすべて未確認として扱っています。
4. **依存関係の既知脆弱性は判定していません。** 外部照会が禁止されているため、バージョンの記録に留めています。既知脆弱性の有無は追加確認が必要です。
5. **提供コピーの真正性は検証していません。** commit SHAとファイル数は所有者からの申告であり、`.git`が提供されていないため独立に確認できません（ファイル数60件の一致のみ確認）。
6. **`connlog-system-overview.md`は補助資料として扱い、コード・SQLと異なる主張（`notes`のRLS等）はコード・SQL側の事実、すなわち「定義が提供ファイル内に存在しない」を優先しました。**
7. **本報告に実ユーザーのデータ、メールアドレス、トークン、環境変数の実値は一切含んでいません。** 環境変数は名称のみを参照しています。
8. **禁止操作は一切実施していません。** ファイルの作成・変更・削除、npm操作、アプリ起動、SQL実行、ネットワーク接続、Web検索、外部サービスアクセス、サブエージェント起動、作業ディレクトリ外へのアクセス、攻撃コード作成のいずれも行っていません。発見事項に対する修正コードやパッチも作成していません。
9. **一次監査の位置づけです。** 依頼の方針に従い、既存の調査文書・ZAPレポートは参照していません（そもそも提供されていません）。二次比較は本報告の確定後に別途実施してください。
