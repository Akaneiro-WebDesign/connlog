/**
 * HTML概要文サニタイザー
 * HTMLタグを除去し、HTMLエンティティを変換して、指定文字数で切り詰める
 * 
 * @param description - 元の説明文（HTML含む可能性あり）
 * @param maxLength - 最大文字数（デフォルト: 150）
 * @returns サニタイズされた説明文
 */
export const sanitizeEventDescription = (description: string, maxLength: number = 150): string => {
    if (!description) return ''
    
    const stripHtml = (html: string): string => {
      if (typeof window !== 'undefined') {
        const temp = document.createElement('div')
        temp.innerHTML = html
        return temp.textContent || temp.innerText || ''
      }
      
      return html
        .replace(/<br\s*\/?>/gi, ' ')         // <br>をスペースに
        .replace(/<\/p>/gi, '\n')            // </p>を改行に  
        .replace(/<[^>]*>/g, '')             // HTMLタグ除去
        .replace(/&nbsp;/g, ' ')             // &nbsp;をスペースに
        .replace(/&amp;/g, '&')              // &amp;を&に
        .replace(/&lt;/g, '<')               // &lt;を<に
        .replace(/&gt;/g, '>')               // &gt;を>に
        .replace(/&quot;/g, '"')             // &quot;を"に
        .replace(/&#39;/g, "'")              // &#39;を'に
        .replace(/\s+/g, ' ')                // 複数の空白を1つに
        .trim()                              // 前後空白除去
    }
    
    const hasHtmlTags = /<[^>]*>/g.test(description)
    let cleaned = hasHtmlTags ? stripHtml(description) : description
    
    // 基本的な整理
    cleaned = cleaned
      .replace(/\n+/g, ' ')                  // 改行をスペースに変換
      .replace(/\s+/g, ' ')                  // 複数スペースを1つに
      .trim()                                // 前後空白除去
    
    // 指定された文字数で切り詰め（"..."込みで制限文字数以内にする）
    return cleaned.length > maxLength 
      ? cleaned.substring(0, maxLength - 3) + '...'
      : cleaned
  }