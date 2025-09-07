import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ページングパラメータを追加
    const { nickname, start = '0', count = '20' } = req.query;
    
    if (!nickname || typeof nickname !== 'string'){
        return res.status(400).json({ error: 'nicknameパラメータが必要です'});
    }

    const apiKey = process.env.CONNPASS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'APIキーが設定されていません。'});
    }

    try {
        // ページングパラメータをクエリに追加
        const apiUrl = `https://connpass.com/api/v2/users/${nickname}/attended_events/?start=${start}&count=${count}`;
        
        console.log('=== API Request Debug ===');
        console.log('API URL:', apiUrl);
        console.log('Start:', start, 'Count:', count);
        
        const response = await fetch(apiUrl, {
            headers: {
                'X-API-Key': apiKey,
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({error: 'connpass APIからの取得に失敗しました。'});
        }

        const data = await response.json();
        
        // 🔧 connpass APIのレスポンス構造をデバッグ出力
        console.log('=== Connpass API Response Debug ===');
        console.log('results_returned:', data.results_returned);
        console.log('results_available:', data.results_available);
        console.log('results_start:', data.results_start);
        console.log('events length:', data.events?.length);
        console.log('Full response keys:', Object.keys(data));
        
        // 🔧 connpass APIの構造に基づいて正しいページング情報を設定
        const totalResults = data.results_available || data.events?.length || 0;
        const returnedResults = data.results_returned || data.events?.length || 0;
        
        return res.status(200).json({
            ...data,
            pagination: {
                start: parseInt(start as string),
                count: parseInt(count as string),
                total: totalResults, // results_availableを使用
                returned: returnedResults,
                hasMore: returnedResults === parseInt(count as string) && (parseInt(start as string) + returnedResults) < totalResults
            }
        });
    } catch (error) {
        console.error('[ERROR] connpass API通信失敗:', error);
        return res.status(500).json({error: 'サーバーエラーが発生しました。'});
    }
}