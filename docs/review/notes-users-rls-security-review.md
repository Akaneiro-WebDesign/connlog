# notes・users RLS安全性調査

調査日：2026年7月18日

## 対象

```txt
public.notes
public.users
```

## 調査目的

`notes`と`users`について、RLSの有効状態、設定されているPolicy、ユーザー間のデータ分離が実際に機能しているかを確認する。

特に、テストアカウントAからテストアカウントBのデータを閲覧・更新・削除・作成できないことを確認する。

## 結論

`notes`と`users`の両テーブルでRLSが有効になっていた。

また、テストアカウントAとしてテストアカウントBのデータへ越権操作を試した結果、他ユーザーのメモ・プロフィールを閲覧、更新、削除、作成することはできなかった。

自分自身のメモ・プロフィールについては、許可された操作が正常に行えることも確認した。

現時点では、`notes`と`users`のRLSについて、Critical・High・Medium相当の問題は確認されなかった。

一方、同じ目的・同じ条件のPolicyが複数存在しており、設定が重複している。

重複Policyは現時点で権限を広げてはいないが、将来の変更時に判断を難しくするため、整理候補として残す。

## RLSの有効状態

確認結果は次のとおり。

```txt
notes
rls_enabled：true
rls_forced：false

users
rls_enabled：true
rls_forced：false
```

両テーブルともRLS自体は有効になっている。

`rls_forced`は`false`だが、通常のanonユーザー・authenticatedユーザーにはRLSが適用される。

## notesのPolicy

確認時点では、次のPolicyが設定されていた。

### 全操作

```txt
Policy名：Users can manage their own notes
対象ロール：public
対象操作：ALL
USING：auth.uid() = user_id
WITH CHECK：auth.uid() = user_id
```

本人のメモに対するSELECT・INSERT・UPDATE・DELETEを許可し、他人の`user_id`を使った操作を拒否する内容になっている。

### 個別操作

次の個別Policyも存在していた。

```txt
Enable insert for authenticated users only
ユーザー自身のメモだけ取得
ユーザー自身のメモだけ更新
```

いずれも本人の`user_id`に限定する内容であり、`ALL`のPolicyと目的が重複している。

## usersのPolicy

確認時点では、次の種類のPolicyが設定されていた。

### INSERT

```txt
Users can insert own profile
```

ログイン中のユーザーIDと、作成するプロフィールの`id`が一致する場合だけINSERTを許可している。

また、次のservice role向けPolicyも存在していた。

```txt
Enable insert for service role
```

service roleは通常RLSを回避できるため、このPolicyは冗長な可能性がある。

### SELECT

次の3つのPolicyが存在していた。

```txt
Allow individual to read own profile
Users can view own data
Users can view own profile
```

いずれも基本的に次の条件を使用している。

```txt
auth.uid() = id
```

本人のプロフィールだけを閲覧できる内容だが、同じ目的のPolicyが重複している。

### UPDATE

次の3つのPolicyが存在していた。

```txt
Allow individual to update own profile
Users can update own data
Users can update own profile
```

いずれも本人のプロフィールだけを更新できる内容になっているが、同じ目的のPolicyが重複している。

### DELETE

通常ユーザー向けのDELETE Policyは設定されていない。

そのため、通常のSupabase clientからは、自分自身を含めて`public.users`の行を直接削除できない。

ConnLogでは、アカウント削除専用のRoute Handlerで本人確認を行い、service role keyを使って関連データとAuthユーザーを削除する設計になっている。

## 越権操作テストの方法

Supabase SQL Editor上で、実行ロールを一時的に`authenticated`へ変更し、JWTの`sub`にテストアカウントAのユーザーIDを設定した。

各変更系テストはトランザクション内で実施し、最後に`ROLLBACK`を実行した。

```txt
テストアカウントA：操作するユーザー
テストアカウントB：他人に相当するユーザー
```

実際のメールアドレス・UUIDは調査資料には記載しない。

## notesの越権操作テスト結果

### 自分のメモを閲覧

```txt
操作：AがA自身のメモをSELECT
結果：成功
```

A本人のメモが1件取得できた。

### 他人のメモを閲覧

