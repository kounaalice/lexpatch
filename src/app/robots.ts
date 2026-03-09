import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/notifications",
          "/login",
          "/api/",
          "/lp",
          "/for-organizations",
        ],
      },
    ],
    sitemap: "https://lexcard.jp/sitemap.xml",
  };
}
