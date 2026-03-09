import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  needsRehash,
  generateSessionToken,
  verifySessionToken,
  getTokenTimestamp,
  generateOneTimeToken,
  verifyOneTimeToken,
} from "./crypto";

describe("hashPassword", () => {
  it("PBKDF2フォーマットのハッシュを生成する", async () => {
    const hash = await hashPassword("testpassword");
    expect(hash).toMatch(/^pbkdf2:\d+:[a-f0-9]+:[a-f0-9]+$/);
  });

  it("100000回のイテレーションを使用する", async () => {
    const hash = await hashPassword("test");
    const iterations = hash.split(":")[1];
    expect(iterations).toBe("100000");
  });

  it("同じパスワードでも異なるハッシュを生成する（ランダムsalt）", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("正しいパスワードでPBKDF2ハッシュを検証できる", async () => {
    const hash = await hashPassword("correctpassword");
    expect(await verifyPassword("correctpassword", hash)).toBe(true);
  });

  it("間違ったパスワードを拒否する", async () => {
    const hash = await hashPassword("correctpassword");
    expect(await verifyPassword("wrongpassword", hash)).toBe(false);
  });

  it("レガシーSHA-256フォーマットを検証できる", async () => {
    // Legacy format: salt:SHA256(salt+password)
    const salt = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const password = "legacypass";
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const stored = `${salt}:${hex}`;

    expect(await verifyPassword(password, stored)).toBe(true);
    expect(await verifyPassword("wrong", stored)).toBe(false);
  });

  it("不正なフォーマットを拒否する", async () => {
    expect(await verifyPassword("test", "invalidformat")).toBe(false);
    expect(await verifyPassword("test", "pbkdf2:bad")).toBe(false);
    expect(await verifyPassword("test", "pbkdf2:nan:salt:hash")).toBe(false);
  });
});

describe("needsRehash", () => {
  it("レガシーフォーマットはリハッシュが必要", () => {
    expect(needsRehash("uuid-salt:sha256hex")).toBe(true);
  });

  it("PBKDF2フォーマットはリハッシュ不要", () => {
    expect(needsRehash("pbkdf2:100000:salt:hash")).toBe(false);
  });
});

describe("generateSessionToken / verifySessionToken", () => {
  it("有効なトークンを生成・検証できる", async () => {
    const memberId = "test-member-123";
    const token = await generateSessionToken(memberId);

    // Format: nonce:timestamp:hash
    const parts = token.split(":");
    expect(parts).toHaveLength(3);

    // Verify
    expect(await verifySessionToken(memberId, token)).toBe(true);
  });

  it("別のmemberIdでは検証に失敗する", async () => {
    const token = await generateSessionToken("member-a");
    expect(await verifySessionToken("member-b", token)).toBe(false);
  });

  it("改ざんされたトークンを拒否する", async () => {
    const token = await generateSessionToken("member");
    const tampered = token.slice(0, -4) + "xxxx";
    expect(await verifySessionToken("member", tampered)).toBe(false);
  });
});

describe("getTokenTimestamp", () => {
  it("新フォーマットトークンからタイムスタンプを抽出する", async () => {
    const before = Date.now();
    const token = await generateSessionToken("member");
    const after = Date.now();
    const ts = getTokenTimestamp(token);
    expect(ts).not.toBeNull();
    expect(ts!).toBeGreaterThanOrEqual(before);
    expect(ts!).toBeLessThanOrEqual(after);
  });

  it("レガシーフォーマットにはnullを返す", () => {
    expect(getTokenTimestamp("plainhashabc123")).toBeNull();
  });
});

describe("generateOneTimeToken / verifyOneTimeToken", () => {
  it("ワンタイムトークンを生成・検証できる", async () => {
    const { raw, hashed } = await generateOneTimeToken();
    expect(raw.length).toBeGreaterThan(20);
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(await verifyOneTimeToken(raw, hashed)).toBe(true);
  });

  it("異なるrawでは検証に失敗する", async () => {
    const { hashed } = await generateOneTimeToken();
    expect(await verifyOneTimeToken("wrong-raw-token", hashed)).toBe(false);
  });
});
