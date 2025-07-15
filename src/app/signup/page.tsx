'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const { error: signupError } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (signupError) {
            console.error(signupError.message);
            setMessage(`登録に失敗しました：${signupError.message}`);
            return;
        } 

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            console.error(loginError.message);
            setMessage(`ログインに失敗しました：${loginError.message}`);
                return;
        }
                router.push('/dashboard');
            };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white-rounded shadow">
            <h1 className="text-2xl font-bold mb-4">新規登録</h1>
            <form onSubmit={handleSignup}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                </label>
                <input
                id="email"
                type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                    placeholder="you@example.com"
                    required
                />
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード（6文字以上）
                </label>
                <input
                id="password"
                type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                    minLength={6}
                    required
                />
                <button
                type="submit"
                className="w-full bg-connpass-red text-white py-2 px-4 rounded bg-red-600 transition"
                >
                    新規登録
                </button>
                {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
            </form>

            <p className="mt-4 text-sm">
                すでにアカウントをお持ちの方は
                <a href="/login" className="text-blue-600 underline ml-1">
                ログイン
                </a>
            </p>
        </div>
    );
}