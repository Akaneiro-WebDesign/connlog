"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        setErrorMsg("メールアドレスまたはパスワードが正しくありません。");
      } else if (error.message === "Email not confirmed") {
        setErrorMsg(
          "メールアドレスの確認が完了していません。確認メールをご確認ください。",
        );
      } else {
        setErrorMsg(error.message);
      }
      setIsLoading(false);
      return;
    }

    router.push("/");
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
            <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-10 rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "ログイン中" : "ログイン"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link
              href="/signup"
              className="ml-1 font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              新規登録
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
