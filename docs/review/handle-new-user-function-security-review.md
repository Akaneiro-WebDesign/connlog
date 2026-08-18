# `handle_new_user()` DB関数 安全性確認

作成日：2026年8月18日

## 対象

- Supabase Production環境の`public.handle_new_user()`
- 関連トリガー`auth.on_auth_user_created`
- 関数の所有者、実行権限、`SECURITY DEFINER`、`search_path`
- `public`スキーマのCREATE権限

## 調査目的

Claudeによる独立一次静的監査では、監査用コピーに`handle_new_user()`の定義が含まれていなかったため、関数本体、`SECURITY DEFINER`、`search_path`、実行権限を確定できなかった。

実際のSupabase環境を読み取り専用SQLで確認し、一般利用者による直接実行や、`SECURITY DEFINER`関数の名前解決を利用した権限昇格につながる設定がないかを確認する。

## 結論

`handle_new_user()`について、MVP公開を止めるCritical・High・Medium相当の問題は確認されなかった。

関数は`postgres`が所有する`SECURITY DEFINER`関数で、`search_path`は`public`に固定されている。書き込み先も`public.users`と完全修飾されている。

`PUBLIC`・`anon`・`authenticated`には関数のEXECUTE権限がなく、`public`スキーマへオブジェクトを作成するCREATE権限もない。そのため、一般利用者が関数を直接実行する経路や、`public`スキーマへ同名オブジェクトを作成して名前解決へ介入する経路は確認されなかった。

Supabaseが推奨する`search_path = ''`への変更は追加防御として検討できるが、現在の関数本体と権限設定を踏まえ、MVP公開前の必須修正とはしない。

## 確認方法

Supabase SQL Editorで、次のPostgreSQLシステムカタログおよび権限確認関数を使用した読み取り専用SQLを実行した。

- `pg_proc`
- `pg_namespace`
- `pg_language`
- `pg_trigger`
- `pg_class`
- `pg_get_functiondef()`
- `pg_get_triggerdef()`
- `has_function_privilege()`
- `has_schema_privilege()`

関数や権限、トリガー、テーブルの変更は行っていない。

## 関数の基本設定

確認結果は次のとおり。

| 項目 | 確認結果 |
| --- | --- |
| スキーマ | `public` |
| 関数名 | `handle_new_user` |
| 引数 | なし |
| 戻り値 | `trigger` |
| 所有者 | `postgres` |
| 言語 | `plpgsql` |
| `SECURITY DEFINER` | 有効 |
| `search_path` | `public`に固定 |

## 関数本体

関数本体では、`auth.users`へ追加された新規ユーザーの情報を`public.users`へ保存している。

```sql
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url, bio)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'bio'
  );
  RETURN NEW;
END;
```

確認した範囲では、次の処理は含まれていない。

- 動的SQLの実行
- 外部から渡されたSQL文字列の実行
- 任意のユーザーIDを引数として受け取る処理
- `public.users`以外のアプリケーションテーブルの変更
- RLSや権限設定を変更する処理

## 関数のEXECUTE権限

各ロールの実効的なEXECUTE権限は次のとおり。

| ロール | EXECUTE |
| --- | --- |
| `PUBLIC` | なし |
| `anon` | なし |
| `authenticated` | なし |
| `service_role` | あり |
| `postgres` | あり |

一般利用者が使用する`anon`・`authenticated`には直接実行権限がない。

`service_role`には実行権限があるが、service role keyはConnLogのサーバー側Route Handlerに限定して管理されている。一般利用者へ公開されるロールではない。

## `public`スキーマのCREATE権限

`search_path`が`public`に固定されているため、一般利用者が`public`スキーマへオブジェクトを作成できるかを追加確認した。

| ロール | `public`スキーマへのCREATE |
| --- | --- |
| `PUBLIC` | なし |
| `anon` | なし |
| `authenticated` | なし |
| `service_role` | なし |
| `postgres` | あり |

一般利用者と`service_role`は`public`スキーマへ関数・演算子・その他のオブジェクトを作成できない。`postgres`だけがCREATE権限を持つ。

したがって、一般利用者が`public`スキーマへ不正なオブジェクトを作成し、`SECURITY DEFINER`関数の名前解決へ介入する経路は確認されなかった。

## 関連トリガー

`handle_new_user()`は次のトリガーから使用されている。

| 項目 | 確認結果 |
| --- | --- |
| テーブル | `auth.users` |
| トリガー名 | `on_auth_user_created` |
| タイミング | `AFTER INSERT` |
| 単位 | `FOR EACH ROW` |
| 実行関数 | `handle_new_user()` |

新しいAuthユーザーが作成された後に、対応する`public.users`行を作るという想定した用途と一致している。

## `search_path`の評価

現在は`SET search_path TO 'public'`が設定されている。呼び出し側の任意の`search_path`を引き継ぐ状態ではなく、書き込み対象も`public.users`と完全修飾されている。

さらに、一般利用者と`service_role`は`public`スキーマへオブジェクトを作成できない。そのため、現在の構成で名前解決を悪用した権限昇格につながる経路は確認されなかった。

一方、Supabaseの現在の推奨例では、`SECURITY DEFINER`関数に`search_path = ''`を設定し、関数内のオブジェクトを完全修飾する方式が示されている。

将来この関数を変更する際は、次をまとめて検討する。

- `search_path = ''`への変更
- 使用するテーブル、関数、型の完全修飾
- 変更後の招待・ユーザー作成フローの動作確認
- 定義SQLのmigration管理

## 重大度

```txt
Critical：なし
High：なし
Medium：なし

改善候補：
- search_pathを空にする追加防御
- 関数・トリガー定義のmigration管理
```

## 現時点の判断

ClaudeのCL-09は、監査用コピーに定義が存在しなかったために生じた未確認事項であり、実環境に危険な設定が存在すると断定した指摘ではなかった。

今回の実環境確認により、関数本体、所有者、`SECURITY DEFINER`、固定された`search_path`、EXECUTE権限、スキーマCREATE権限、関連トリガーを確認した。

一般利用者が関数を直接実行する経路や、`public`スキーマの名前解決へ介入する経路は確認されなかったため、CL-09のMVP公開前の追加確認は完了とする。

## 今後の対応

- 現在の関数や権限は、MVP公開前には変更しない
- `search_path = ''`への変更はMVP後の防御強化候補とする
- DB定義をmigrationとして再現可能に管理する際に、関数とトリガーの定義も追加する
- 将来関数本体または権限を変更した場合は、招待フローとユーザー作成を再確認する
