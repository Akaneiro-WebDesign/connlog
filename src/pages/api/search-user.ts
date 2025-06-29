import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { nickname } = req.query;

    if (!nickname || typeof nickname !== 'string'){
        return res.status(400).json({ error: 'nicknameパラメータが必要です'});
}
const apiKey = process.env.CONNPASS_API_KEY;
if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません。'});
}

try {
    const apiUrl = `https://connpass.com/api/v2/users/${nickname}/attended_events/`;
    const response = await fetch(apiUrl,{
        headers:{
            'X-API-Key': apiKey,
        },
    });

    if (!response.ok) {
        return res.status(response.status).json({error: 'connpass APIからの取得に失敗しました。'});
    }

    const data = await response.json();
    return res.status(200).json(data);
    } catch (error) {
        console.error('[ERROR] connpass API通信失敗:',error);
        return res.status(500).json({error: 'サーバーエラーが発生しました。'});

    }
}