"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setHasSession(true);
      } else {
        setErrorMessage(
          "招待リンクの有効期限が切れているか、ログイン状態を確認できませんでした。",
        );
      }

      setIsChecking(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 6) {
      setErrorMessage("パスワードは6文字以上で入力してください。");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("確認用パスワードが一致しません。");
      return;
    }

    try {
      setIsSaving(true);

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "パスワードを設定しました。ダッシュボードへ移動します。",
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (error) {
      console.error("パスワード設定エラー:", error);
      setErrorMessage(
        "パスワードの設定に失敗しました。時間をおいてもう一度お試しください。",
      );
    } finally {
      setIsSaving(false);
    }
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
            <h2 className="text-2xl font-bold text-gray-900">パスワード設定</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              招待されたアカウントで利用するパスワードを設定してください。
            </p>
          </div>
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-900">パスワード設定</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              招待されたアカウントで利用するパスワードを設定してください。
            </p>
          </div>

          {isChecking ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              招待情報を確認しています...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={6}
                    required
                    disabled={isSaving || !hasSession}
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="6文字以上で入力"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)}
                    disabled={isSaving || !hasSession}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "パスワードを非表示にする"
                        : "パスワードを表示する"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  新しいパスワード（確認）
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={6}
                    required
                    disabled={isSaving || !hasSession}
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="もう一度入力"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isSaving || !hasSession}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? "確認用パスワードを非表示にする"
                        : "確認用パスワードを表示する"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  {successMessage}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={isSaving || !hasSession}
                className="w-full mt-10 rounded-lg bg-gray-900 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "設定中..." : "パスワードを設定する"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link
              href="/login"
              className="font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              ログイン画面へ戻る
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
