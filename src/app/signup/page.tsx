'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client'

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const supabase = getSupabaseClient();

    // const handleSignup = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     console.log('=== Next.js 15 + Supabase SSR サインアップ開始 ===');
    //     console.log('Email:', email, 'Password length:', password.length);
        
    //     setMessage('');
        
    //     console.log('Supabase client:', supabase);
    //     console.log('Calling signUp...'); 
        
    //     const { data, error: signupError } = await supabase.auth.signUp({
    //         email,
    //         password
    //     });
        
    //     console.log('SignUp response:', { data, error: signupError }); 
        
    //     if (signupError) {
    //         console.error('Signup Error Details:', {
    //             message: signupError.message,
    //             status: signupError.status,
    //             code: signupError.code,
    //             details: signupError
    //         });

    //         let userMessage =`登録に失敗しました：${signupError.message}`;

    //     if (signupError.message.includes('Database error')) {
    //         userMessage += '(データベース接続エラー)';
    //     } else if (signupError.message.includes('Email')) {
    //         userMessage += '(メール設定エラー)';
    //     }

    //     setMessage(userMessage);
    //     return;
    // }

    //     const user = data.user;
    //     if (!user) {
    //         console.error('User creation failed - no user object returned');
    //         setMessage('ユーザー情報の取得に失敗しました');
    //         return;
    //     }

    //     console.log('User created successfully:', {
    //         id: user.id,
    //         email: user.email,
    //         email_confirmed_at: user.email_confirmed_at,
    //         confirmed_at: user.confirmed_at
    //     });

    //     try {
    //     const res = await fetch('/api/signup',{
    //         method: 'POST',
    //         headers: {'Content-Type': 'application/json'},
    //         body: JSON.stringify({id: user.id, email: user.email}),
    //     });
    //     const resData = await res.json();

    //     console.log('API Response:', {
    //         status: res.status,
    //         ok: res.ok,
    //         data: resData
    //     });

    //     if (!res.ok) {
    //     setMessage(`usersテーブル登録エラー: ${resData.error}`);
    //     return;
    //     }
    // } catch (apiError) {
    //     console.error('API Call Error:', apiError);
    //     setMessage('API呼び出しエラーが発生しました');
    //     return;
    // }

    //     const { error: loginError } = await supabase.auth.signInWithPassword({
    //         email,
    //         password,
    //     });

    //     if (loginError) {
    //         setMessage(`ログインに失敗しました：${loginError.message}`);
    //             return;
    //     }
    //             router.push('/dashboard');
    //         };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
      
        try {
          // サインアップAPI呼び出し
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
      
          const result = await response.json();
      
          if (!response.ok) {
            setMessage(`サインアップに失敗しました: ${result.error}`);
            return;
          }
      
          // 作成後にクライアントで即ログイン
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
      
          if (loginError) {
            setMessage(`ログインに失敗しました: ${loginError.message}`);
            return;
          }
      
          setMessage('登録とログインが完了しました！');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } catch (error) {
          setMessage('ネットワークエラーが発生しました。再試行してください。');
        }
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

            <button
            type="button"
            onClick={async () => {
                console.log('=== Supabase接続テスト ===');
                console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
                console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                
                try {
                const { data, error } = await supabase.from('users').select('*').limit(1);
                console.log('Database test result:', { data, error });
                } catch (e) {
                console.error('Database test error:', e);
                }
            }}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
            接続テスト
            </button>
        </div>
    );
}