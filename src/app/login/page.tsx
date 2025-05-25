'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/browser';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">ログイン</h1>
            <form
            onSubmit={async (e) => {
                e.preventDefault();
                setMessage(''); //メッセージリセット

                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options:{
                        emailRedirectTo: `${location.origin}/dashboard`, //ログイン成功後の遷移先 
                    },
                });

                if (error) {
                    console.error(error.message);
                    setMessage('ログインリンクの送信に失敗しました');
                } else {
                    setMessage('ログインリンクを送信しました。メールをご確認ください。');
                }
            }}
            >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                </label>
                <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                placeholder="you@example.com"
                required
                />
                <button
                type="submit"
                className="w-full bg-connpass-red text-white py-2 px-4 rounded hover:bg-red-600 transition"
                >
                    ログインリンクを送信
                </button>
                {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
            </form>
        </div>
    );
}