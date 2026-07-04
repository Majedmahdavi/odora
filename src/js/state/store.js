/**
 * Tiny app store
 * --------------
 * Holds cross-page state (language, theme, chosen gender, quiz answers) and
 * persists it to localStorage so a refresh doesn't lose progress. Simple
 * pub/sub so pages can react to changes.
 */

const STORAGE_KEY = "odora:state";

const defaultState = {
  lang: "fa",
  mode: "dark", // day/night: dark | light (global user choice)
  gender: null, // feminine | masculine | unisex
  answers: {}, // quiz answers, filled in Step 3
  favorites: [], // hearted perfume ids (synced to the server when signed in)
  user: null, // server account { token, name, email, since } — set by pages/account.js
  giftMode: null, // surprise gift test { id, n: sender name } — set by #/gtest
  myGifts: [], // pre-account gift links { id, secret, createdAt } (legacy, still readable)
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

let state = load();
const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — keep in-memory */
  }
  listeners.forEach((fn) => fn(state));
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Clear a test run (used by "test again" later). Keeps mode/lang. */
export function resetProgress() {
  return setState({ gender: null, answers: {} });
}

/** Remember a gift link I created (id + secret prove ownership to the API). */
export function addMyGift(gift) {
  return setState({ myGifts: [...state.myGifts, gift] });
}

/* --- favorites ---------------------------------------------------------- */
export function isFavorite(id) {
  return state.favorites.includes(id);
}

export function toggleFavorite(id) {
  const favorites = isFavorite(id)
    ? state.favorites.filter((f) => f !== id)
    : [...state.favorites, id];
  const next = setState({ favorites });
  syncFavorites(); // fire-and-forget when signed in
  return next;
}

/** Push the favorites list to the account on the server (best effort). */
export function syncFavorites() {
  const user = state.user;
  if (!user?.token) return;
  fetch("/api/me/favorites", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
    body: JSON.stringify({ favorites: state.favorites }),
  }).catch(() => { /* offline — local copy still rules */ });
}
