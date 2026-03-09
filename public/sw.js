// LexCard Service Worker — 全法令キャッシュ + オフライン対応
// デプロイ時にバージョンを更新 → activate で旧キャッシュ削除

// ─── SKIP_WAITING メッセージ受信 ─────────────────────
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
var CACHE_VERSION = "lexcard-v2";
var STATIC_CACHE = CACHE_VERSION + "-static";
var LAW_CACHE = CACHE_VERSION + "-laws";
var API_CACHE = CACHE_VERSION + "-api";
var WS_CACHE = CACHE_VERSION + "-ws";

// 主要24法令 — Install 時に事前キャッシュ
var PRECACHE_LAW_IDS = [
  "321CONSTITUTION",  // 日本国憲法
  "129AC0000000089",  // 民法
  "140AC0000000045",  // 刑法
  "322AC0000000049",  // 労働基準法
  "417AC0000000086",  // 会社法
  "322AC0000000067",  // 地方自治法
  "408AC0000000109",  // 民事訴訟法
  "323AC0000000131",  // 刑事訴訟法
  "340AC0000000033",  // 所得税法
  "340AC0000000034",  // 法人税法
  "363AC0000000108",  // 消費税法
  "415AC0000000057",  // 個人情報保護法
  "322AC0000000054",  // 独占禁止法
  "323AC0000000025",  // 金融商品取引法
  "416AC0000000123",  // 不動産登記法
  "405AC0000000088",  // 行政手続法
  "325AC0000000201",  // 建築基準法
  "335AC0000000105",  // 道路交通法
  "322AC0000000120",  // 国家公務員法
  "322AC0000000026",  // 学校教育法
  "416AC0000000075",  // 破産法
  "403AC0000000090",  // 借地借家法
  "345AC0000000048",  // 著作権法
  "409AC0000000123",  // 介護保険法
];

var PRECACHE_URLS = [
  "/",
  "/offline",
];

// ─── Install ──────────────────────────────────────
self.addEventListener("install", function (event) {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      }),
      // 24法令を事前キャッシュ（個別失敗を許容）
      caches.open(LAW_CACHE).then(function (cache) {
        return Promise.allSettled(
          PRECACHE_LAW_IDS.map(function (id) {
            return cache.add("/law/" + id);
          })
        );
      }),
    ])
  );
});

// ─── Activate ─────────────────────────────────────
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== STATIC_CACHE && key !== LAW_CACHE && key !== API_CACHE && key !== WS_CACHE;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ─── Fetch ────────────────────────────────────────
self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 開発サーバーではキャッシュしない（stale chunk 防止）
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return;

  // 静的アセット（ハッシュ付き不変ファイル）: Cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 法令ページ: Stale-while-revalidate（即返却 + BG更新）
  if (url.pathname.startsWith("/law/")) {
    event.respondWith(staleWhileRevalidate(request, LAW_CACHE));
    return;
  }

  // Workspace pages — network first, cache fallback
  if (url.pathname.startsWith("/ws")) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response.ok) {
          var cache = caches.open(WS_CACHE);
          cache.then(function(c) { c.put(event.request, response.clone()); });
        }
        return response;
      }).catch(function() {
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match("/offline");
        });
      })
    );
    return;
  }

  // API: Network-first + cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // その他: Network-first + cache fallback
  event.respondWith(networkFirstWithCache(request, STATIC_CACHE));
});

// ─── 戦略: Cache-first ──────────────────────────
function cacheFirst(request, cacheName) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(cacheName).then(function (cache) {
          cache.put(request, clone);
        });
      }
      return response;
    }).catch(function () {
      return offlineFallback();
    });
  });
}

// ─── 戦略: Stale-while-revalidate ───────────────
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      var fetchPromise = fetch(request).then(function (response) {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function () {
        return null;
      });

      if (cached) {
        // キャッシュ済み → 即返却、バックグラウンドで更新
        fetchPromise; // fire and forget
        return cached;
      }

      // 未キャッシュ → ネットワーク待ち
      return fetchPromise.then(function (response) {
        if (response) return response;
        return offlineFallback();
      });
    });
  });
}

// ─── 戦略: Network-first + cache fallback ───────
function networkFirstWithCache(request, cacheName) {
  return fetch(request).then(function (response) {
    if (response.ok) {
      var clone = response.clone();
      caches.open(cacheName).then(function (cache) {
        cache.put(request, clone);
      });
    }
    return response;
  }).catch(function () {
    return caches.match(request).then(function (cached) {
      if (cached) return cached;
      return offlineFallback();
    });
  });
}

// ─── オフラインフォールバック ─────────────────────
function offlineFallback() {
  return caches.match("/offline").then(function (cached) {
    if (cached) return cached;
    return new Response(
      '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>オフライン | LexCard</title></head><body style="font-family:sans-serif;text-align:center;padding:3rem;background:#EFF8FF;color:#1E3A5F"><h1>オフライン</h1><p>インターネットに接続されていません。</p><p>過去に閲覧した法令ページはオフラインでもご覧いただけます。</p><a href="/" style="color:#0369A1">トップページへ</a></body></html>',
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  });
}
