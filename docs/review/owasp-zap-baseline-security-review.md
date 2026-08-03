# OWASP ZAP Baseline Scan 安全性調査

調査日：2026年8月3日

## 対象

```txt
Production
https://connlog.vercel.app/
```

OWASP ZAPのBaseline Scanを使用し、ログイン前に到達できる画面・静的ファイルを対象とした非破壊的な診断を実施した。

Active Scanや、データの更新・削除を伴う診断は実施していない。

Vercel Deployment Protectionを通過するため、一時的なProtection Bypass for Automationを使用した。診断後、ターミナル上の値を削除し、Vercel側のBypassシークレットも削除済み。

## 調査目的

MVP公開前の安全確認として、Production環境で以下を確認する。

* 基本的なセキュリティヘッダーが設定されていること
* OWASP ZAP Baseline Scanで重大な問題が検出されないこと
* 残る警告について、MVP時点での対応方針を整理すること

## 実施した対応

ZAP初回診断で検出されたヘッダー関連の警告に対応するため、`next.config.ts`へ以下を追加した。

* Content Security Policy
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Referrer-Policy: strict-origin-when-cross-origin`
* Permissions Policy
* `X-Powered-By`の非表示

Production環境で、上記ヘッダーが実際に返されることをブラウザのNetworkタブで確認した。

また、変更後に以下の主要導線を確認した。

```txt
ログイン
→ ダッシュボード表示
→ ログアウト
```

CSPによる画面表示・操作の問題は確認されなかった。

## 診断結果

### 初回診断

```txt
FAIL-NEW: 0
WARN-NEW: 12
PASS: 55
```

### セキュリティヘッダー対応後の再診断

```txt
FAIL-NEW: 0
WARN-NEW: 7
PASS: 60
```

レポート上の内訳は以下のとおり。

```txt
High：0件
Medium：3件
Low：2件
Informational：6件
```

今回追加したCSP、クリックジャッキング対策、Permissions Policy、`nosniff`、`X-Powered-By`非表示に関する警告は解消された。

## 残った警告と対応方針

### CSP: script-src 'unsafe-inline'

Mediumとして検出された。

現在のCSPには`unsafe-eval`は含まれていないが、Next.jsの動作に必要な`script-src 'unsafe-inline'`が含まれている。

これを外すには、Next.jsのnonce方式CSPへの移行と、ページの動的レンダリング化が必要になる。認証・画面表示・外部サービス連携への影響確認も必要なため、警告数を減らす目的だけでMVP公開前に変更しない。

外部コードレビュー時の確認事項として残す。

### CSP: style-src 'unsafe-inline'

Mediumとして検出された。

現在のNext.js・Tailwind CSS構成では、`style-src 'unsafe-inline'`を単純に削除すると表示への影響があり得る。

`script-src`と同様に、nonce方式CSPを検討するタイミングでまとめて扱う。MVP公開前の必須対応にはしない。

### Cross-Domain Misconfiguration

Mediumとして検出された。

`Access-Control-Allow-Origin: *`は、ログイン画面、`robots.txt`、`sitemap.xml`、Next.jsの静的JavaScriptファイルに対して検出された。

今回のBaseline Scanでは、認証済みAPIや個人データを返すAPIに対する同じ警告は検出されていない。

公開ページ・静的ファイルに付与されたCORSヘッダーであり、今回の結果だけでは認証情報や個人データの公開を示すものではないため、MVP時点では許容する。

今後、認証済みAPIを追加・変更する際は、レスポンスごとのCORS設定を確認する。

### Cross-Origin-Embedder-Policy Header Missing or Invalid

Lowとして検出された。

COEPを`require-corp`で有効化すると、明示的なCORSまたはCORP許可がない外部リソースをブロックする可能性がある。

ConnLogではSupabaseやconnpass APIなどの外部サービスを利用しているため、影響確認なしに追加しない。追加防御として、外部コードレビュー後の改善候補とする。

### Cross-Origin-Opener-Policy Header Missing or Invalid

Lowとして検出された。

COOPはブラウザの分離を強める追加防御である。一方で、外部サービスとの連携や画面遷移への影響確認が必要になる場合がある。

COEPとあわせて、MVP公開前の必須対応にはせず、将来の改善候補とする。

## 結論

Production環境でのOWASP ZAP Baseline Scan再診断では、High相当の問題は検出されなかった。

初回診断で検出された基本的なセキュリティヘッダー未設定の警告は、今回の対応により解消できた。

残る警告は、より厳格なCSP、CORS、COEP、COOPに関する改善候補である。現時点で認証・RLS・API・service role keyに関する重大な脆弱性を示すものは確認されていない。

## 外部レビューで確認したいこと

* nonce方式CSPへ移行する必要性と、導入時の影響範囲
* `Access-Control-Allow-Origin: *`が付与されるレスポンスの妥当性
* COEP / COOPを導入する必要性
* 本番公開後に追加で実施すべきセキュリティ診断
