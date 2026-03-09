import { ImageResponse } from "next/og";

export const alt = "LexCard — Japanese Legal Access Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(160deg, #EFF8FF 0%, #DBEAFE 55%, #BFDBFE 100%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: "#0369A1",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#1E3A5F",
            letterSpacing: "-0.02em",
          }}
        >
          LexCard
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#4B6A8A",
          }}
        >
          Japanese Legal Access Platform
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "24px",
            fontSize: "18px",
            color: "#4B6A8A",
          }}
        >
          <span>Search</span>
          <span style={{ color: "#BAE6FD" }}>|</span>
          <span>Annotate</span>
          <span style={{ color: "#BAE6FD" }}>|</span>
          <span>Collaborate</span>
        </div>
        <div
          style={{
            marginTop: "16px",
            padding: "8px 24px",
            borderRadius: "6px",
            backgroundColor: "#0369A1",
            color: "#fff",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          Free for Individuals · $1,000/mo for Organizations
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "16px",
          color: "#4B6A8A",
        }}
      >
        <span>9,000+ Japanese Statutes</span>
        <span style={{ color: "#BAE6FD" }}>·</span>
        <span>Official e-Gov API</span>
        <span style={{ color: "#BAE6FD" }}>·</span>
        <span>Open Source</span>
      </div>
    </div>,
    { ...size },
  );
}
