"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();
const signUpMode = process.env.NEXT_PUBLIC_SIGNUP_MODE ?? "invite";
const isPublicSignUpEnabled = signUpMode === "public";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!agreedToTerms) {
      setError("利用規約とプライバシーポリシーに同意してください。");
      return;
    }

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
      router.push("/dashboard");
      return;
    }
    setMessage(
      "確認メールを送信しました。メール内のリンクから認証してください。",
    );
    setLoading(false);
  };

  if (!isPublicSignUpEnabled) {
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
              <h2 className="text-2xl font-bold text-gray-900">
                新規登録について
              </h2>
            </div>

            <div className="mb-8 hidden lg:block">
              <h2 className="text-2xl font-bold text-gray-900">
                新規登録について
              </h2>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-700">
              <p>ConnLogは現在、招待制で公開しています。</p>
              <p className="mt-3">一般の新規登録は受け付けていません。</p>
              <p className="mt-3">
                招待を受けた方は、メール内のリンクからパスワードを設定してください。
              </p>
              <p className="mt-3">
                すでにアカウントをお持ちの方は、ログイン画面からご利用ください。
              </p>
            </div>

            <Link
              href="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              ログイン画面へ
            </Link>
            <p className="mt-5 text-center text-xs text-gray-500">
              <Link
                href="/terms"
                className="underline-offset-4 hover:underline"
              >
                利用規約
              </Link>
              <span className="mx-2 text-gray-300">/</span>
              <Link
                href="/privacy-policy"
                className="underline-offset-4 hover:underline"
              >
                プライバシーポリシー
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

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

            <div className="pt-1">
              <label
                htmlFor="terms-consent"
                className="flex items-start gap-3 text-sm leading-6 text-gray-700"
              >
                <input
                  id="terms-consent"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span>
                  <Link
                    href="/terms"
                    className="font-medium text-blue-600 underline-offset-4 hover:underline"
                  >
                    利用規約
                  </Link>
                  と
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-blue-600 underline-offset-4 hover:underline"
                  >
                    プライバシーポリシー
                  </Link>
                  に同意します。
                </span>
              </label>
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
              disabled={loading || !agreedToTerms}
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
        </div>
      </section>
    </main>
  );
}
