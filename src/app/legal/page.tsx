import Link from "next/link";

export default function LegalPage() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", minHeight: "100%" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* パンくず */}
        <nav
          style={{
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          <Link href="/" style={{ color: "var(--color-accent)" }}>
            トップ
          </Link>
          <span style={{ margin: "0 0.4rem" }}>›</span>
          <span>利用規約・免責事項</span>
        </nav>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.8rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          利用規約・免責事項
        </h1>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            marginBottom: "2.5rem",
          }}
        >
          最終更新：2026年3月
        </p>

        <Section id="terms" title="利用規約">
          <p>
            本サービス「LexCard」（以下「本サービス」）は、HIME
            Systems（こうな姫株式会社、以下「当社」）が公共目的で無償提供する法令アクセス基盤です。すべての機能を無料・登録不要で提供しています。本規約に同意の上でご利用ください。
          </p>
          <h3>広告・データ・収益の方針</h3>
          <p>
            本サービスは広告を掲載しません。また、個人情報および利用データを第三者に販売しません。本事業の収入は寄付およびプロジェクト支援協力金に限り、サーバー・開発環境・セキュリティ等の維持改善に再投資します。
          </p>
          <h3>禁止事項</h3>
          <ul>
            <li>虚偽の情報や誤解を招くパッチの投稿</li>
            <li>他者の著作権・知的財産権を侵害する行為</li>
            <li>サービスの運営を妨害する行為</li>
            <li>法令に違反する行為</li>
          </ul>
          <h3>投稿コンテンツ</h3>
          <p>
            ユーザーが投稿したパッチ・コメント等のコンテンツについて、投稿者が著作権を保持します。ただし、本サービスは当該コンテンツをサービス提供・改善目的で利用できるものとします。
          </p>
        </Section>

        <Section id="disclaimer" title="免責事項">
          <p>
            本サービスが提供する情報は、法令改正に関する議論・研究目的のものであり、
            <strong>法的助言・法律相談ではありません</strong>
            。具体的な法的判断が必要な場合は、弁護士等の専門家にご相談ください。
          </p>
          <p>本サービスは、以下の事項について一切の責任を負いません：</p>
          <ul>
            <li>法令データの正確性・最新性（出典：e-Gov法令検索）</li>
            <li>ユーザーが投稿したパッチ・改正案の内容</li>
            <li>本サービスの利用により生じた損害</li>
            <li>サービスの停止・変更・終了</li>
          </ul>
        </Section>

        <Section id="privacy" title="プライバシーポリシー">
          <h3>収集する情報</h3>
          <p>本サービスのメンバー登録・利用において、以下の情報を収集します：</p>
          <ul>
            <li>
              <strong>氏名（表示名）</strong>：プロフィール表示・投稿者名として使用
            </li>
            <li>
              <strong>所属組織名</strong>（任意）：プロフィール表示に使用
            </li>
            <li>
              <strong>パスワード</strong>：bcrypt
              によるハッシュ化の上、データベースに保存（平文では保存しません）
            </li>
            <li>
              <strong>投稿コンテンツ</strong>：改正提案、逐条解説、コメント、プロジェクト情報等
            </li>
          </ul>

          <h3>利用目的</h3>
          <ul>
            <li>ユーザー認証およびアカウント管理</li>
            <li>投稿コンテンツの公開・共有</li>
            <li>サービスの改善・運営</li>
          </ul>

          <h3>データの保存</h3>
          <p>
            データは Supabase（PostgreSQL）に保存され、Cloudflare Workers
            を通じて配信されます。サーバーは日本国外に所在する場合があります。
          </p>

          <h3>Cookie・ローカルストレージ</h3>
          <p>本サービスでは以下の目的でブラウザのローカルストレージを使用します：</p>
          <ul>
            <li>ログインセッションの維持</li>
            <li>条文メモの保存（端末内のみ）</li>
            <li>閲覧履歴・フォロー情報の保存</li>
            <li>表示設定（フォント、テーマ等）</li>
          </ul>

          <h3>第三者提供</h3>
          <p>
            収集した個人情報を、法令に基づく場合を除き第三者に提供することはありません。また、当社は個人情報および利用データを第三者に販売しません。
          </p>

          <h3>データの削除</h3>
          <p>
            アカウントの削除および個人データの削除を希望される場合は、
            <Link href="/contact" style={{ color: "var(--color-accent)" }}>
              お問い合わせ
            </Link>
            よりご連絡ください。
          </p>

          <h3>アクセスログ</h3>
          <p>
            Cloudflare のインフラを通じてアクセスログが記録される場合があります。詳細は
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)" }}
            >
              Cloudflare プライバシーポリシー
            </a>
            をご参照ください。
          </p>
        </Section>

        <Section id="law-data" title="法令データについて">
          <p>
            本サービスが表示する法令データは、
            <a
              href="https://laws.e-gov.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)" }}
            >
              e-Gov法令検索（デジタル庁）
            </a>
            のAPIを利用して取得しています。原典の著作権は各法令の著作権者に帰属します。
          </p>
          <p>パッチ（改正案）は原典を変更するものではなく、差分として独立して保存されます。</p>
        </Section>

        <div
          style={{
            marginTop: "2.5rem",
            padding: "1rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", margin: 0 }}>
            ご不明な点は{" "}
            <Link href="/contact" style={{ color: "var(--color-accent)" }}>
              お問い合わせ
            </Link>{" "}
            ください。
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: "2.5rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.2rem",
          color: "var(--color-text-primary)",
          borderBottom: "2px solid var(--color-accent)",
          paddingBottom: "0.4rem",
          marginBottom: "1rem",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.9rem",
          lineHeight: 1.9,
          color: "var(--color-text-primary)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
