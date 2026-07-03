/**
 * Shareable-result encoding.
 * With no backend, we pack the answer set into the URL itself, so a shared
 * link reproduces the exact same recommendations for whoever opens it.
 * Format: #/results?s=<url-safe base64 of { g: gender, a: answers }>
 */

function toUrlSafe(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromUrlSafe(str) {
  return str.replace(/-/g, "+").replace(/_/g, "/");
}

export function encodeState(state) {
  const payload = { g: state.gender, a: state.answers };
  const json = JSON.stringify(payload);
  return toUrlSafe(btoa(unescape(encodeURIComponent(json))));
}

export function decodeState(str) {
  try {
    const json = decodeURIComponent(escape(atob(fromUrlSafe(str))));
    const payload = JSON.parse(json);
    if (!payload || typeof payload !== "object") return null;
    return { gender: payload.g ?? "unisex", answers: payload.a ?? {} };
  } catch {
    return null;
  }
}

export function buildShareLink(state) {
  const base = location.origin + location.pathname;
  return `${base}#/results?s=${encodeState(state)}`;
}
