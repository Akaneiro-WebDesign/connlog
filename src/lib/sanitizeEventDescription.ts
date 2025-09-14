@param description
@param maxLength
@returns

export const sanitizeEventDescription = (description: string, maxLength: number = 150): string => {
    if (!description) return ''

    const stripHtml = (html: string): string => {
        if (typeof window !== 'undefined') {
            const temp = document.createElement('div')
            temp.innerHTML = html
            return temp.textContent || temp.innerText || ''
        }

        return html
        .replace(/<br\s*\/?>/gi, ' ')   // <br>をスペースにする
        .replace(/<\/p>/gi, '\n')       // </p>を改行にする
        .replace(/<[^>]*>/g, '')        // HTMLタグを除去する
        .replace(/&nbsp;/g, ' ')        // &nbsp;をスペースにする
        .replace(/&amp;/g, '&')         // &ampを&にする
        .replace(/&lt;/g, '<')          // &lt;を<にする
        .replace(/&gt;/g, '>')          // &gt;を>にする
        .replace(/&quot;/g, '"')        // &quot;を"にする

        .replace(/&#39;/g, "'")         // &#39;を'にする
        .replace(/\s+/g, ' ')           //  複数の空白を1つにする
        .trim()                         //  前後空白を除去する
    }

    const hasHtmlTags = /<[^>]*>/g.test(description)
    let cleaned = hasHtmlTags ? stripHtml(description) : description

    // 基本的な整理
    cleaned = cleaned
        .replace(/\n+/g, ' ')   // 改行をスペースに変換する
        .replace(/\s+/g, ' ')   // 複数スペースを1つに
        .trim()  // 前後空白除去

    // 指定された文字数で切り詰め（"..."込みで制限数以内にする）
    return cleaned.length > maxLength
        ? cleaned.substring(0, maxLength - 3) + '...'
        : cleaned
}