import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * connpassユーザーの参加イベント一覧取得プロキシAPI
 * ページング対応で大量データを効率的に処理
 * 
 * @route GET /api/search-user
 * @query nickname - connpassのユーザー名
 * @query start - 取得開始位置（デフォルト: 0）
 * @query count - 取得件数（デフォルト: 20）
 * @returns ユーザーのイベント一覧とページング情報
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { nickname, start = '0', count = '20' } = req.query;

    if (!nickname || typeof nickname !== 'string') {
        return res.status(400).json({ error: 'nicknameパラメータが必要です' });
    }

    const apiKey = process.env.CONNPASS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'APIキーが設定されていません。' });
    }

    try {
        const apiUrl = `https://connpass.com/api/v2/users/${nickname}/attended_events/?start=${start}&count=${count}`;

        const response = await fetch(apiUrl, {
            headers: {
                'X-API-Key': apiKey,
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'connpass APIからの取得に失敗しました。' });
        }

        const data = await response.json();

        // ページング情報の計算
        const totalResults = data.results_available || data.events?.length || 0;
        const returnedResults = data.results_returned || data.events?.length || 0;

        return res.status(200).json({
            ...data,
            pagination: {
                start: parseInt(start as string),
                count: parseInt(count as string),
                total: totalResults,
                returned: returnedResults,
                hasMore: returnedResults === parseInt(count as string) && (parseInt(start as string) + returnedResults) < totalResults
            }
        });
    } catch (error) {
        console.error('[ERROR] connpass API通信失敗:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
}