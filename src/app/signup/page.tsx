"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      if (error.message === "User already registered") {
        setError(
          "このメールアドレスはすでに登録されています。ログインしてください。",
        );
      } else {
        setError(error.message);
      }

      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/");
      return;
    }
    setMessage(
      "確認メールを送信しました。メール内のリンクから認証してください。",
    );
    setLoading(false);
  };

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      <section className="hidden min-h-screen bg-red-600 text-white lg:flex lg:items-center lg:justify-center">
        <h1 className="text-7xl font-bold tracking-wide xl:text-8xl">
          ConnLog
        </h1>
      </section>
      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="flex items-center justify-center">
              <div className="mb-7 flex h-14 w-44 items-center justify-center bg-red-600">
                <h1 className="text-3xl font-bold tracking-wide text-white">
                  ConnLog
                </h1>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">新規登録</h2>
          </div>
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900">新規登録</h2>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                required
                disabled={loading}
                placeholder="example@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                パスワード（6文字以上）
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                minLength={6}
                required
                disabled={loading}
                placeholder="パスワードを入力"
                autoComplete="new-password"
              />
            </div>

            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-10 rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "登録中" : "新規登録"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            すでにアカウントをお持ちの方は
            <Link
              href="/login"
              className="ml-1 font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              ログイン
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-gray-500">
            新規登録前に
            <Link
              href="/privacy-policy"
              className="mx-1 underline-offset-4 hover:underline"
            >
              プライバシーポリシー
            </Link>
            をご確認ください。
          </p>
        </div>
      </section>
    </main>
  );
}
