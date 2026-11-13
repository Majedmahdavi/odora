/**
 * Live weather (ROBO Stage 1.5) — real current temperature instead of the
 * season→temperature bridge. Uses Open-Meteo (free, keyless, CORS-friendly —
 * the same source ROBO used). The temperature feeds the Scent-Matrix matcher's
 * physics so recommendations react to the actual weather, not just the season.
 */

/** Iranian cities with coordinates + bilingual labels (proper nouns, like
 *  perfume names, live in data rather than the i18n dictionaries). */
export const CITIES = [
  { id: "tehran", lat: 35.70, lon: 51.42, fa: "تهران", en: "Tehran" },
  { id: "mashhad", lat: 36.30, lon: 59.60, fa: "مشهد", en: "Mashhad" },
  { id: "isfahan", lat: 32.65, lon: 51.67, fa: "اصفهان", en: "Isfahan" },
  { id: "shiraz", lat: 29.59, lon: 52.58, fa: "شیراز", en: "Shiraz" },
  { id: "tabriz", lat: 38.08, lon: 46.29, fa: "تبریز", en: "Tabriz" },
  { id: "karaj", lat: 35.84, lon: 50.94, fa: "کرج", en: "Karaj" },
  { id: "ahvaz", lat: 31.32, lon: 48.67, fa: "اهواز", en: "Ahvaz" },
  { id: "rasht", lat: 37.28, lon: 49.58, fa: "رشت", en: "Rasht" },
  { id: "yazd", lat: 31.90, lon: 54.37, fa: "یزد", en: "Yazd" },
  { id: "bandar-abbas", lat: 27.18, lon: 56.28, fa: "بندرعباس", en: "Bandar Abbas" },
];

export function getCity(id) {
  return CITIES.find((c) => c.id === id) || null;
}

/** Current temperature (°C) for coordinates. Resolves to null on any failure. */
export async function fetchTempByCoords(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const t = data?.current?.temperature_2m;
    return typeof t === "number" ? t : null;
  } catch {
    return null; // offline / blocked / timeout → caller falls back to season
  }
}

/** Current temperature for a known city id. */
export async function fetchTempByCity(cityId) {
  const city = getCity(cityId);
  if (!city) return null;
  return fetchTempByCoords(city.lat, city.lon);
}

/* --- Stage 1.6: geolocation + freshness cache ---------------------------- */

/** How long a fetched temperature stays "fresh" before a background refresh. */
export const WEATHER_TTL_MS = 30 * 60 * 1000; // 30 min

export function isFreshWeather(ts) {
  return typeof ts === "number" && Date.now() - ts < WEATHER_TTL_MS;
}

/** Browser geolocation → {lat, lon} or null (denied / unavailable / timeout). */
export function getGeoCoords(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}

/** Nearest known city to coordinates (for a friendly label). */
export function nearestCity(lat, lon) {
  let best = CITIES[0];
  let bd = Infinity;
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
