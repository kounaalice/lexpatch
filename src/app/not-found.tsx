import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <h2 className="text-6xl font-bold text-[var(--accent)] mb-4">404</h2>
        <p className="text-lg text-[var(--text-primary)] mb-2">ページが見つかりません</p>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          お探しのページは移動または削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-[var(--accent)] text-white rounded-lg px-6 py-2.5 text-sm no-underline hover:opacity-90"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
