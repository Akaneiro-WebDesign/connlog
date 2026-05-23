import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * connpassイベント取得プロキシAPI
 * フロントエンドのCORS制限を回避し、APIキー管理を一元化
 * 
 * @route GET /api/search-event
 * @query event_id - connpassのイベントID
 * @returns イベント詳細情報またはエラー
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // パラメータバリデーション
    const { event_id } = req.query;
    if (!event_id || typeof event_id !== 'string') {
        return res.status(400).json({ error: 'event_id は必須です。' });
    }

    // 環境設定確認
    const apiKey = process.env.CONNPASS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'APIキーが設定されていません。' });
    }

    try {
        const apiRes = await fetch(`https://connpass.com/api/v2/events/?event_id=${event_id}`,
            {
                headers: {
                    'X-API-Key': apiKey,
                },
            }
        );

        if (!apiRes.ok) {
            return res
                .status(apiRes.status)
                .json({ error: 'connpass APIからの取得に失敗しました。' });
        }

        const data = await apiRes.json();

        if (!data.events || data.events.length === 0) {
            return res.status(404).json({ error: 'イベントが見つかりません。' });
        }

        return res.status(200).json(data.events[0]);
    } catch (err) {
        console.error('[APIルートエラー]', err);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
}