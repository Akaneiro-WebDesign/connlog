'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle,
  Edit3,
  RotateCcw,
  Save,
  Trash2,
  UserCog,
} from 'lucide-react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Profile = {
  displayName: string;
  bio: string;
};

type ProfileResponse = {
  profile: Profile;
};

const ProfilePageSkeleton = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="" />
        <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
          <div
            className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 animate-pulse"
            role="status"
            aria-label="アカウント設定を読み込み中"
          >
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200" />
            <div className="h-8 md:h-9 w-44 md:w-60 rounded bg-gray-200" />
          </div>

          <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
            <div className="h-7 w-40 rounded bg-gray-100 animate-pulse mb-6 md:mb-10" />

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[250px_1fr] md:gap-8 items-start">
                <div className="flex justify-center md:justify-start">
                  <div className="h-46 w-46 md:h-54 md:w-54 rounded-full bg-gray-100 animate-pulse" />
                </div>
                <div className="space-y-6">
                  <div className="h-7 w-40 rounded bg-gray-100 animate-pulse" />
                  <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
                  <div className="h-7 w-32 rounded bg-gray-100 animate-pulse mt-10" />
                  <div className="h-36 rounded-lg bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    displayName: "",
    bio: "",
  });
  const [form, setForm] = useState<Profile>({
    displayName: "",
    bio: "",
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchErrorMessage, setFetchErrorMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!user) {
      router.replace("/login");
    }
  }, [mounted, isLoading, user, router]);

  useEffect(() => {
    if (!mounted || isLoading || !user) return;

    const fetchProfile = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");
        setFetchErrorMessage("");

        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "プロフィールの取得に失敗しました。");
        }

        const fetchedProfile = (result as ProfileResponse).profile;
        setProfile(fetchedProfile);
        setForm(fetchedProfile);
      } catch (error) {
        setFetchErrorMessage(
          error instanceof Error
            ? error.message
            : "プロフィールの取得に失敗しました。",
        );
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [mounted, isLoading, user]);

  const avatarText = useMemo(() => {
    const base =
      form.displayName.trim() ||
      profile.displayName.trim() ||
      user?.email?.charAt(0) ||
      "U";

    return base.charAt(0).toUpperCase();
  }, [form.displayName, profile.displayName, user?.email]);

  const handleEditStart = () => {
    setForm(profile);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(profile);
    setErrorMessage("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "プロフィールの保存に失敗しました。");
      }

      const savedProfile = (result as ProfileResponse & { success: true })
        .profile;

      setProfile(savedProfile);
      setForm(savedProfile);
      setSuccessMessage("プロフィールを保存しました。");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "プロフィールの保存に失敗しました。",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      setDeleteErrorMessage("");
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "アカウントの削除に失敗しました。");
      }

      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();

      router.replace("/login?accountDeleted=1");
      router.refresh();
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error
          ? error.message
          : "アカウントの削除に失敗しました。",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!mounted || isLoading) return <ProfilePageSkeleton />;

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="" />
        <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <UserCog className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              アカウント設定
            </h1>
          </div>

          {errorMessage ? (
            <div className="mb-4 md:mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 text-sm">{errorMessage}</div>
              </div>
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-4 md:mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-green-800 text-sm">{successMessage}</div>
                </div>
              </div>
            </div>
          ) : null}

          {fetchErrorMessage ? (
            <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">
                プロフィール
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{fetchErrorMessage}</p>
                <p className="mt-2 text-sm text-red-700">
                  時間をおいて再読み込みしてください。
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">
                プロフィール
              </h2>

              {isFetching ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-[250px_1fr] md:gap-8 items-start">
                    <div className="flex justify-center md:justify-start">
                      <div className="h-46 w-46 md:h-54 md:w-54 rounded-full bg-gray-100 animate-pulse" />
                    </div>
                    <div className="space-y-6">
                      <div className="h-7 w-40 rounded bg-gray-100 animate-pulse" />
                      <div className="h-8 w-56 rounded bg-gray-100 animate-pulse" />
                      <div className="h-7 w-32 rounded bg-gray-100 animate-pulse mt-10" />
                      <div className="h-36 rounded-lg bg-gray-100 animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : isEditing ? (
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="grid gap-6 md:grid-cols-[250px_1fr] md:gap-8 items-start">
                    <div className="flex justify-center md:justify-start md:self-center">
                      <div
                        className="flex h-46 w-46 md:h-54 md:w-54 items-center justify-center rounded-full text-4xl md:text-5xl font-semibold text-white"
                        style={{ backgroundColor: "#FF8C42" }}
                      >
                        {avatarText}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-7 w-1 rounded-sm bg-gray-900" />
                        <h3 className="text-lg md:text-l font-semibold text-gray-900">
                          ユーザー名
                        </h3>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={form.displayName}
                          disabled={isSaving}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              displayName: event.target.value,
                            }))
                          }
                          maxLength={50}
                          className="w-full flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="ユーザー名"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {form.displayName.length}/50
                        </p>
                      </div>
                      <div className="mt-10">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="inline-block h-7 w-1 rounded-sm bg-gray-900" />
                          <h3 className="text-lg md:text-l font-semibold text-gray-900">
                            自己紹介
                          </h3>
                        </div>
                        <div>
                          <textarea
                            value={form.bio}
                            disabled={isSaving}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                bio: event.target.value,
                              }))
                            }
                            maxLength={300}
                            rows={5}
                            className="min-h-[140px] w-full text-sm md:text-base text-gray-700 whitespace-pre-wrap outline-none resize-none bg-gray-50 rounded-lg p-4 md:p-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="自己紹介"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {form.bio.length}/300
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center gap-3 mt-8 md:mt-15">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "保存中..." : "保存"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4" />
                      戻る
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <div className="grid gap-6 md:grid-cols-[250px_1fr] md:gap-8 items-start">
                    <div className="flex justify-center md:justify-start md:self-center">
                      <div
                        className="flex h-46 w-46 md:h-54 md:w-54 items-center justify-center rounded-full text-4xl md:text-5xl font-semibold text-white"
                        style={{ backgroundColor: "#FF8C42" }}
                      >
                        {avatarText}
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-7 w-1 rounded-sm bg-gray-900" />
                        <h3 className="text-lg md:text-l font-semibold text-gray-900">
                          ユーザー名
                        </h3>
                      </div>
                      <div className="text-lg md:text-xl text-gray-900 break-words">
                        {profile.displayName || "未設定"}
                      </div>
                      <div className="mt-10">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="inline-block h-7 w-1 rounded-sm bg-gray-900" />
                          <h3 className="text-lg md:text-l font-semibold text-gray-900">
                            自己紹介
                          </h3>
                        </div>
                        <div className="min-h-[140px] w-full text-sm md:text-base text-gray-700 whitespace-pre-wrap outline-none resize-none bg-gray-50 rounded-lg p-4 md:p-6">
                          {profile.bio || "設定されていません。"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-center gap-3 mt-8 md:mt-15">
                    <button
                      type="button"
                      onClick={handleEditStart}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit3 className="w-4 h-4" />
                      編集
                    </button>
                  </div>
                </div>
              )}

              {!isFetching && !isEditing ? (
                <div className="mt-8 border-t border-gray-100 pt-5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setDeleteErrorMessage("");
                    }}
                    disabled={isDeletingAccount}
                    className="text-sm text-gray-500 underline-offset-4 hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    アカウントを削除する
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {showDeleteConfirm ? (
            <div
              className="fixed inset-0 flex items-center justify-center z-[60] p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            >
              <div className="bg-white rounded-lg max-w-md w-full mx-4">
                <div className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    アカウントを削除しますか？
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-2 leading-6">
                    削除すると、以下の情報がすべて失われます。
                  </p>
                  <p className="text-sm text-red-600 text-center">
                    この操作は取り消すことができません。
                  </p>
                  <div className="mx-auto mt-5 mb-6 w-full max-w-xs rounded-lg border border-red-100 bg-red-50 p-4">
                    <ul className="list-disc space-y-2 pl-5 text-left text-sm text-gray-700">
                      <li>登録イベント</li>
                      <li>タグ</li>
                      <li>メモ</li>
                      <li>プロフィール情報</li>
                    </ul>
                  </div>

                  {deleteErrorMessage ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-800">
                        {deleteErrorMessage}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteErrorMessage("");
                      }}
                      disabled={isDeletingAccount}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      キャンセル
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isDeletingAccount ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          削除中...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          削除
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
