/**
 * Odora — app bootstrap
 * ---------------------
 * Loads the locale, applies the saved theme, renders the persistent shell
 * (header + footer), registers routes, and starts the router.
 */

import { loadLocale, t, getLang } from "./i18n/index.js";
import { getState, setState } from "./state/store.js";
import { register, setNotFound, startRouter, resolve } from "./router.js";
import { applyTheme, getMode, toggleMode } from "./ui/theme.js";
import { sunIcon, moonIcon, heartIcon, userIcon } from "./ui/icons.js";

import { renderHome } from "./pages/home.js";
import { renderAbout } from "./pages/about.js";
import { renderContact } from "./pages/contact.js";
import { renderGender } from "./pages/gender.js";
import { renderQuiz } from "./pages/quiz.js";
import { renderResults } from "./pages/results.js";
import { renderSignature } from "./pages/signature.js";
import { renderCatalog } from "./pages/catalog.js";
import { renderPerfume } from "./pages/perfume.js";
import { renderFavorites } from "./pages/favorites.js";
import { renderAccount } from "./pages/account.js";
import { renderGift } from "./pages/gift.js";
import { renderGiftTestCreate, renderGiftTestLanding, renderGiftTestDone } from "./pages/giftTest.js";

const NAV_LINKS = [
  { href: "#/", key: "nav.home" },
  { href: "#/catalog", key: "nav.catalog" },
  { href: "#/about", key: "nav.about" },
  { href: "#/contact", key: "nav.contact" },
];

function modeToggleIcon() {
  return getMode() === "dark" ? sunIcon("icon-mode") : moonIcon("icon-mode");
}

/** The language button shows the language you would switch TO. */
function langToggleLabel() {
  return getLang() === "fa" ? "EN" : "فا";
}

function headerHtml() {
  const links = NAV_LINKS.map(
    (l) => `<a href="${l.href}" data-nav>${t(l.key)}</a>`
  ).join("");

  return `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="#/" aria-label="Odora">
          <span class="brand-mark latin">O</span>
          <span class="brand-name latin">${t("brand.name")}</span>
        </a>
        <nav class="main-nav" id="mainNav" aria-label="${t("nav.menu")}">${links}</nav>
        <div class="header-actions">
          <a class="mode-toggle" href="#/favorites" data-nav aria-label="${t("nav.favorites")}">${heartIcon("icon-mode")}</a>
          <a class="mode-toggle" href="#/account" data-nav aria-label="${t("nav.account")}">${userIcon("icon-mode")}</a>
          <button class="lang-toggle" id="langToggle" type="button" aria-label="${t("nav.toggleLang")}">${langToggleLabel()}</button>
          <button class="mode-toggle" id="modeToggle" type="button" aria-label="${t("nav.toggleMode")}">${modeToggleIcon()}</button>
          <button class="nav-toggle" id="navToggle" aria-label="${t("nav.menu")}" aria-expanded="false">
            <span></span>
          </button>
        </div>
      </div>
    </header>`;
}

function footerHtml() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="brand-name latin">${t("brand.name")}</span>
          <span class="footer-slogan muted">— ${t("brand.slogan")}</span>
        </div>
        <div class="footer-copy latin">© ${year} Odora — ${t("footer.copy")}</div>
      </div>
    </footer>`;
}

function renderShell() {
  const app = document.getElementById("app");
  app.innerHTML = `${headerHtml()}<main id="view"></main>${footerHtml()}`;
  wireNav();
}

function wireNav() {
  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("navToggle");

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // close the mobile menu after tapping a link
  nav?.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });

  const modeBtn = document.getElementById("modeToggle");
  modeBtn?.addEventListener("click", () => {
    toggleMode();
    modeBtn.innerHTML = modeToggleIcon();
  });

  // language switch: reload the locale, then re-render shell + current page
  const langBtn = document.getElementById("langToggle");
  langBtn?.addEventListener("click", async () => {
    const next = getLang() === "fa" ? "en" : "fa";
    setState({ lang: next });
    await loadLocale(next);
    document.title = t("meta.title");
    renderShell();
    resolve();
  });
}

/** Highlight the active nav link based on the current hash. */
function updateActiveNav() {
  const current = location.hash || "#/";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("is-active", a.getAttribute("href") === current);
  });
}

/**
 * Wrap a page renderer: apply the section's palette, render into #view, and
 * update the nav. scope:
 *   "general" → always the default palette (home, catalog, about, contact)
 *   "gender"  → the chosen gender palette (test flow: gender, quiz, results)
 *   "self"    → the page sets its own palette (perfume detail = its gender)
 */
function page(renderFn, scope = "general") {
  return (params) => {
    const view = document.getElementById("view");
    if (scope === "general") applyTheme("default");
    else if (scope === "gender") applyTheme(getState().gender || "default");
    renderFn(view, params);
    updateActiveNav();
  };
}

async function boot() {
  const { lang } = getState();
  applyTheme("default"); // general palette + current mode; router sets per-route
  await loadLocale(lang);

  document.title = t("meta.title");
  renderShell();

  register("/", page(renderHome, "general"));
  register("/about", page(renderAbout, "general"));
  register("/contact", page(renderContact, "general"));
  register("/catalog", page(renderCatalog, "general"));
  register("/favorites", page(renderFavorites, "general"));
  register("/account", page(renderAccount, "general"));
  register("/gift", page(renderGift, "self"));
  register("/gift-test", page(renderGiftTestCreate, "general"));
  register("/gtest", page(renderGiftTestLanding, "general"));
  register("/gift-done", page(renderGiftTestDone, "gender"));
  register("/gender", page(renderGender, "gender"));
  register("/quiz", page(renderQuiz, "gender"));
  register("/results", page(renderResults, "gender"));
  register("/signature", page(renderSignature, "gender"));
  register("/perfume/:id", page(renderPerfume, "self"));
  setNotFound(page(renderHome, "general"));

  startRouter();
}

boot().catch((err) => {
  console.error(err);
  document.getElementById("app").innerHTML =
    `<div class="boot">خطا در بارگذاری برنامه. لطفاً صفحه را تازه کنید.</div>`;
});
