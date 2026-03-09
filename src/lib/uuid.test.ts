import { describe, it, expect } from "vitest";
import { uuid } from "./uuid";

describe("uuid", () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it("UUID v4形式の文字列を返す", () => {
    const id = uuid();
    expect(id).toMatch(UUID_V4_RE);
  });

  it("バージョンビットが4である", () => {
    const id = uuid();
    expect(id[14]).toBe("4");
  });

  it("バリアントビットが8-bの範囲", () => {
    const id = uuid();
    expect("89ab").toContain(id[19]);
  });

  it("ユニークな値を生成する", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(uuid());
    }
    expect(ids.size).toBe(100);
  });

  it("36文字（ハイフン含む）の長さ", () => {
    expect(uuid()).toHaveLength(36);
  });
});
