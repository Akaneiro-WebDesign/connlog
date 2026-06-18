import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | ConnLog",
  description: "ConnLogのプライバシーポリシーです。",
};

const CONTACT_EMAIL = "akaneiro.contact@gmail.com";

type PolicySection = {
  title: string;
  paragraphs?: string[];
  orderedItems?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "第1条（個人情報の定義）",
    paragraphs: [
      "本ポリシーにおいて「個人情報」とは、個人情報保護法にいう個人情報を指すものとし、生存する個人に関する情報であって、当該情報に含まれる記述等により特定の個人を識別できる情報、または他の情報と容易に照合することにより特定の個人を識別できる情報をいいます。",
    ],
  },
  {
    title: "第2条（取得する情報）",
    paragraphs: [
      "運営者は、本サービスの提供にあたり、以下の情報を取得する場合があります。",
    ],
    orderedItems: [
      "メールアドレス",
      "表示名",
      "自己紹介",
      "ユーザーが登録したイベント情報",
      "ユーザーが登録したタグ",
      "ユーザーが入力したメモ",
      "ログイン状態の管理に必要な認証情報",
      "アクセス日時、ブラウザ情報等、本サービスの利用に伴って自動的に取得される技術情報",
      "お問い合わせ時にユーザーが提供する情報",
    ],
  },
  {
    title: "第3条（利用目的）",
    paragraphs: ["運営者は、取得した情報を以下の目的で利用します。"],
    orderedItems: [
      "本サービスの提供、運営、管理のため",
      "ユーザー登録、ログイン、認証のため",
      "登録イベント、タグ、メモを保存・表示するため",
      "学習イベント参加履歴を可視化するため",
      "アカウント設定の表示、変更、削除を行うため",
      "本サービスに関する重要なお知らせ、メンテナンス情報等を連絡するため",
      "本サービスの改善、不具合調査、保守運用のため",
      "不正利用の防止、セキュリティ確保のため",
      "ユーザーからのお問い合わせに対応するため",
      "上記の利用目的に付随する目的のため",
    ],
  },
  {
    title: "第4条（外部サービスの利用）",
    paragraphs: [
      "本サービスでは、サービス提供のために以下の外部サービスを利用します。",
    ],
    orderedItems: [
      "Supabase：認証、データベース管理",
      "Vercel：アプリケーションのホスティング、デプロイ",
      "connpass API：イベント情報の取得",
    ],
  },
  {
    title: "第5条（第三者提供）",
    paragraphs: [
      "運営者は、以下の場合を除き、取得した情報を第三者に提供しません。",
    ],
    orderedItems: [
      "ユーザー本人の同意がある場合",
      "法令に基づく場合",
      "本サービスの提供に必要な範囲で外部サービスを利用する場合",
      "不正利用の防止、セキュリティ確保のために必要な場合",
      "人の生命、身体または財産の保護のために必要がある場合",
    ],
  },
  {
    title: "第6条（アカウント削除およびデータ削除）",
    paragraphs: [
      "ユーザーは、本サービスのアカウント設定画面からアカウントを削除できます。",
      "アカウント削除時には、登録イベント、タグ、メモ、プロフィール情報など、ユーザーに紐づくデータを削除します。",
      "ただし、技術上または運用上必要な範囲で、バックアップ等に一定期間情報が残る場合があります。",
      "削除されたデータは、原則として復元できません。",
    ],
  },
  {
    title: "第7条（情報の訂正・削除等）",
    paragraphs: [
      "ユーザーは、本サービス上で、自身のプロフィール情報を変更できます。",
      "また、ユーザーは、アカウント削除機能により、自身のアカウントおよび関連データの削除を行うことができます。",
      "本サービス上で対応できない情報の確認、訂正、削除等を希望する場合は、第11条のお問い合わせ窓口までご連絡ください。",
    ],
  },
  {
    title: "第8条（Cookie等の利用）",
    paragraphs: [
      "本サービスでは、ログイン状態の維持、認証処理、セキュリティ確保のため、Cookieその他これに類する技術を利用する場合があります。",
      "ユーザーはブラウザの設定によりCookieを無効にすることができますが、その場合、本サービスの一部機能を利用できなくなることがあります。",
    ],
  },
  {
    title: "第9条（安全管理）",
    paragraphs: [
      "運営者は、取得した情報について、不正アクセス、紛失、漏えい、改ざん等を防止するため、必要かつ適切な安全管理に努めます。",
      "また、本サービスでは、通信内容を保護するため、HTTPSによる通信暗号化を行います。",
    ],
  },
  {
    title: "第10条（プライバシーポリシーの変更）",
    orderedItems: [
      "運営者は、法令その他本ポリシーに別段の定めがある場合を除き、必要に応じて本ポリシーの内容を変更することができます。",
      "変更後のプライバシーポリシーは、本サービス上に掲載した時点から効力を生じるものとします。",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main>
      <header className="bg-red-600 flex justify-center items-center h-10">
        <p className="text-white text-xl font-bold">ConnLog</p>
      </header>
      <div className="flex justify-center items-center bg-gray-100 py-16">
        <h1 className="text-2xl font-bold text-gray-500 md:text-4xl">
          Privacy Policy
        </h1>
      </div>
      <div className="mx-auto max-w-3xl px-4">
        <nav aria-label="パンくずリスト" className="my-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <li>
              <Link
                href="/login"
                className="font-medium underline-offset-4 hover:text-gray-700 hover:underline"
              >
                ログイン画面
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">
              /
            </li>
            <li>
              <Link
                href="/signup"
                className="font-medium underline-offset-4 hover:text-gray-700 hover:underline"
              >
                新規登録画面
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">
              ›
            </li>
            <li aria-current="page" className="font-medium text-gray-700">
              Privacy Policy
            </li>
          </ol>
        </nav>
        <article className="bg-white">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <div className="space-y-1 text-right text-sm text-gray-500">
              <p>制定日：2026年6月18日</p>
              <p>最終更新日：2026年6月18日</p>
            </div>

            <p className="mt-6 text-sm leading-7 text-gray-700">
              ConnLog運営者（以下「運営者」といいます。）は、運営者が提供するWebサービス「ConnLog」（以下「本サービス」といいます。）における、ユーザーの個人情報を含む利用者情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
            </p>
          </div>

          <div className="space-y-8">
            {policySections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>

                <div className="mt-3 space-y-3 text-sm leading-7 text-gray-700">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {section.orderedItems ? (
                    <ol className="list-decimal space-y-2 pl-5">
                      {section.orderedItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              </section>
            ))}
            <section>
              <h2 className="text-lg font-semibold text-gray-900">
                第11条（お問い合わせ窓口）
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-gray-700">
                <p>
                  本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
                </p>
                <p>Eメールアドレス：{CONTACT_EMAIL}</p>
                <p className="pt-4 text-right">以上</p>
              </div>
            </section>
          </div>
        </article>
      </div>

      <footer className="mt-10 bg-gray-100 py-3 text-center text-gray-500">
        <small>© 2025-2026 ConnLog</small>
      </footer>
    </main>
  );
}
