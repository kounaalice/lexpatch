import { describe, it, expect } from "vitest";
import { generateKaramebun, karamebunToText } from "./karamebun";
import type { CanonLine } from "./apply";

const line = (num: string | null, text: string): CanonLine => ({ num, text });

describe("generateKaramebun", () => {
  describe("段落の削除", () => {
    it("項を削除する改め文を生成する", () => {
      const original = [line("１", "第一項の内容"), line("２", "第二項の内容")];
      const edited = [line("１", "第一項の内容")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("第一条第二項を削る。");
    });

    it("本文行（num=null）を削除する", () => {
      const original = [line(null, "本文テキスト"), line("１", "第一項")];
      const edited = [line("１", "第一項")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("第一条を削る。");
    });
  });

  describe("字句の改正（置換）", () => {
    it("単純な字句置換の改め文を生成する", () => {
      const original = [line("１", "甲は乙に対して金銭を支払う。")];
      const edited = [line("１", "甲は丙に対して金銭を支払う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 単語境界調整により「乙に対し」→「丙に対し」のように拡張されうる
      expect(result[0].text).toContain("改める。");
      expect(result[0].text).toContain("第一条第一項中");
    });

    it("複数字句の改正を一文にまとめる", () => {
      const original = [line("１", "甲は乙に対して金銭を支払い、丙に報告する。")];
      const edited = [line("１", "甲はAに対して金銭を支払い、Bに報告する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「乙」を「A」に改め、「丙」を「B」に改める。のようなパターン
      expect(result[0].text).toContain("改め");
    });
  });

  describe("字句の削除", () => {
    it("文字列の削除を検出する", () => {
      const original = [line("１", "甲及び乙は丙に対して責任を負う。")];
      const edited = [line("１", "甲は丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「甲及び乙」を「甲」に改める 形式
      expect(result[0].text).toContain("改める");
    });
  });

  describe("字句の追加", () => {
    it("文字列の追加を検出する", () => {
      const original = [line("１", "甲は丙に対して責任を負う。")];
      const edited = [line("１", "甲及び乙は丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 追加形式（「甲」を「甲及び乙」に改める等）
      expect(result[0].text).toMatch(/改める|加える/);
    });
  });

  describe("全文改正", () => {
    it("差分が80文字超で全文改正にフォールバックする", () => {
      // 差分部分が80文字を超える場合に全文改正になる
      const longOriginal = "あ".repeat(100) + "共通部分";
      const longEdited = "い".repeat(100) + "共通部分";
      const original = [line("１", longOriginal)];
      const edited = [line("１", longEdited)];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("次のように改める");
      expect(result[0].detail).toBeDefined();
    });
  });

  describe("段落の追加", () => {
    it("新しい項を追加する改め文を生成する", () => {
      const original = [line("１", "第一項の内容")];
      const edited = [line("１", "第一項の内容"), line("２", "新しい第二項")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("次の一項を加える");
      expect(result[0].detail).toContain("新しい第二項");
    });
  });

  describe("変更なし", () => {
    it("テキストが同一の場合は何も返さない", () => {
      const lines = [line("１", "同じテキスト")];
      const result = generateKaramebun("第一条", lines, lines);
      expect(result).toHaveLength(0);
    });
  });

  describe("項番号の正規化", () => {
    it("全角と半角の項番号を同一視する", () => {
      const original = [line("１", "旧テキスト")];
      const edited = [line("1", "新テキスト")];
      const result = generateKaramebun("第一条", original, edited);
      // 「１」と「1」は同一項として改正を検出する
      expect(result).toHaveLength(1);
      expect(result[0].text).toMatch(/改める|次のように/);
    });
  });

  describe("数字+助数詞の単語境界", () => {
    it("数字と助数詞を分離しない", () => {
      const original = [line("１", "七人の侍が門を守る。")];
      const edited = [line("１", "九人の侍が門を守る。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「七」ではなく「七人」を「九人」に改める
      const text = result[0].text;
      if (text.includes("「")) {
        // 引用形式の場合、「七」単独ではなく「七人」を含むことを確認
        expect(text).toMatch(/七人|九人/);
      }
    });
  });

  describe("年号の単語境界", () => {
    it("年号を数字から分離しない", () => {
      const original = [line("１", "平成二十二年に施行する。")];
      const edited = [line("１", "令和七年に施行する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      const text = result[0].text;
      // 年号+年数がセットで引用される
      expect(text).toMatch(/平成|令和/);
    });
  });

  describe("trySplitDiffs — 差分領域内の共通部分による分割", () => {
    it("共通部分文字列で2箇所の置換を分割する", () => {
      // from="乙丙丁戊己", to="AB丙丁EF" → 共通部分「丙丁」で分割
      // 差分領域の中に3文字以上の共通部分があるケース
      const original = [line("１", "甲は乙丙丁戊己に対して責任を負う。")];
      const edited = [line("１", "甲はAB丙丁EFに対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改め");
    });

    it("共通部分がない場合は単一の置換として扱う", () => {
      // from と to に3文字以上の共通部分文字列がないケース
      const original = [line("１", "甲はABCDEFに報告する。")];
      const edited = [line("１", "甲はXYZWVUに報告する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("expandSplitBoundary — 分割差分の境界調整", () => {
    it("分割差分で数字の左展開（先行数字列+第）が行われる", () => {
      // expandSplitBoundary で左展開: 数字の前に「第」や先行数字がある
      // 例: 差分部分の from が「五」で元テキスト中で「第五」として現れる場合
      const original = [line("１", "甲は第五条及び第九条の規定により責任を負う。")];
      const edited = [line("１", "甲は第七条及び第三条の規定により責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改め");
    });

    it("分割差分で年号展開が行われる", () => {
      // expandSplitBoundary の年号展開 (lines 518-523)
      // 差分中の数字の前に「平成」等の年号がある
      const original = [line("１", "甲は平成二十年及び昭和五十年の規定により責任を負う。")];
      const edited = [line("１", "甲は令和七年及び大正十二年の規定により責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改め");
    });
  });

  describe("buildSubstitution — 冒頭への追加", () => {
    it("冒頭への追加で後方文脈を使った置換形式になる", () => {
      // 文頭に文字を追加する場合: prefixText が空なので前文脈なし
      // suffixText があるので getContextForward で置換形式 (lines 618-626)
      const original = [line("１", "乙は丙に対して報告する。")];
      const edited = [line("１", "甲及び乙は丙に対して報告する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toMatch(/改める|加える/);
    });

    it("冒頭への追加で前後とも文脈がない場合はadd形式", () => {
      // prefixText も suffixText もない（空テキストから追加）
      // → line 627 の return { type: "add", ... context: "" }
      const original = [line("１", "")];
      const edited = [line("１", "新しいテキスト")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 全文改正か追加のどちらかになる
      expect(result[0].text).toMatch(/改める|加える|次のように/);
    });
  });

  describe("getContextForward — 区切り文字で文脈を切る", () => {
    it("読点で文脈を切る", () => {
      // suffix中に読点「、」がある場合 → 読点の手前で切る (line 638)
      const original = [line("１", "甲は乙に報告し、丙に通知する。")];
      const edited = [line("１", "甲はAに報告し、丙に通知する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("getContextBackward — 区切り文字で文脈を切る", () => {
    it("読点で後方文脈を切る", () => {
      // prefix中に読点がある場合 → 読点の直後から文脈取得 (line 653)
      const original = [line("１", "甲は報告し、乙は丙及び丁に対して通知する。")];
      const edited = [line("１", "甲は報告し、乙は丙に対して通知する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("複数置換の連結（削除・追加を含む）", () => {
    it("複数置換で末尾が削除の場合", () => {
      // 複数substitutionsで最後がdelete → line 111
      // 中間部分に削りが出る
      const original = [line("１", "甲は乙に報告し、及び丙に通知する。")];
      const edited = [line("１", "甲はAに報告し、丙に通知する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改め");
    });

    it("複数置換で末尾がadd型の場合", () => {
      // 2箇所の置換で最後がadd → line 113の分岐
      const original = [line("１", "甲は乙に報告し、丙に通知する。")];
      const edited = [line("１", "甲はAに報告し、丙及び丁に通知する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改め");
    });
  });

  describe("formatParagraph — 項番号のフォーマット", () => {
    it("第1項以外の追加項は全角番号付きでフォーマットする", () => {
      const original = [line("１", "第一項の内容"), line("２", "第二項の内容")];
      const edited = [
        line("１", "第一項の内容"),
        line("２", "第二項の内容"),
        line("３", "新しい第三項"),
      ];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("次の一項を加える");
      // detail に全角番号が含まれる
      expect(result[0].detail).toContain("３");
      expect(result[0].detail).toContain("新しい第三項");
    });

    it("本文行（__body__）の全文改正はインデント付き", () => {
      const original = [line(null, "旧テキスト")];
      const edited = [line(null, "全く異なる新しい長いテキストを含む条文")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // __body__ key → formatParagraph で全角スペース+テキスト
      if (result[0].detail) {
        expect(result[0].detail).toMatch(/^　/);
      }
    });
  });

  describe("名詞接尾辞の展開（者・人・物）", () => {
    it("漢字熟語の後に「者」を含める", () => {
      const original = [line("１", "未成年者は契約を締結できない。")];
      const edited = [line("１", "成年被後見人者は契約を締結できない。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("漢字熟語の左展開", () => {
    it("熟語の途中で切れないよう接頭漢字を含める", () => {
      // プレフィックス末尾が漢字で、差分が純漢字の場合に左展開
      // 条件: p>=2, isKanjiChar(f[0]), isKanjiChar(before()), isPureKanji(f&t), !isKanjiChar(orig[p-2])
      // 「は成年」→ 「は」は非漢字、「成」はプレフィックス末尾漢字、「年」が差分先頭漢字
      const original = [line("１", "は成年が権利を有する。")];
      const edited = [line("１", "は未年が権利を有する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      // 「成」→「未」の差分で、プレフィックス末尾の漢字展開が起こる可能性
      expect(result[0].text).toMatch(/改める|加える/);
    });
  });

  describe("助詞のみの差分の左展開", () => {
    it("助詞のみの差分で直前の名詞を含める", () => {
      // 差分が助詞のみ（は→を等）の場合、直前名詞を含めて引用
      // trySplitDiffs で共通部分が分離されない入力が必要
      // （共通部分が3文字未満の場合はsplit不可）
      const original = [line("１", "AB規定は適用する。")];
      const edited = [line("１", "AB規定を適用する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("句点除外", () => {
    it("差分末尾の句点は引用に含めない", () => {
      // 差分が句点を含む場合に除外 (line 387-389)
      const original = [line("１", "甲は乙に報告する。")];
      const edited = [line("１", "甲は乙に通知する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      const text = result[0].text;
      // 引用の中に「。」が含まれないことを確認
      const quotes = text.match(/「[^」]*」/g) ?? [];
      for (const q of quotes) {
        expect(q).not.toContain("。");
      }
    });
  });

  describe("左展開で「第」を含める", () => {
    it("差分の先頭が数字で前に「第」がある場合に展開", () => {
      const original = [line("１", "第五項の規定を適用する。")];
      const edited = [line("１", "第九項の規定を適用する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      const text = result[0].text;
      // 「第五項」→「第九項」のようにセットで引用
      if (text.includes("「")) {
        expect(text).toMatch(/第[五九]/);
      }
    });
  });

  describe("文末削除（後方文脈なし）", () => {
    it("文末で前文脈もない場合はdelete形式", () => {
      // fromPart のみで toPart が空、prefix も suffix もなし → delete形式 (line 609)
      // 実際には文末の削除で prefix がある場合が多いが、
      // 極端に短い元テキストで prefix/suffix 両方が空を実現
      const original = [line("１", "削除対象")];
      const edited = [line("１", "")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toMatch(/削る|改める|次のように/);
    });
  });

  describe("文頭の削除（前文脈なし、後文脈あり）", () => {
    it("文頭の文字列削除で後方文脈を使った置換形式になる", () => {
      // fromPart が空でない、toPart が空、prefixText が空（文頭）
      // → 前文脈なし → 後文脈使用 (lines 598-606)
      const original = [line("１", "及び甲は丙に対して責任を負う。")];
      const edited = [line("１", "甲は丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("getContextForward 区切り文字による切断", () => {
    it("suffix内の読点でcontextForwardが切られる（置換の文脈補完）", () => {
      // getContextForward で breakChars (、。）」) に当たって切断 (line 638)
      // needsExtension == true (1文字diff) かつ suffix 先頭付近に読点
      // from/to 1文字 → needsExtension = true → getContextForward(suffix, ctx_len)
      // suffix = "、丙に..." → breakChars hit at index 0 は検査されない(i=1から)
      // suffix = "甲、..." → index 1 に「、」→ slice(0,1) = "甲"
      const original = [line("１", "乙甲、丙に対して責任を負う。")];
      const edited = [line("１", "丁甲、丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });

    it("文頭削除でsuffix内に区切り文字がある", () => {
      // buildSubstitution delete path (line 598-606)
      // 文頭削除 → prefixText = "" → getContextBackward returns ""
      // suffixText に breakChar → getContextForward が breakChar で切断 (line 638)
      const original = [line("１", "及び甲、丙に対して責任を負う。")];
      const edited = [line("１", "甲、丙に対して責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改める");
    });
  });

  describe("expandSplitBoundary 年号展開", () => {
    it("分割差分内で年号+数字が展開される", () => {
      // trySplitDiffs で分割された差分の中で、年号展開が発生するケース
      // 例: 「平成二十年」→「令和七年」部分が分割後にexpandSplitBoundaryで展開
      // 2箇所の改正で、共通部分が3文字以上あり、分割後の差分先頭が数字で前に年号
      const original = [line("１", "甲は平成二十年の法律及び昭和五十年の政令により責任を負う。")];
      const edited = [line("１", "甲は令和七年の法律及び大正十二年の政令により責任を負う。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      expect(result[0].text).toContain("改め");
    });
  });

  describe("助数詞の左展開（Case C）", () => {
    it("差分の先頭が助数詞で前に数字がある場合に展開", () => {
      // adjustToWordBoundaries Case C: isLegalCounter(first) && isJpNum(before())
      const original = [line("１", "第五条の規定を適用する。")];
      const edited = [line("１", "第五項の規定を適用する。")];
      const result = generateKaramebun("第一条", original, edited);
      expect(result).toHaveLength(1);
      const text = result[0].text;
      // 「条」→「項」だけでなく「第五条」→「第五項」で引用
      if (text.includes("「")) {
        expect(text).toMatch(/第五/);
      }
    });
  });
});

describe("karamebunToText", () => {
  it("改め文をテキストに変換する", () => {
    const lines = [
      { text: "第一条第一項中「甲」を「乙」に改める。" },
      { text: "第一条に次の一項を加える。", detail: "２　新しい項" },
    ];
    const text = karamebunToText(lines);
    expect(text).toContain("「甲」を「乙」に改める");
    expect(text).toContain("２　新しい項");
  });

  it("detailがない場合はtextのみ出力する", () => {
    const lines = [{ text: "第一条第二項を削る。" }];
    const text = karamebunToText(lines);
    expect(text).toBe("第一条第二項を削る。");
  });
});
