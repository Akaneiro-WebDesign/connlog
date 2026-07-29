# ConnLog Supabase Security Advisor 監査メモ

最終確認日：2026年7月29日

## 目的

Supabase Security Advisorの警告を確認し、MVP公開前に重大な未解決事項が残っていないかを記録する。

## 実施内容

以下の警告対応・確認を実施した。

- DB関数の `Function Search Path Mutable` 関連を修正
- 未使用の `insert_user_tag` 関数を削除
- `handle_new_user` 関数の直接実行権限を制限
- 未使用の `pgjwt` 拡張を削除
- Postgres更新前にDBのデータ・構造をバックアップ
- Postgresを `15.8.1.094` から `17.6.1.147` へ更新
- 更新後にConnLogのダッシュボード表示を確認

## 最終確認結果

2026年7月29日にSupabase Security Advisorを確認した結果。

- Errors：0件
- Warnings：1件
- Info：0件

### 残存Warning

- `Leaked Password Protection Disabled`

これは、漏えい済みパスワードの利用を検知・拒否する保護機能が無効であることを示す設定上のWarningである。

現時点で認証回避、データ漏えい、またはDB関数・RLSに関する問題が確認されたものではない。

## 判断

DB関数、関数実行権限、未使用拡張、Postgres更新に関するSecurity Advisorの警告は解消済みであることを確認した。

残存する `Leaked Password Protection Disabled` は既知の制約として記録し、現時点ではMVP開始のブロッカーとはしない。

今後、利用プランやSupabaseの設定を見直す際に、漏えい済みパスワード保護を有効化できるか改めて確認する。