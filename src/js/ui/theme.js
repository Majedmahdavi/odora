import { getState, setState } from "../state/store.js";

/**
 * Central theming.
 * palette (data-theme) is decided per route/section; mode (data-mode) is a
 * global user choice (day/night) persisted in the store. applyTheme() always
 * re-applies the current mode so it stays consistent across navigation.
 */

export function getMode() {
  return getState().mode === "light" ? "light" : "dark";
}

export function applyTheme(palette) {
  const root = document.documentElement;
  root.setAttribute("data-theme", palette || "default");
  root.setAttribute("data-mode", getMode());
}

export function setMode(mode) {
  const next = mode === "light" ? "light" : "dark";
  setState({ mode: next });
  document.documentElement.setAttribute("data-mode", next);
  return next;
}

export function toggleMode() {
  return setMode(getMode() === "dark" ? "light" : "dark");
}
