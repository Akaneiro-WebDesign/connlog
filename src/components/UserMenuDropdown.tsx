"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, UserCog } from "lucide-react";

type ProfileResponse = {
  profile: {
    displayName: string;
    bio: string;
  };
};

export default function UserMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!userId) {
      setProfileDisplayName("");
      setIsProfileLoaded(true);
      return;
    }

    setIsProfileLoaded(false);

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          return;
        }

        const profile = (result as ProfileResponse).profile;
        setProfileDisplayName(profile.displayName ?? "");
      } catch {
        // 失敗時はfallbackを使う
      } finally {
        setIsProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("ログアウトエラー:", error);
    } else {
      router.replace("/login");
    }
  };

  // ユーザー表示名とイニシャル
  const displayName = isProfileLoaded
    ? profileDisplayName.trim() ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "ユーザー"
    : "";
  const initial = useMemo(() => {
    if (!isProfileLoaded) return "";
    const base =
      profileDisplayName.trim() ||
      user?.user_metadata?.name ||
      user?.email?.charAt(0) ||
      "U";
    return base.charAt(0).toUpperCase();
  }, [
    isProfileLoaded,
    profileDisplayName,
    user?.user_metadata?.name,
    user?.email,
  ]);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* ユーザーアバターボタン */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
        className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-medium text-xs md:text-sm flex-shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-400"
        style={{ backgroundColor: "#FF8C42" }}
        aria-label="ユーザーメニュー"
        aria-expanded={isOpen}
      >
        {initial}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
          style={{ zIndex: 9999 }}
        >
          {/* ユーザー情報セクション */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                style={{ backgroundColor: "#FF8C42" }}
              >
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* メニュー項目 */}
          <div className="py-1">
            {/* プロフィールリンク */}
            <button
              type="button"
              onClick={() => {
                router.push("/profile");
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <UserCog className="w-4 h-4 mr-3" />
              アカウント設定
            </button>
          </div>

          {/* 区切り線 */}
          <div className="border-t border-gray-200 my-1" />

          {/* ログアウトボタン */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
