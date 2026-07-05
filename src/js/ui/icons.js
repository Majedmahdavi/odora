/**
 * Inline SVG icons (theme-aware via currentColor).
 * The minimal perfume bottle is used as a placeholder art everywhere a real
 * product photo will later go — designed to be swapped out easily.
 */

/** Sun (shown in dark mode → tap for day). */
export function sunIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2"/>
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5"/>
  </svg>`;
}

/** Moon (shown in light mode → tap for night). */
export function moonIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 14.4A8 8 0 1 1 9.6 4a6.5 6.5 0 0 0 10.4 10.4z"/>
  </svg>`;
}

/** Heart — outline normally, filled when favorited. */
export function heartIcon(className = "", filled = false) {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20.4S4.3 15.6 2.6 10.9C1.4 7.7 3.2 4.6 6.4 4.1c2-.3 3.9.6 5.6 2.6 1.7-2 3.6-2.9 5.6-2.6 3.2.5 5 3.6 3.8 6.8-1.7 4.7-9.4 9.5-9.4 9.5z"/>
  </svg>`;
}

/** Person / account. */
export function userIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="3.6"/>
    <path d="M4.5 20c1.2-3.4 4-5.2 7.5-5.2s6.3 1.8 7.5 5.2"/>
  </svg>`;
}

/** Gift box. */
export function giftIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3.5" y="8" width="17" height="4"/>
    <rect x="5.5" y="12" width="13" height="8.5"/>
    <path d="M12 8v12.5M12 8c-2.2 0-4.6-.9-4.6-2.9C7.4 3.6 9 3 10 3.6c1.3.8 2 4.4 2 4.4zm0 0c2.2 0 4.6-.9 4.6-2.9C16.6 3.6 15 3 14 3.6c-1.3.8-2 4.4-2 4.4z"/>
  </svg>`;
}

/** Sparkle — AI / smart. */
export function sparkleIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3c.5 4.3 3.4 7.2 7.7 7.7C15.4 11.2 12.5 14.1 12 18.4c-.5-4.3-3.4-7.2-7.7-7.7C8.6 10.2 11.5 7.3 12 3Z"/>
    <path d="M18.5 15.5c.2 1.6 1.2 2.6 2.8 2.8-1.6.2-2.6 1.2-2.8 2.8-.2-1.6-1.2-2.6-2.8-2.8 1.6-.2 2.6-1.2 2.8-2.8Z"/>
  </svg>`;
}

/** Fingerprint — personality / identity. */
export function fingerprintIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 11v3.5"/>
    <path d="M8.5 12a3.5 3.5 0 0 1 7 0v2a5 5 0 0 1-.4 2"/>
    <path d="M5.5 12a6.5 6.5 0 0 1 13 0v1.5a9 9 0 0 1-.6 3.3"/>
    <path d="M8.4 18.6A6.5 6.5 0 0 0 9 16v-4a3 3 0 0 1 6 0"/>
    <path d="M4.9 8.2a8 8 0 0 1 13.8 1.3"/>
  </svg>`;
}

/** Target — smart recommendation / discovery. */
export function targetIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"/>
    <circle cx="12" cy="12" r="4.5"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>`;
}

/** Speech bubble — answer questions. */
export function chatIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 15a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3H6.5A2.5 2.5 0 0 1 4 15V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5Z"/>
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>
  </svg>`;
}

/** DNA double helix — fragrance profile. */
export function dnaIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M7 3c0 4.5 10 5.5 10 9s-10 4.5-10 9"/>
    <path d="M17 3c0 4.5-10 5.5-10 9s10 4.5 10 9"/>
    <path d="M8 6.5h8M8.8 9h6.4M8.8 15h6.4M8 17.5h8"/>
  </svg>`;
}

/** Chevron / arrow pointing down — step connector. */
export function arrowDownIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 4.5v15M6.5 13.5 12 19l5.5-5.5"/>
  </svg>`;
}

/** Minimal, elegant perfume bottle outline. */
export function bottleIcon(className = "") {
  return `
  <svg class="${className}" viewBox="0 0 140 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="55" y="10" width="30" height="24" rx="5" stroke="currentColor" stroke-width="2.5"/>
    <rect x="61" y="33" width="18" height="14" stroke="currentColor" stroke-width="2.5"/>
    <path d="M61 47 L43 65 H97 L79 47 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="40" y="64" width="60" height="134" rx="17" stroke="currentColor" stroke-width="2.5"/>
    <rect x="53" y="108" width="34" height="60" rx="7" stroke="currentColor" stroke-width="1.4" opacity="0.55"/>
    <path d="M70 33 V22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}
