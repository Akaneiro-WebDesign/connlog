/**
 * connpassイベントの日時を日本語形式でフォーマット
 * EventSearchFormとSearchTagMemoModalで共通利用
 */
export const formatDateTime = (startDateTime: string, endDateTime?: string) => {
    if (!startDateTime) return { date: '日付不明', time: '' }

    try {
        const startDate = new Date(startDateTime)

        // 日付の妥当性をチェック
        if (isNaN(startDate.getTime())) {
            throw new Error('Invalid date')
        }

        const year = startDate.getFullYear()
        const month = startDate.getMonth() + 1
        const day = startDate.getDate()

        const weekdays = ['日', '月', '火', '水', '木', '金', '土']
        const weekday = weekdays[startDate.getDay()]

        const dateStr = `${year}年${month}月${day}日 (${weekday})`

        // 開始時間
        const startHour = String(startDate.getHours()).padStart(2, '0')
        const startMinute = String(startDate.getMinutes()).padStart(2, '0')
        let timeStr = `${startHour}:${startMinute}`

        // 終了時間があれば追加
        if (endDateTime) {
            try {
                const endDate = new Date(endDateTime)
                if (!isNaN(endDate.getTime())) {
                    const endHour = String(endDate.getHours()).padStart(2, '0')
                    const endMinute = String(endDate.getMinutes()).padStart(2, '0')
                    timeStr = `${timeStr}〜${endHour}:${endMinute}`
                }
            } catch {
                // 終了時間のパースに失敗した場合は開始時間のみ
            }
        }

        return { date: dateStr, time: timeStr }

    } catch (error) {
        // フォールバック
        const dateOnly = startDateTime.split('T')[0]
        if (dateOnly) {
            const [year, month, day] = dateOnly.split('-')
            return {
                date: `${year}年${month}月${day}日`,
                time: ''
            }
        }
        return { date: '日付不明', time: '' }
    }
}