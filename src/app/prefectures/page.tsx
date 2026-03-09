import Link from "next/link";

interface Prefecture {
  name: string;
  reikiUrl: string; // 例規集URL（直接リンク）
  topUrl: string; // 都道府県トップページ（フォールバック用）
}

interface Region {
  label: string;
  prefectures: Prefecture[];
}

const REGIONS: Region[] = [
  {
    label: "北海道・東北",
    prefectures: [
      {
        name: "北海道",
        reikiUrl: "https://www.pref.hokkaido.lg.jp/sm/bkk/reiki-top.html",
        topUrl: "https://www.pref.hokkaido.lg.jp/",
      },
      {
        name: "青森県",
        reikiUrl: "https://www.pref.aomori.lg.jp/",
        topUrl: "https://www.pref.aomori.lg.jp/",
      },
      {
        name: "岩手県",
        reikiUrl: "https://www.pref.iwate.jp/",
        topUrl: "https://www.pref.iwate.jp/",
      },
      {
        name: "宮城県",
        reikiUrl: "https://www.pref.miyagi.jp/",
        topUrl: "https://www.pref.miyagi.jp/",
      },
      {
        name: "秋田県",
        reikiUrl: "https://www.pref.akita.lg.jp/",
        topUrl: "https://www.pref.akita.lg.jp/",
      },
      {
        name: "山形県",
        reikiUrl: "https://www.pref.yamagata.jp/",
        topUrl: "https://www.pref.yamagata.jp/",
      },
      {
        name: "福島県",
        reikiUrl: "https://www.pref.fukushima.lg.jp/",
        topUrl: "https://www.pref.fukushima.lg.jp/",
      },
    ],
  },
  {
    label: "関東",
    prefectures: [
      {
        name: "茨城県",
        reikiUrl: "https://www.pref.ibaraki.jp/",
        topUrl: "https://www.pref.ibaraki.jp/",
      },
      {
        name: "栃木県",
        reikiUrl: "https://www.pref.tochigi.lg.jp/",
        topUrl: "https://www.pref.tochigi.lg.jp/",
      },
      {
        name: "群馬県",
        reikiUrl: "https://www.pref.gunma.jp/",
        topUrl: "https://www.pref.gunma.jp/",
      },
      {
        name: "埼玉県",
        reikiUrl: "https://www.pref.saitama.lg.jp/",
        topUrl: "https://www.pref.saitama.lg.jp/",
      },
      {
        name: "千葉県",
        reikiUrl: "https://www.pref.chiba.lg.jp/",
        topUrl: "https://www.pref.chiba.lg.jp/",
      },
      {
        name: "東京都",
        reikiUrl: "https://www.reiki.metro.tokyo.lg.jp/",
        topUrl: "https://www.metro.tokyo.lg.jp/",
      },
      {
        name: "神奈川県",
        reikiUrl: "https://www.pref.kanagawa.jp/",
        topUrl: "https://www.pref.kanagawa.jp/",
      },
    ],
  },
  {
    label: "中部",
    prefectures: [
      {
        name: "新潟県",
        reikiUrl: "https://www.pref.niigata.lg.jp/",
        topUrl: "https://www.pref.niigata.lg.jp/",
      },
      {
        name: "富山県",
        reikiUrl: "https://www.pref.toyama.jp/",
        topUrl: "https://www.pref.toyama.jp/",
      },
      {
        name: "石川県",
        reikiUrl: "https://www.pref.ishikawa.lg.jp/",
        topUrl: "https://www.pref.ishikawa.lg.jp/",
      },
      {
        name: "福井県",
        reikiUrl: "https://www.pref.fukui.lg.jp/",
        topUrl: "https://www.pref.fukui.lg.jp/",
      },
      {
        name: "山梨県",
        reikiUrl: "https://www.pref.yamanashi.jp/",
        topUrl: "https://www.pref.yamanashi.jp/",
      },
      {
        name: "長野県",
        reikiUrl: "https://www.pref.nagano.lg.jp/",
        topUrl: "https://www.pref.nagano.lg.jp/",
      },
      {
        name: "岐阜県",
        reikiUrl: "https://www.pref.gifu.lg.jp/",
        topUrl: "https://www.pref.gifu.lg.jp/",
      },
      {
        name: "静岡県",
        reikiUrl: "https://www.pref.shizuoka.jp/",
        topUrl: "https://www.pref.shizuoka.jp/",
      },
      {
        name: "愛知県",
        reikiUrl: "https://www.pref.aichi.jp/",
        topUrl: "https://www.pref.aichi.jp/",
      },
      {
        name: "三重県",
        reikiUrl: "https://www.pref.mie.lg.jp/",
        topUrl: "https://www.pref.mie.lg.jp/",
      },
    ],
  },
  {
    label: "近畿",
    prefectures: [
      {
        name: "滋賀県",
        reikiUrl: "https://www.pref.shiga.lg.jp/",
        topUrl: "https://www.pref.shiga.lg.jp/",
      },
      {
        name: "京都府",
        reikiUrl: "https://www.pref.kyoto.jp/",
        topUrl: "https://www.pref.kyoto.jp/",
      },
      {
        name: "大阪府",
        reikiUrl: "https://www.pref.osaka.lg.jp/",
        topUrl: "https://www.pref.osaka.lg.jp/",
      },
      {
        name: "兵庫県",
        reikiUrl: "https://web.pref.hyogo.lg.jp/",
        topUrl: "https://web.pref.hyogo.lg.jp/",
      },
      {
        name: "奈良県",
        reikiUrl: "https://www.pref.nara.jp/",
        topUrl: "https://www.pref.nara.jp/",
      },
      {
        name: "和歌山県",
        reikiUrl: "https://www.pref.wakayama.lg.jp/",
        topUrl: "https://www.pref.wakayama.lg.jp/",
      },
    ],
  },
  {
    label: "中国・四国",
    prefectures: [
      {
        name: "鳥取県",
        reikiUrl: "https://www.pref.tottori.lg.jp/",
        topUrl: "https://www.pref.tottori.lg.jp/",
      },
      {
        name: "島根県",
        reikiUrl: "https://www.pref.shimane.lg.jp/",
        topUrl: "https://www.pref.shimane.lg.jp/",
      },
      {
        name: "岡山県",
        reikiUrl: "https://www.pref.okayama.jp/",
        topUrl: "https://www.pref.okayama.jp/",
      },
      {
        name: "広島県",
        reikiUrl: "https://www.pref.hiroshima.lg.jp/",
        topUrl: "https://www.pref.hiroshima.lg.jp/",
      },
      {
        name: "山口県",
        reikiUrl: "https://www.pref.yamaguchi.lg.jp/",
        topUrl: "https://www.pref.yamaguchi.lg.jp/",
      },
      {
        name: "徳島県",
        reikiUrl: "https://www.pref.tokushima.lg.jp/",
        topUrl: "https://www.pref.tokushima.lg.jp/",
      },
      {
        name: "香川県",
        reikiUrl: "https://www.pref.kagawa.lg.jp/",
        topUrl: "https://www.pref.kagawa.lg.jp/",
      },
      {
        name: "愛媛県",
        reikiUrl: "https://www.pref.ehime.jp/",
        topUrl: "https://www.pref.ehime.jp/",
      },
      {
        name: "高知県",
        reikiUrl: "https://www.pref.kochi.lg.jp/",
        topUrl: "https://www.pref.kochi.lg.jp/",
      },
    ],
  },
  {
    label: "九州・沖縄",
    prefectures: [
      {
        name: "福岡県",
        reikiUrl: "https://www.pref.fukuoka.lg.jp/",
        topUrl: "https://www.pref.fukuoka.lg.jp/",
      },
      {
        name: "佐賀県",
        reikiUrl: "https://www.pref.saga.lg.jp/",
        topUrl: "https://www.pref.saga.lg.jp/",
      },
      {
        name: "長崎県",
        reikiUrl: "https://www.pref.nagasaki.jp/",
        topUrl: "https://www.pref.nagasaki.jp/",
      },
      {
        name: "熊本県",
        reikiUrl: "https://www.pref.kumamoto.jp/",
        topUrl: "https://www.pref.kumamoto.jp/",
      },
      {
        name: "大分県",
        reikiUrl: "https://www.pref.oita.jp/",
        topUrl: "https://www.pref.oita.jp/",
      },
      {
        name: "宮崎県",
        reikiUrl: "https://www.pref.miyazaki.lg.jp/",
        topUrl: "https://www.pref.miyazaki.lg.jp/",
      },
      {
        name: "鹿児島県",
        reikiUrl: "https://www.pref.kagoshima.jp/",
        topUrl: "https://www.pref.kagoshima.jp/",
      },
      {
        name: "沖縄県",
        reikiUrl: "https://www.pref.okinawa.jp/",
        topUrl: "https://www.pref.okinawa.jp/",
      },
    ],
  },
];

