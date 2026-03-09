import { describe, it, expect } from "vitest";
import { textToCanonLines, canonLinesToText, autoRenumber, diffToPlainText } from "./directDiff";
import type { CanonLine } from "./apply";
import type { DiffLine } from "./types";

const line = (num: string | null, text: string): CanonLine => ({ num, text });

// ============================================================
// textToCanonLines
// ============================================================
describe("textToCanonLines", () => {
  it("空文字列で空配列を返す", () => {
    expect(textToCanonLines("")).toEqual([]);
  });

  it("空白行のみの入力で空配列を返す", () => {
    expect(textToCanonLines("   \n  \n\t\n")).toEqual([]);
  });

  it("段落番号なしの1行をnum=nullで返す", () => {
    const result = textToCanonLines(
      "　労働条件は、労働者と使用者が対等の立場において決定すべきものである。",
    );
    expect(result).toHaveLength(1);
    expect(result[0].num).toBeNull();
    expect(result[0].text).toBe(
      "労働条件は、労働者と使用者が対等の立場において決定すべきものである。",
    );
  });

  it("先頭の全角スペースを除去する", () => {
    const result = textToCanonLines("　本文テキスト");
    expect(result[0].text).toBe("本文テキスト");
    expect(result[0].num).toBeNull();
  });

  it("全角数字の段落番号を検出する", () => {
    const result = textToCanonLines("２　労働条件の決定は、労使対等の原則による。");
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("２");
    expect(result[0].text).toBe("労働条件の決定は、労使対等の原則による。");
  });

  it("半角数字の段落番号を検出する", () => {
    const result = textToCanonLines("2 テスト段落");
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("2");
    expect(result[0].text).toBe("テスト段落");
  });

  it("複数行を正しくパースする（本文+番号付き項）", () => {
    const text =
      "　労働条件は、労働者と使用者が対等の立場において決定すべきものである。\n２　労働条件の決定は、労使対等の原則による。\n３　この法律で定める基準に達しない条件は無効とする。";
    const result = textToCanonLines(text);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      num: null,
      text: "労働条件は、労働者と使用者が対等の立場において決定すべきものである。",
    });
    expect(result[1]).toEqual({ num: "２", text: "労働条件の決定は、労使対等の原則による。" });
    expect(result[2]).toEqual({
      num: "３",
      text: "この法律で定める基準に達しない条件は無効とする。",
    });
  });

  it("空行を含む入力で空行をスキップする", () => {
    const text = "　本文\n\n２　第二項\n\n";
    const result = textToCanonLines(text);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe("本文");
    expect(result[1].num).toBe("２");
  });

  it("全角タブ区切りでも段落番号を検出する", () => {
    const result = textToCanonLines("３\t第三項のテキスト");
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("３");
    expect(result[0].text).toBe("第三項のテキスト");
  });

  it("数字で始まるが区切りスペースなしの場合は番号扱いしない", () => {
    // "３条" のように数字直後にスペースなしの場合
    const result = textToCanonLines("３条の規定による");
    expect(result).toHaveLength(1);
    expect(result[0].num).toBeNull();
    expect(result[0].text).toBe("３条の規定による");
  });

  it("二桁の全角数字を段落番号として認識する", () => {
    const result = textToCanonLines("１２　十二項目のテキスト");
    expect(result).toHaveLength(1);
    expect(result[0].num).toBe("１２");
    expect(result[0].text).toBe("十二項目のテキスト");
  });
});

// ============================================================
// canonLinesToText
// ============================================================
describe("canonLinesToText", () => {
  it("空配列で空文字列を返す", () => {
    expect(canonLinesToText([])).toBe("");
  });

  it("num=nullの行は先頭に全角スペースを付加する", () => {
    const result = canonLinesToText([line(null, "本文テキスト")]);
    expect(result).toBe("　本文テキスト");
  });

  it("numありの行は全角数字+全角スペース+テキストに変換する", () => {
    const result = canonLinesToText([line("２", "第二項テキスト")]);
    expect(result).toBe("２　第二項テキスト");
  });

  it("半角数字のnumを全角数字に変換する", () => {
    const result = canonLinesToText([line("3", "第三項テキスト")]);
    expect(result).toBe("３　第三項テキスト");
  });

  it("複数行を改行で結合する", () => {
    const lines: CanonLine[] = [line(null, "本文"), line("２", "第二項"), line("３", "第三項")];
    const result = canonLinesToText(lines);
    expect(result).toBe("　本文\n２　第二項\n３　第三項");
  });

  it("textToCanonLinesとの往復変換が一致する（ラウンドトリップ）", () => {
    const original =
      "　労働条件は対等の立場で決定する。\n２　労働条件の決定は労使対等の原則による。";
    const parsed = textToCanonLines(original);
    const reconstructed = canonLinesToText(parsed);
    expect(reconstructed).toBe(original);
  });
});

