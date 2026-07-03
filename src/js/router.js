/**
 * Hash router
 * -----------
 * Minimal client-side router. Supports exact paths ("/about") and a single
 * dynamic segment ("/perfume/:id"), which we'll use for the details page later.
 */

const routes = [];
let notFoundHandler = null;

/** Register a route. path may contain ":param" segments. */
export function register(path, handler) {
  routes.push({ segments: path.split("/").filter(Boolean), handler, path });
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const qIndex = raw.indexOf("?");
  const path = (qIndex === -1 ? raw : raw.slice(0, qIndex)) || "/";
  const query = {};
  if (qIndex !== -1) {
    new URLSearchParams(raw.slice(qIndex + 1)).forEach((v, k) => (query[k] = v));
  }
  return { path, query };
}

function match(path) {
  const parts = path.split("/").filter(Boolean);
  for (const route of routes) {
    if (route.segments.length !== parts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const seg = route.segments[i];
      if (seg.startsWith(":")) params[seg.slice(1)] = decodeURIComponent(parts[i]);
      else if (seg !== parts[i]) { ok = false; break; }
    }
    if (ok) return { handler: route.handler, params };
  }
  return null;
}

export function navigate(path) {
  if (location.hash !== `#${path}`) location.hash = path;
  else resolve();
}

export function resolve() {
  const { path, query } = parseHash();
  const found = match(path);
  window.scrollTo({ top: 0, behavior: "auto" });
  if (found) found.handler({ ...found.params, query });
  else if (notFoundHandler) notFoundHandler({ query });
}

export function startRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}
