"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  getAllSignatures,
  addTextSignature,
  addDrawnSignature,
  setDefault,
  deleteSignature,
  SIGNATURE_FONTS,
  type Signature,
} from "@/lib/ws-signatures";

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [mode, setMode] = useState<"list" | "text" | "draw">("list");
  const [textForm, setTextForm] = useState({
    name: "",
    textValue: "",
    fontFamily: SIGNATURE_FONTS[0],
  });
  const [drawName, setDrawName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Array<{ x: number; y: number }[]>>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  function reload() {
    setSignatures(getAllSignatures());
  }

  useEffect(() => {
    reload(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function handleCreateText() {
    if (!textForm.name.trim() || !textForm.textValue.trim()) return;
    addTextSignature(textForm);
    setTextForm({ name: "", textValue: "", fontFamily: SIGNATURE_FONTS[0] });
    setMode("list");
    reload();
  }

  function handleSaveDrawn() {
    const canvas = canvasRef.current;
    if (!canvas || !drawName.trim()) return;
    const dataUrl = canvas.toDataURL("image/png");
    addDrawnSignature({ name: drawName, dataUrl });
    setDrawName("");
    setPaths([]);
    setCurrentPath([]);
    setMode("list");
    reload();
  }

  function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    deleteSignature(id);
    reload();
  }

  function handleSetDefault(id: string) {
    setDefault(id);
    reload();
  }

  const getPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [],
  );

  const redrawCanvas = useCallback(
    (allPaths: Array<{ x: number; y: number }[]>, current: { x: number; y: number }[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#1E3A5F";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const path of [...allPaths, current]) {
        if (path.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
    },
    [],
  );

  function onPointerDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentPath([pos]);
  }

  function onPointerMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const pos = getPos(e);
    const updated = [...currentPath, pos];
    setCurrentPath(updated);
    redrawCanvas(paths, updated);
  }

  function onPointerUp() {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      const newPaths = [...paths, currentPath];
      setPaths(newPaths);
      redrawCanvas(newPaths, []);
    }
    setCurrentPath([]);
  }

  function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentPath([pos]);
  }

  function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    const updated = [...currentPath, pos];
    setCurrentPath(updated);
    redrawCanvas(paths, updated);
  }

  function clearCanvas() {
    setPaths([]);
    setCurrentPath([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>
      <nav
        style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}
      >
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Top
        </Link>{" "}
        &gt;{" "}
        <Link href="/ws" style={{ color: "var(--color-accent)" }}>
          WS
        </Link>{" "}
        &gt; 電子署名
      </nav>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, flex: 1 }}>電子署名</h1>
        {mode === "list" && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setMode("text")}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              テキスト
            </button>
            <button
              onClick={() => setMode("draw")}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              手書き
            </button>
          </div>
        )}
      </div>

      {mode === "text" && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            テキスト署名を作成
          </h3>
          <input
            value={textForm.name}
            onChange={(e) => setTextForm({ ...textForm, name: e.target.value })}
            placeholder="署名の名前 *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <input
            value={textForm.textValue}
            onChange={(e) => setTextForm({ ...textForm, textValue: e.target.value })}
            placeholder="署名テキスト *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <select
            value={textForm.fontFamily}
            onChange={(e) => setTextForm({ ...textForm, fontFamily: e.target.value })}
            style={{
              padding: "0.4rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.8rem",
            }}
          >
            {SIGNATURE_FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          {textForm.textValue && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--color-bg)",
                borderRadius: 6,
                marginBottom: "0.8rem",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: textForm.fontFamily,
                  fontSize: "1.5rem",
                  color: "var(--color-text-primary)",
                }}
              >
                {textForm.textValue}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleCreateText}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => setMode("list")}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {mode === "draw" && (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.8rem" }}>
            手書き署名を作成
          </h3>
          <input
            value={drawName}
            onChange={(e) => setDrawName(e.target.value)}
            placeholder="署名の名前 *"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          />
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: "0.5rem",
              backgroundColor: "#fff",
              touchAction: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              style={{ width: "100%", height: 200, cursor: "crosshair", display: "block" }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onPointerUp}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={clearCanvas}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              クリア
            </button>
            <button
              onClick={handleSaveDrawn}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => {
                setMode("list");
                clearCanvas();
              }}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {signatures.map((sig) => (
          <div
            key={sig.id}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: "0.8rem 1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  backgroundColor: sig.type === "text" ? "var(--color-accent)" : "#7C3AED",
                  color: "#fff",
                  padding: "0.1rem 0.4rem",
                  borderRadius: 4,
                }}
              >
                {sig.type === "text" ? "テキスト" : "手書き"}
              </span>
              <span style={{ fontWeight: 600, flex: 1 }}>{sig.name}</span>
              {sig.isDefault && (
                <span style={{ fontSize: "0.7rem", color: "#059669", fontWeight: 700 }}>
                  デフォルト
                </span>
              )}
              {!sig.isDefault && (
                <button
                  onClick={() => handleSetDefault(sig.id)}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  デフォルトに
                </button>
              )}
              <button
                onClick={() => handleDelete(sig.id)}
                style={{
                  fontSize: "0.75rem",
                  color: "#DC2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                削除
              </button>
            </div>
            <div
              style={{
                padding: "0.8rem",
                backgroundColor: "var(--color-bg)",
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              {sig.type === "text" ? (
                <span style={{ fontFamily: sig.fontFamily, fontSize: "1.3rem" }}>
                  {sig.textValue}
                </span>
              ) : sig.dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL署名プレビュー
                <img src={sig.dataUrl} alt={sig.name} style={{ maxHeight: 80, maxWidth: "100%" }} />
              ) : null}
            </div>
          </div>
        ))}
        {signatures.length === 0 && mode === "list" && (
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", padding: "2rem" }}>
            署名がありません
          </p>
        )}
      </div>
    </div>
  );
}
