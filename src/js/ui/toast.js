/** Minimal transient toast, reused across pages. */
let timer = null;

export function toast(message, ms = 2400) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove("show"), ms);
}
