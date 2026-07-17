# アカウント削除API 安全性調査

調査日：2026年7月17日

## 対象

```txt
src/app/api/account/delete/route.ts
src/app/profile/page.tsx
src/lib/supabase/server.ts
```

## 調査目的

`SUPABASE_SERVICE_ROLE_KEY`を使用するアカウント削除APIについて、認証、削除対象、削除順序、部分失敗、旧所有者カラムの影響を確認する。

## 結論

現時点では、他ユーザーのアカウントやデータを任意に削除できるようなCritical・High相当の問題は確認されなかった。

削除対象には、リクエスト本文の値ではなく、Supabase Authで確認したログインユーザー本人のIDを使用している。

service role keyもRoute Handler内のサーバー側環境変数として使用され、ブラウザ側への露出は確認されなかった。

一方、複数のDELETE処理を個別に実行しているため、途中失敗時に一部のデータだけが削除される可能性がある。

## 認証と削除対象

* APIはCookieを使用するSupabase Server Clientで`auth.getUser()`を実行している
* 未ログイン時は401を返す
* リクエスト本文からユーザーIDを受け取っていない
* 認証済みユーザーの`user.id`だけを削除条件に使用している
* service role clientは認証確認後にサーバー側で生成している

## 削除順序

現在の削除順序は次のとおり。

```txt
notes
tags
events
public.users
auth.users
```

DB制約を確認した結果、この順序は適切と判断した。

### events

`events.created_by`は`auth.users.id`を参照しており、`ON DELETE CASCADE`は設定されていない。

そのため、関連するeventsを先に削除し、Authユーザーを最後に削除する現在の順序が必要。

### tags

`tags.created_by_id`は`public.users.id`を参照し、`ON DELETE SET NULL`が設定されている。

一方、tagsのCHECK制約は`created_by_id IS NOT NULL`を要求している。

そのため、tagsを残した状態でusersを削除すると、外部キーのSET NULLとCHECK制約が競合して削除に失敗する可能性がある。

現在はtagsをusersより先に削除しているため、この問題を回避できている。

### notes

今回確認したDB制約では、`notes.user_id`に外部キーは設定されていなかった。

そのため、notesは明示的な削除が必要。

## 部分失敗

現在の実装では、DBデータの削除とSupabase Admin APIによるAuthユーザーの削除は、同じトランザクションにまとめられていない。

現在は各テーブルを順番に削除し、途中でエラーが起きると処理を終了する。

そのため、一部のデータだけが削除された状態になる可能性がある。

ただし、Authユーザーを最後に削除しているため、Auth削除前に失敗した場合は、認証状態を維持したまま再実行できる可能性が高い。

すでに削除済みの行へ再度DELETEを実行しても、通常は対象0件として成功するため、処理は比較的再実行しやすい。

## 旧所有者カラム

現在は、`tags`と`events`を次の複数カラムで削除している。

```txt
user_id
owner_id
created_by
created_by_id
```

現在のCHECK制約では各所有者カラムと`user_id`の一致が保証されているため、`user_id`で削除した後の処理は通常冗長となる。

ただし、旧所有者カラムの削除はDB制約・保存処理・更新処理と同時に扱う必要があるため、外部コードレビュー後にまとめて整理する。

## 重大度

```txt
Critical：なし
High：なし
Medium候補：途中失敗による部分削除
Low：旧所有者カラムを使った冗長な削除処理
改善候補：外部キーと削除設計の整理
```

## 外部レビューで確認したいこと

* 現在の削除順序と再実行方針がMVPとして妥当か
* 部分削除発生時の復旧方法
* DB側の削除処理をPostgreSQL Functionへまとめる必要があるか
* `notes`・`events`・`tags`の外部キー設計
* 旧所有者カラム削除後の最適な削除処理
* Authユーザー削除失敗時の扱い
* service role keyの使用範囲が適切か

## 対応方針

外部コードレビュー前には、アカウント削除APIの大きな変更は行わない。

外部レビュー後に、必要に応じて次を別タスク・別PRで対応する。

* 旧所有者カラムを使った削除処理の整理
* 部分失敗時のエラー・再実行方法の改善
* DB外部キー・CASCADE設計の整理
* 削除処理のPostgreSQL Function化の検討
