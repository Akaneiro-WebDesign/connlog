// app/signup/page.jsx
"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
    if (error) setError(error.message);
    else setMessage("サインアップ完了！そのままログインできます。");
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">新規登録</h1>
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            disabled={loading}
            placeholder="メールアドレス"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">パスワード (6文字以上)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            minLength={6}
            required
            disabled={loading}
            placeholder="パスワード"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-sm font-medium mb-1">ニックネーム(任意)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="ニックネーム(任意)"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "処理中..." : "新規登録"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-green-600">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <p className="mt-4 text-sm">
        すでにアカウントをお持ちの方は
        <a href="/login" className="text-blue-600 underline ml-1">
          ログイン
        </a>
      </p>

    </div>
  );
}
