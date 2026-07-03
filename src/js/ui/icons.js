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