```txt
操作：AがBのメモをSELECT
結果：取得0件
```

Bのメモは存在するが、Aからは取得できなかった。

### 他人のメモを更新

```txt
操作：AがBのメモをUPDATE
結果：更新0件
```

BのメモはRLSによって更新対象にならなかった。

### 他人のメモを削除

```txt
操作：AがBのメモをDELETE
結果：削除0件
```

BのメモはRLSによって削除対象にならなかった。

### 自分のメモを他人名義へ変更

```txt
操作：A自身のメモのuser_idをBのIDへUPDATE
結果：RLSエラー
```

確認したエラー：

```txt
new row violates row-level security policy for table "notes"
```

`WITH CHECK`が機能し、自分のメモの所有者を他人へ変更する操作が拒否された。

### 他人名義のメモを新規作成

```txt
操作：AがBのuser_idを指定してメモをINSERT
結果：RLSエラー
```

確認したエラー：

```txt
new row violates row-level security policy for table "notes"
```

AがB名義のメモを作成する操作は拒否された。

## usersの越権操作テスト結果

### 自分のプロフィールを閲覧

```txt
操作：AがA自身のプロフィールをSELECT
結果：成功
```

A本人のプロフィールが取得できた。

### 他人のプロフィールを閲覧

```txt
操作：AがBのプロフィールをSELECT
結果：取得0件
```

BのプロフィールはAから取得できなかった。

### 自分のプロフィールを更新

```txt
操作：AがA自身のプロフィールをUPDATE
結果：成功
```

本人のプロフィールは正常に更新対象となった。

テストでは現在の表示名を同じ値で更新し、最後に`ROLLBACK`した。

### 他人のプロフィールを更新

```txt
操作：AがBのプロフィールをUPDATE
結果：更新0件
```

BのプロフィールはRLSによって更新対象にならなかった。

### 他人のプロフィールを削除

```txt
操作：AがBのプロフィールをDELETE
結果：削除0件
```

Bのプロフィールは削除対象にならなかった。

### 自分のプロフィールを直接削除

```txt
操作：AがA自身のプロフィールをDELETE
結果：削除0件
```

通常ユーザー用のDELETE Policyがないため、本人の行であっても直接削除できなかった。

これは、専用のアカウント削除APIを使用する現在の設計と一致している。

### 自分以外のIDでプロフィールを作成

```txt
操作：AがAとは異なる架空のUUIDでプロフィールをINSERT
結果：RLSエラー
```

確認したエラー：

```txt
new row violates row-level security policy for table "users"
```

テスト後、架空のUUIDを持つプロフィールが残っていないことも確認した。

## テスト後のデータ確認

各変更系テストでは`ROLLBACK`を実行した。

また、架空のプロフィールが作成されていないことを別途SELECTで確認した。

```txt
結果：対象行なし
```

テストによる不要データは残っていない。

## 重大度

```txt
Critical：なし
High：なし
Medium：なし

Low・整理候補：
・notesのPolicy重複
・usersのSELECT Policy重複
・usersのUPDATE Policy重複
・publicロールとauthenticatedロールの混在
・service role向けINSERT Policyの冗長性
```

## 現時点の判断

`notes`と`users`では、ユーザー間のデータ分離が実際に機能している。

本人に許可された操作は成功し、他人のデータに対する操作や、他人名義でのデータ作成・所有者変更は拒否された。

重複Policyは存在するが、確認した範囲では本人限定の条件になっており、現時点で越権アクセスにつながってはいない。

## 対応方針

外部AIレビュー前には、重複Policyの削除・統合は行わない。

現在の安全な動作を維持したまま、CodexとClaude Codeの独立調査で、次を確認する。

```txt
・どのPolicyを残すべきか
・ALL Policyへ統一するべきか
・操作ごとのPolicyへ統一するべきか
・publicロールをauthenticatedへ統一するべきか
・service role向けPolicyを削除してよいか
```

両AIの判断を比較したうえで、必要なPolicy整理を別タスク・別PRで実施する。

判断が一致しない場合や、自力で安全性を確定できない場合は、人間のメンターへ該当箇所だけ相談する。
