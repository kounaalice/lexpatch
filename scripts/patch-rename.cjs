/**
 * Minimal patch — only intercepts rename of 500.html to prevent build failure.
 * Loaded via NODE_OPTIONS="--require ./scripts/patch-rename.cjs"
 */
const fs = require("fs");
const path = require("path");

const fallback = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>500</title></head><body><h1>Server Error</h1></body></html>`;

function ensure500(oldPath, newPath) {
  if (typeof oldPath !== "string" || !oldPath.endsWith("500.html")) return;
  try {
    if (!fs.existsSync(oldPath)) {
      fs.mkdirSync(path.dirname(oldPath), { recursive: true });
      fs.writeFileSync(oldPath, fallback);
    }
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
  } catch {}
}

const _rename = fs.rename;
fs.rename = function(o, n, cb) { ensure500(o, n); return _rename.call(fs, o, n, cb); };

const _renameSync = fs.renameSync;
fs.renameSync = function(o, n) { ensure500(o, n); return _renameSync.call(fs, o, n); };

const _pRename = fs.promises.rename;
fs.promises.rename = async function(o, n) { ensure500(o, n); return _pRename.call(fs.promises, o, n); };
