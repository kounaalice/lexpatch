import type { Item, Subitem } from "@/lib/egov/types";

/**
 * 号(Item)・号細分(Subitem) を字下げ付きで描画する共有コンポーネント
 * LawTextPreview, LawTextSearch, ArticlePatchView で使用
 *
 * @param items     - Paragraph.items
 * @param renderText - テキスト描画関数（リンク化やハイライト注入用）
 * @param fontSize   - フォントサイズ（呼び出し元の設定に合わせる）
 */
export function ItemRenderer({
  items,
  renderText,
  fontSize = "inherit",
}: {
  items: Item[];
  renderText?: (text: string) => React.ReactNode;
  fontSize?: string;
}) {
  const render = renderText ?? ((t: string) => t);

  return (
    <>
      {items.map((item, i) => (
        <div key={i}>
          {/* 号（indent 1） */}
          <div style={{ paddingLeft: "2em", margin: "0.05rem 0", fontSize, lineHeight: "inherit" }}>
            <span style={{ fontWeight: 600, marginRight: "0.3em" }}>{item.title}</span>
            {render(item.sentences.join(""))}
          </div>
          {/* 号細分 Subitem1 */}
          {item.subitems && (
            <SubitemList
              subitems={item.subitems}
              depth={2}
              renderText={render}
              fontSize={fontSize}
            />
          )}
        </div>
      ))}
    </>
  );
}

/** 再帰的に Subitem を描画 */
function SubitemList({
  subitems,
  depth,
  renderText,
  fontSize,
}: {
  subitems: Subitem[];
  depth: number;
  renderText: (text: string) => React.ReactNode;
  fontSize: string;
}) {
  return (
    <>
      {subitems.map((sub, i) => (
        <div key={i}>
          <div
            style={{
              paddingLeft: `${depth * 2}em`,
              margin: "0.05rem 0",
              fontSize,
              lineHeight: "inherit",
            }}
          >
            <span style={{ fontWeight: 600, marginRight: "0.3em" }}>{sub.title}</span>
            {renderText(sub.sentences.join(""))}
          </div>
          {sub.subitems && (
            <SubitemList
              subitems={sub.subitems}
              depth={depth + 1}
              renderText={renderText}
              fontSize={fontSize}
            />
          )}
        </div>
      ))}
    </>
  );
}
