import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { event_id } = req.query;

    if (!event_id || typeof event_id !== 'string'){
        return res.status(400).json({ error: 'event_id は必須です。'});
    }

    const apiKey = process.env.CONNPASS_API_KEY;
    if (!apiKey){
        return res.status(500).json({error: 'APIキーが設定されていません。'});
    }

    try {
        const apiRes = await fetch(`https://connpass.com/api/v2/events/?event_id=${event_id}`, 
        {
            headers: {
                'X-API-Key': apiKey,
            },
        }
    );

        if (!apiRes.ok){
            return res
            .status(apiRes.status)
            .json({error: 'connpass APIからの取得に失敗しました。'});
        }

const data = await apiRes.json();

if (!data.events || data.events.length === 0){
    return res.status(404).json({ error: 'イベントが見つかりません。'});
}

return res.status(200).json(data.events[0]);
    } catch (err) {
        console.error('[APIルートエラー]', err);
        return res.status(500).json({ error:'サーバーエラーが発生しました。'});
    }
}