// ============================================================
// autoRenumber
// ============================================================
describe("autoRenumber", () => {
  it("空配列で空配列を返す", () => {
    expect(autoRenumber([])).toEqual([]);
  });

  it("番号付き行がない場合はそのまま返す", () => {
    const input = [line(null, "本文のみ")];
    const result = autoRenumber(input);
    expect(result).toEqual(input);
  });

  it("既に連番の場合は変更しない", () => {
    const input = [line(null, "本文"), line("１", "第一項"), line("２", "第二項")];
    const result = autoRenumber(input);
    expect(result[1].num).toBe("１");
    expect(result[2].num).toBe("２");
  });

  it("欠番がある場合に振り直す（１、３→１、２）", () => {
    const input = [line(null, "本文"), line("１", "第一項"), line("３", "旧第三項")];
    const result = autoRenumber(input);
    expect(result[1].num).toBe("１");
    expect(result[2].num).toBe("２");
    expect(result[2].text).toBe("旧第三項"); // テキストは変わらない
  });

  it("重複番号がある場合に振り直す（１、２、２→１、２、３）", () => {
    const input = [
      line(null, "本文"),
      line("１", "第一項"),
      line("２", "第二項"),
      line("２", "追加項"),
    ];
    const result = autoRenumber(input);
    expect(result[1].num).toBe("１");
    expect(result[2].num).toBe("２");
    expect(result[3].num).toBe("３");
  });

  it("num=null行をスキップして番号付き行だけ振り直す", () => {
    const input = [
      line(null, "条名"),
      line("５", "第一項"),
      line(null, "注釈行"),
      line("８", "第二項"),
    ];
    const result = autoRenumber(input);
    expect(result[0].num).toBeNull();
    expect(result[1].num).toBe("１");
    expect(result[2].num).toBeNull();
    expect(result[3].num).toBe("２");
  });

  it("変更不要な行は同一オブジェクト参照を返す", () => {
    const first = line("１", "第一項");
    const input = [first, line("２", "第二項")];
    const result = autoRenumber(input);
    // "１" は既に正しいので同一参照
    expect(result[0]).toBe(first);
  });

  it("変更がある行は新しいオブジェクトを返す（イミュータブル）", () => {
    const second = line("５", "旧第五項");
    const input = [line("１", "第一項"), second];
    const result = autoRenumber(input);
    expect(result[1]).not.toBe(second);
    expect(result[1].num).toBe("２");
    expect(result[1].text).toBe("旧第五項");
  });

  it("半角数字の番号も全角で振り直す", () => {
    const input = [line("1", "第一項"), line("5", "第二項")];
    const result = autoRenumber(input);
    expect(result[0].num).toBe("１");
    expect(result[1].num).toBe("２");
  });
});

