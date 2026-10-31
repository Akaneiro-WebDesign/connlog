"use client";

export default function ErrorPage({
    reset,
}: {
    reset: () => void;
}) {
    return (
        <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <div role="alert">
                    <h1 className="text-xl font-bold text-gray-900">
                        画面の表示中に問題が発生しました
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        時間をおいて、もう一度お試しください。
                        保存・削除の途中だった場合は、復帰後に結果を確認してください。
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => reset()}
                    className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                    もう一度試す
                </button>
            </div>
        </main>
    );
}
