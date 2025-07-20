'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setMessage(`エラー: ${error.message}`);
        return;
      }
      if (data.user) {
        setMessage('確認メールを送信しました。メールをチェックしてください。');
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err) {
      setMessage('予期しないエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">新規登録</h1>
      <form onSubmit={handleSignup}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? '処理中...' : '新規登録'}</button>
      </form>
      {message && <p>{message}</p>}

            <button
        type="button"
        onClick={async () => {
            console.log('=== 直接Supabaseテスト ===');
            try {
            const { data, error } = await supabase.auth.signUp({
                email: 'test@example.com',
                password: 'testpassword123'
            });
            console.log('直接テスト結果:', { data, error });
            setMessage(`テスト結果: ${error ? error.message : '成功'}`);
            } catch (err) {
            console.error('直接テストでエラー発生:', err);
            setMessage('直接テストでエラー発生');
            }
        }}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
        直接サインアップテスト
        </button>

    </div>
  );
}