// ============================================================
// diffToPlainText
// ============================================================
describe("diffToPlainText", () => {
  it("空のdiffLinesで条名のみを返す", () => {
    const result = diffToPlainText("第一条", []);
    expect(result).toBe("第一条");
  });

  it("eq行は先頭スペースで出力する", () => {
    const diffLines: DiffLine[] = [{ op: "eq", num: null, text: "本文テキスト" }];
    const result = diffToPlainText("第一条", diffLines);
    expect(result).toBe("第一条\n 　本文テキスト");
  });

  it("add行は先頭+で出力する", () => {
    const diffLines: DiffLine[] = [{ op: "add", num: "２", text: "追加テキスト" }];
    const result = diffToPlainText("第一条", diffLines);
    expect(result).toBe("第一条\n+２　追加テキスト");
  });

  it("del行は先頭-で出力する", () => {
    const diffLines: DiffLine[] = [{ op: "del", num: "１", text: "削除テキスト" }];
    const result = diffToPlainText("第一条", diffLines);
    expect(result).toBe("第一条\n-１　削除テキスト");
  });

  it("num=nullの行はスペース+全角スペース+テキストの形式になる", () => {
    const diffLines: DiffLine[] = [{ op: "add", num: null, text: "番号なし追加" }];
    const result = diffToPlainText("第二条", diffLines);
    expect(result).toBe("第二条\n+　番号なし追加");
  });

  it("複合パターン（eq+del+add）を正しく出力する", () => {
    const diffLines: DiffLine[] = [
      { op: "eq", num: null, text: "この法律は…" },
      { op: "del", num: "２", text: "旧テキスト" },
      { op: "add", num: "２", text: "新テキスト" },
      { op: "eq", num: "３", text: "変更なし" },
    ];
    const result = diffToPlainText("第一条", diffLines);
    const lines = result.split("\n");
    expect(lines).toHaveLength(5);
    expect(lines[0]).toBe("第一条");
    expect(lines[1]).toBe(" 　この法律は…");
    expect(lines[2]).toBe("-２　旧テキスト");
    expect(lines[3]).toBe("+２　新テキスト");
    expect(lines[4]).toBe(" ３　変更なし");
  });

  it("parsePatch互換のフォーマットを生成する（条名は行頭に記号なし）", () => {
    const diffLines: DiffLine[] = [
      { op: "eq", num: null, text: "本文" },
      { op: "add", num: "２", text: "追加" },
    ];
    const result = diffToPlainText("第三条の二", diffLines);
    // 1行目は条名（記号なし）
    expect(result.startsWith("第三条の二")).toBe(true);
    // 2行目はeq行（スペース始まり）
    const secondLine = result.split("\n")[1];
    expect(secondLine.startsWith(" ")).toBe(true);
    // 3行目はadd行（+始まり）
    const thirdLine = result.split("\n")[2];
    expect(thirdLine.startsWith("+")).toBe(true);
  });
});

// ============================================================
// 統合テスト：textToCanonLines + canonLinesToText ラウンドトリップ
// ============================================================
describe("ラウンドトリップ（textToCanonLines <-> canonLinesToText）", () => {
  it("法令条文の典型パターンで往復変換が一致する", () => {
    const original = [
      "　この法律は、労働条件の最低基準を定めるものである。",
      "２　この法律で定める労働条件の基準は最低のものであるから、労働関係の当事者は、この基準を理由として労働条件を低下させてはならない。",
      "３　前項の趣旨に反する労働協約、就業規則及び労働契約は、その部分については無効とする。",
    ].join("\n");
    const parsed = textToCanonLines(original);
    const reconstructed = canonLinesToText(parsed);
    expect(reconstructed).toBe(original);
  });

  it("番号なし行のみでも往復変換が一致する", () => {
    const original = "　この法律の施行期日は、政令で定める。";
    const parsed = textToCanonLines(original);
    const reconstructed = canonLinesToText(parsed);
    expect(reconstructed).toBe(original);
  });
});

// ============================================================
// 統合テスト：autoRenumber + canonLinesToText
// ============================================================
describe("autoRenumber と canonLinesToText の統合", () => {
  it("項削除後の番号振り直しで正しいテキストを生成する", () => {
    // 第2項を削除して第1項と第3項だけ残した状態をシミュレート
    const afterDelete = [line(null, "本文"), line("１", "第一項"), line("３", "旧第三項")];
    const renumbered = autoRenumber(afterDelete);
    const text = canonLinesToText(renumbered);
    expect(text).toBe("　本文\n１　第一項\n２　旧第三項");
  });

  it("項追加後の番号振り直しで正しいテキストを生成する", () => {
    const afterInsert = [
      line(null, "本文"),
      line("１", "第一項"),
      line("１", "挿入項"),
      line("２", "旧第二項"),
    ];
    const renumbered = autoRenumber(afterInsert);
    const text = canonLinesToText(renumbered);
    expect(text).toBe("　本文\n１　第一項\n２　挿入項\n３　旧第二項");
  });
});
