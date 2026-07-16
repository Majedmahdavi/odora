# Odora Design Language (ODL)

The permanent language for Odora — vocabulary, tone and naming. It does not
change any UI; it governs how we **name, write and talk about** the product so
everything feels like one calm, premium, personal experience. Any future
feature must follow this document.

---

## 1. Product philosophy

Odora helps people **understand, explore and express** their fragrance
preferences. It is not "a website that recommends perfumes"; it is a place
where someone discovers what they like and why.

Everything should feel **elegant, calm, warm, premium and personal.**
Never scientific. Never technical. Never clinical.

---

## 2. Voice & tone

**Always sound:** elegant · calm · warm · premium · confident.
**Never sound:** scientific · robotic · overly technical · marketing-heavy · overly playful.

Guidelines:
- Speak to one person, warmly — English "you", Persian «تو».
- Short, confident sentences. Let the page breathe; don't over-explain.
- Describe the *person and their taste*, not a "system" or an "algorithm".
- No hype, no exclamation stacking, no jargon (no "AI engine", "vector",
  "genetic", "analysis lab").

---

## 3. Official vocabulary

Every concept has **one** official name. Reuse it everywhere: UI copy, code,
folders, functions, i18n keys, comments, docs.

| Concept | English | Persian | Use for | Never say |
|---|---|---|---|---|
| The personal scent profile | **Scent Signature** | **امضای رایحه** | the meaningful profile revealed in the deep flow — used **sparingly** (see §4) | DNA, Genome, Genetic, Aroma DNA, Profile DNA |
| The preference questions | **the Test** | **تست** | the quiz the user answers | survey, questionnaire, form |
| The fast answer after the Test | **Quick Result** | **نتیجه‌ی سریع** | the immediate results page | — |
| The deeper guided experience | **the Signature journey** | **کشف امضای رایحه** | the optional `#/signature` flow | Deep Discovery, DNA flow |
| The personality summary | **Identity** | **هویت** | the "here's what your answers reveal" step | personality test |
| The memorable name | **Signature Name** | **نامِ امضا** | e.g. "Quiet Confidence" | title, label |
| The personality type | **Archetype** | **کهن‌الگو** | The Explorer, The Minimalist… | persona, type |
| The justified matches | **Recommendation Report** | **گزارش پیشنهاد** | per-perfume reasons | analysis, results |
| The surprise gift flow | **Gift Test** | **تست هدیه** | sending someone a test | gift quiz |
| The perfume library | **Collection** | **گنجینه** | the browse/search page | catalog, shop, store |
| Saved perfumes | **Favorites** | **علاقه‌مندی‌ها** | hearted perfumes | wishlist, saved items |
| The user account | **Account** | **حساب کاربری** | sign in / profile | login, membership |

**"Discovery"** is allowed only as the brand-level *act* — "fragrance
discovery", "Gift Discovery". It is **not** a module or concept name that
competes with "Scent Signature".

---

## 4. Use "Scent Signature" sparingly

"Scent Signature" is the crown concept — it should feel special. Reserve it
for the few **meaningful discovery moments**:
- the primary hero call-to-action ("Discover My Scent Signature"),
- the teaser that unlocks the deeper journey,
- the reveal step where the profile is shown.

Everywhere else, use **natural, human language** instead of repeating the
phrase. The experience should feel human, not like one word on every screen.

Natural-language bank (reach for these):
- "We found something interesting."
- "Here's what your answers reveal."
- "Let's explore your preferences."
- "This profile is based on your choices."
- "This recommendation matches your taste."

Persian equivalents:
- «یک چیز جالب پیدا کردیم.»
- «این چیزیه که جواب‌هات نشون می‌ده.»
- «بیا سلیقه‌ات رو با هم کشف کنیم.»
- «این پروفایل بر پایه‌ی انتخاب‌های خودته.»
- «این پیشنهاد با سلیقه‌ی تو جوره.»

---

## 5. Naming in code

- **One concept = one name** in folders, files, functions, i18n keys and comments.
- Canonical map (current, reuse these):
  - Scent Signature logic → `src/js/signature/` (`scentSignature.js`,
    `identity.js`, `archetype.js`, `report.js`)
  - Flow page / route → `src/js/pages/signature.js`, `#/signature`
  - i18n namespace → `signature.*` (landing preview → `home.signature.*`)
  - Archetype data → `src/js/data/archetypes.js`
- **Never reintroduce** `dna`, `genome`, `genetic`, or `discovery/` as a
  module/concept name.
- CSS style-hook prefixes (`dsc-`, `lx-`) are legacy internal hooks kept
  stable for now (renaming them is a CSS change). New styles should use clear,
  concept-aligned class names.
- Prefer descriptive names that reflect the product vision. Do **not** rename
  things unnecessarily — clarity first.

---

## 6. Future development rule

Before introducing any new term or module name:
1. Check this glossary. If an official concept exists, **reuse it**.
2. Only add a new concept if it genuinely strengthens the product language.
3. When you add one, **record it here** (English + Persian) so the language
   stays single and consistent.

Every new feature — code and copy — must sound like it belongs to the same
calm, premium, personal product.
