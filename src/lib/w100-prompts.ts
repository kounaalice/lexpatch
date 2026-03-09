/**
 * W100知識分類法 — AIプロンプトテンプレート
 */

const W100_PERSONA = `あなたはW100知識分類法の専門家アシスタントです。
W100は100分野(CC)×100主題(TT)×10観点(AA)×100細分(UU)の4次元座標で知識を分類する体系です。

ルール：
1. 回答にはW100コード（例: W27.40.04.15）を明示してください
2. CCは分野（00-99）、TTは主題（00-99）、AAは観点（0-9）、UUは細分（00-99）
3. 分野間の関連・横断を積極的に示してください
4. 日本語で簡潔に回答してください`;

/** テキスト → W100座標分類 */
export function classifyPrompt(text: string): string {
  return `${W100_PERSONA}

以下のテキストを読み、W100知識分類法で最も適切な座標を3つ提案してください。

各提案について：
- W100コード（CC.TT 形式以上）
- 分類理由（1-2文）
- 関連する隣接分野（CC番号と名前）

---
${text.slice(0, 2000)}
---

回答形式：
1. **W[CC].[TT]** — [分野名] × [主題名]
   理由：...
   隣接：CC[番号] [名前]`;
}

/** 座標の解説 */
export function explainPrompt(coordinate: string): string {
  return `${W100_PERSONA}

W100コード「${coordinate}」について、以下を解説してください：

1. この座標が示す知識領域の概要（2-3文）
2. どのような研究・実務で使われるか（具体例2-3個）
3. 関連するW100座標（2-3個、コードと名前）
4. この分野を学ぶための入門的な切り口`;
}

/** 2座標間のナレッジパス */
export function pathPrompt(from: string, to: string): string {
  return `${W100_PERSONA}

W100コード「${from}」から「${to}」への知識パス（学習・研究の道筋）を示してください。

1. 出発点の概要
2. 目的地の概要
3. 中間の経由ポイント（W100コード付き、3-5ステップ）
4. なぜこの経路が自然な知識の流れになるかの説明`;
}

/** セマンティック検索結果の要約 */
export function w100SearchPrompt(
  results: { fieldName: string; topicName: string; code: string; description: string }[],
): string {
  const contextBlocks = results
    .map(
      (r, i) =>
        `--- 結果 ${i + 1} ---\nW${r.code}: ${r.fieldName} / ${r.topicName}\n${r.description}`,
    )
    .join("\n\n");

  return `${W100_PERSONA}

以下はユーザーの質問に関連するW100分野・主題です（セマンティック検索により選出）。
これらを参照して質問に回答してください。

${contextBlocks}

---
※関連する分野が提供されていない場合は、W100分類表の知識に基づいて回答してください。`;
}