export default function PrefecturesPage() {
  const totalCount = REGIONS.reduce((sum, r) => sum + r.prefectures.length, 0);

  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      {/* ヘッダー */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <nav
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              トップ
            </Link>
            <span>›</span>
            <span>都道府県条例データベース</span>
          </nav>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            都道府県条例データベース
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            全国{totalCount}
            都道府県の公式サイトへのリンク集です。各都道府県のトップページから例規集・条例データベースにアクセスできます。
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
            padding: "0.6rem 0.9rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            lineHeight: 1.6,
          }}
        >
          ※ リンク先の内容・URL
          は各都道府県の管理によるものです。本サービスは内容の正確性・最新性を保証しません。
          条例の効力・解釈については各都道府県または法律の専門家にご確認ください。
        </p>

        {/* 関連外部リソース */}
        <div
          style={{
            marginBottom: "2rem",
            padding: "1rem 1.25rem",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            関連外部リソース
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <ExtLink href="https://elaws.e-gov.go.jp/" label="e-Gov法令検索" />
            <ExtLink
              href="https://www.soumu.go.jp/denshijiti/code.html"
              label="総務省 地方公共団体コード"
            />
            <ExtLink href="https://www.j-lis.go.jp/" label="地方公共団体情報システム機構 (J-LIS)" />
          </div>
        </div>

        {/* 地域別リスト */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {REGIONS.map((region) => (
            <section key={region.label}>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  borderBottom: "2px solid var(--color-accent)",
                  paddingBottom: "0.4rem",
                  marginBottom: "0.75rem",
                }}
              >
                {region.label}
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "var(--color-text-secondary)",
                    marginLeft: "0.5rem",
                  }}
                >
                  {region.prefectures.length}件
                </span>
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {region.prefectures.map((pref) => (
                  <a
                    key={pref.name}
                    href={pref.reikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.85rem",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-primary)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <span>{pref.name}</span>
                    <span
                      style={{ fontSize: "0.65rem", color: "var(--color-accent)", opacity: 0.7 }}
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "1.5rem",
            marginTop: "2.5rem",
          }}
        >
          <Link
            href="/"
            style={{
              color: "var(--color-accent)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            ← トップへ
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.78rem",
        color: "var(--color-accent)",
        textDecoration: "none",
        border: "1px solid var(--color-accent)",
        borderRadius: "4px",
        padding: "0.2rem 0.6rem",
        whiteSpace: "nowrap",
        opacity: 0.85,
      }}
    >
      {label} ↗
    </a>
  );
}
