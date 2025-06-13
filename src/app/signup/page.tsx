'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const supabase = createClientComponentClient();
    const router = useRouter();

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if(error) {
            setMessage(`登録に失敗しました: ${error.message}`);
        } else {
            setMessage('仮登録が完了しました。メールを確認してください。');
            router.push('/login');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>新規登録ページ</h2>
            <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', marginBottom: '1rem' }}
            />
            <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', marginBottom: '1rem' }}
            />
            <button onClick={handleSignup}>登録</button>
            {message && <p>{message}</p>}
        </div>
    );
}