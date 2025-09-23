/**
 * connpassイベント説明文のHTMLタグ除去と文字数制限
 * ブラウザ環境ではDOM API、サーバー環境では正規表現を使用してクロスプラットフォーム対応
 * @param description - 元の説明文（HTML含む可能性あり）
 * @param maxLength - 最大文字数（デフォルト: 150）
 * @returns サニタイズされた説明文
 */
export const sanitizeEventDescription = (description: string, maxLength: number = 150): string => {
    if (!description) return ''
    const stripHtml = (html: string): string => {
        if (typeof window !== 'undefined') {
            // ブラウザ環境：DOM APIで正確なHTML除去
            const temp = document.createElement('div')
            temp.innerHTML = html
            return temp.textContent || temp.innerText || ''
        }

        // サーバー環境：正規表現でHTML処理
        return html
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')

        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()  
    }

    // HTMLタグの有無に関わらず統一処理（簡略化）	
    const cleaned = stripHtml(description)  
    .replace(/\n+/g, ' ') // 改行を正規化
        .replace(/\s+/g, ' ') // 空白を正規化（stripHtml内で実行済みだが保険）
        .trim()

    // 文字数制限（"..."込みで制限内にする）
    return cleaned.length > maxLength
        ? cleaned.substring(0, maxLength - 3) + '...'
        : cleaned
}