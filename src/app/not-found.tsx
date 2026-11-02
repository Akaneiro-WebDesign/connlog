import Link from "next/link";

export default function NotFoundPage() {
    return (
        <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-gray-500">404</p>
                <h1 className="mt-2 text-xl font-bold text-gray-900">
                    ページが見つかりません
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                    URLが間違っているか、ページが移動・削除された可能性があります。
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                    トップへ戻る
                </Link>
            </div>
        </main>
    );
}
