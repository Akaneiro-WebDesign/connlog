# Troubleshooting

## 2026-04-16 connpass検索で高確率に取得失敗していた問題

### 症状
- connpass検索機能で、高確率にイベント取得へ失敗することがあった
- 特にユーザー名検索が不安定に見えた

### 原因
- `src/lib/fetchUserEvents.ts` で送信していた query parameter 名が `wstart` になっていた
- 一方で `/api/search-user` 側では `start` を受け取る実装になっていた
- そのため、取得開始位置が正しく API route に渡らず、検索結果取得が不安定になっていた

### 対応
- `src/lib/fetchUserEvents.ts` の query parameter を `wstart` から `start` に修正
- あわせて、`nickname` は `encodeURIComponent()` を使って安全に送るように修正
- `pagination` の返却も確認し、ページ送りの挙動を再確認した

### 確認結果
- ユーザー名検索：正常動作を確認
- イベントID検索：正常動作を確認
- イベントURL検索：正常動作を確認
- 以前の「高確率で取得に失敗する」状態は再現しなくなった

### 補足
- connpass のユーザー名は文字種に制限があるため、危険な文字が入りにくい設計と思われる
- 外部 API の一時的な失敗は今後もありうるため、本対応では「通常操作で安定して検索できること」を完了基準とした