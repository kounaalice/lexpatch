import Link from "next/link";

export function Header() {
  return (
    <header
      style={{
        backgroundColor: "var(--color-header-bg)",
        color: "var(--color-gold)",
        fontFamily: "var(--font-sans)",
      }}
      className="w-full px-6 py-3 flex items-center gap-3"
    >
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--color-gold)" }}
        >
          LexPatch
        </span>
        <span
          className="text-sm hidden sm:inline"
          style={{ color: "#6B8F5E" }}
        >
          /
        </span>
        <span
          className="text-sm hidden sm:inline"
          style={{ color: "#6B8F5E", fontFamily: "var(--font-serif)" }}
        >
          逐条パッチ記法
        </span>
      </Link>
    </header>
  );
}
