import { t } from "../i18n/index.js";
import { getState, setState } from "../state/store.js";
import { navigate } from "../router.js";
import { QUIZ } from "../quiz/questions.js";
import { toFaDigits } from "../utils/format.js";

/**
 * تست بویایی (Step 3)
 * A small state machine over QUIZ. `step` is the current question index.
 * Answers are stored (persisted) in state.answers keyed by question id;
 * the families question stores a { family: 1..5 } object.
 */

let step = 0;

/* --- entry ------------------------------------------------------------- */
export function renderQuiz(view) {
  const state = getState();
  if (!state.gender) {
    navigate("/gender"); // theme/gender must be chosen first
    return;
  }
  ensureFamilyDefaults();
  step = 0;

  view.innerHTML = `
    <section class="container quiz">
      <div class="quiz-head">
        <span class="quiz-count" id="quizCount"></span>
      </div>
      <div class="quiz-progress"><span id="quizBar"></span></div>
      <div id="quizBody"></div>
      <div class="quiz-nav">
        <button class="btn btn-ghost" id="quizBack" type="button">${t("quiz.back")}</button>
        <button class="btn btn-primary" id="quizNext" type="button">${t("quiz.next")}</button>
      </div>
    </section>`;

  view.querySelector("#quizBack").addEventListener("click", () => goBack(view));
  view.querySelector("#quizNext").addEventListener("click", () => goNext(view));
  paint(view);
}

/* --- helpers ----------------------------------------------------------- */
function ensureFamilyDefaults() {
  const { answers } = getState();
  if (!answers.families) {
    const families = {};
    QUIZ.find((q) => q.type === "rating").families.forEach((f) => (families[f] = 3));
    setState({ answers: { ...answers, families } });
  }
}

function paint(view) {
  const q = QUIZ[step];
  const total = QUIZ.length;

  view.querySelector("#quizBar").style.width = `${((step + 1) / total) * 100}%`;
  view.querySelector("#quizCount").textContent = t("quiz.progress")
    .replace("{current}", toFaDigits(step + 1))
    .replace("{total}", toFaDigits(total));

  view.querySelector("#quizBody").innerHTML =
    q.type === "rating" ? ratingCard(q) : choiceCard(q);
  wireCard(view, q);
  updateNav(view, q);
}

/* --- cards ------------------------------------------------------------- */
function choiceCard(q) {
  const current = getState().answers[q.id];
  const opts = q.options
    .map((o) => {
      const label = t(`quiz.questions.${q.id}.options.${o.id}`);
      const on = current === o.id ? "is-selected" : "";
      return `<button class="option ${on}" type="button" data-opt="${o.id}">${label}</button>`;
    })
    .join("");

  return `
    <div class="quiz-card">
      <h2 class="quiz-title">${t(`quiz.questions.${q.id}.title`)}</h2>
      <div class="options">${opts}</div>
    </div>`;
}

function ratingCard(q) {
  const fam = getState().answers.families || {};
  const rows = q.families
    .map((f) => {
      const val = fam[f] ?? 3;
      const dots = [1, 2, 3, 4, 5]
        .map(
          (n) =>
            `<button class="dot ${n <= val ? "is-on" : ""}" type="button"
               data-fam="${f}" data-val="${n}"
               aria-label="${toFaDigits(n)}">${toFaDigits(n)}</button>`
        )
        .join("");
      return `
        <div class="rating-row" data-row="${f}">
          <div class="rating-info">
            <div class="rating-name">${t(`families.${f}.name`)}</div>
            <div class="rating-desc">${t(`families.${f}.desc`)}</div>
          </div>
          <div class="rating-dots">${dots}</div>
        </div>`;
    })
    .join("");

  return `
    <div class="quiz-card">
      <h2 class="quiz-title">${t(`quiz.questions.${q.id}.title`)}</h2>
      <p class="quiz-subtitle">${t(`quiz.questions.${q.id}.subtitle`)}</p>
      <div class="rating-list">${rows}</div>
    </div>`;
}

/* --- interaction ------------------------------------------------------- */
function wireCard(view, q) {
  if (q.type === "rating") {
    view.querySelectorAll(".dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        const f = dot.dataset.fam;
        const val = Number(dot.dataset.val);
        const answers = getState().answers;
        setState({ answers: { ...answers, families: { ...answers.families, [f]: val } } });

        view
          .querySelector(`.rating-row[data-row="${f}"]`)
          .querySelectorAll(".dot")
          .forEach((d) => d.classList.toggle("is-on", Number(d.dataset.val) <= val));
      });
    });
    return;
  }

  view.querySelectorAll(".option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const answers = getState().answers;
      setState({ answers: { ...answers, [q.id]: opt.dataset.opt } });
      view
        .querySelectorAll(".option")
        .forEach((o) => o.classList.toggle("is-selected", o === opt));
      updateNav(view, q);
      // no auto-advance: the choice stays put; the user taps "بعدی" to continue
    });
  });
}

function updateNav(view, q) {
  const isLast = step === QUIZ.length - 1;
  const next = view.querySelector("#quizNext");
  next.textContent = isLast ? t("quiz.finish") : t("quiz.next");

  const answered = q.type === "rating" ? true : Boolean(getState().answers[q.id]);
  next.classList.toggle("is-disabled", !answered);
}

function goBack(view) {
  if (step > 0) {
    step--;
    paint(view);
  } else {
    navigate("/gender");
  }
}

function goNext(view) {
  const q = QUIZ[step];
  const answered = q.type === "rating" ? true : Boolean(getState().answers[q.id]);
  if (!answered) return;

  if (step < QUIZ.length - 1) {
    step++;
    paint(view);
  } else if (getState().giftMode) {
    navigate("/gift-done"); // surprise gift test: recipient never sees results
  } else {
    navigate("/results"); // matching happens in Step 5/6
  }
}
