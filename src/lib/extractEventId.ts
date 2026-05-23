/**
 * connpassのイベントURLまたはIDから数値IDを抽出
 * @param urlOrId - 'https://connpass.com/event/123456/' または '123456'
 * @returns 数値ID文字列 または null（無効な場合）
 */
export function extractEventId(urlOrId: string): string | null {
    // URL形式からイベントIDを抽出
    const match = urlOrId.match(/event\/(\d+)/);
    if (match){
        return match[1];
    }
    // 数値のみの直接入力の場合
    if (/^\d+$/.test(urlOrId)){
        return urlOrId;
}

return null;
}