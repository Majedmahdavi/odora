/**
 * Perfume database (~100 real, well-known fragrances).
 * ----------------------------------------------------
 * Pure DATA — no app logic here. Consumed by the catalog view (Step 4),
 * the matching algorithm (Step 5), the results page (Step 6) and the
 * details page (Step 7).
 *
 * Family scores are 0..5 for each of the seven families, in this order:
 *   [woody, citrus, floral, sweet, spicy, oud, aquatic]
 *
 * Fields:
 *   id        stable kebab-case key (also used in the URL: #/perfume/:id)
 *   name      product name (Latin)          brand   house (Latin)
 *   gender    feminine | masculine | unisex
 *   families  { woody, citrus, floral, sweet, spicy, oud, aquatic } 0..5
 *   occasion  subset of ["daily","work","party"] the scent suits
 *   season    warm | cold | all
 *   strength  light | medium | strong
 *   desc      one-line Persian description
 *
 * NOTE: no real photos — the UI uses an SVG bottle placeholder that can be
 * swapped for a real image later (e.g. add an `image` field here).
 */

const ORDER = ["woody", "citrus", "floral", "sweet", "spicy", "oud", "aquatic"];

/** Build a perfume record from a compact family array. */
function p(id, name, brand, gender, f, occasion, season, strength, desc) {
  const families = {};
  ORDER.forEach((key, i) => (families[key] = f[i] ?? 0));
  return { id, name, brand, gender, families, occasion, season, strength, desc };
}

export const PERFUMES = [
  /* ---------------- مردانه ---------------- */
  p("dior-sauvage", "Sauvage", "Dior", "masculine", [4, 4, 0, 2, 4, 1, 3], ["daily", "work", "party"], "all", "strong", "تازه، ادویه‌ای و پرقدرت با امضای اَمبروکسان."),
  p("bleu-de-chanel", "Bleu de Chanel", "Chanel", "masculine", [4, 4, 1, 1, 2, 1, 2], ["daily", "work", "party"], "all", "medium", "چوبی-معطر و شیک؛ مناسب تقریباً هر موقعیت."),
  p("acqua-di-gio", "Acqua di Giò", "Giorgio Armani", "masculine", [2, 4, 1, 1, 1, 0, 5], ["daily", "work"], "warm", "medium", "دریایی و مرکباتی؛ نمادِ روزهای گرم."),
  p("dior-homme-intense", "Dior Homme Intense", "Dior", "masculine", [4, 1, 3, 3, 1, 1, 0], ["work", "party"], "cold", "strong", "زنبق پودری و چوبی؛ اعیانی و گرم."),
  p("allure-homme-sport", "Allure Homme Sport", "Chanel", "masculine", [3, 4, 0, 1, 2, 0, 3], ["daily", "work"], "warm", "medium", "مرکباتی-چوبی و اسپرت؛ تمیز و سرزنده."),
  p("1-million", "1 Million", "Paco Rabanne", "masculine", [2, 2, 1, 5, 4, 1, 0], ["party"], "cold", "strong", "شیرین، ادویه‌ای و چرمی؛ برای شب‌ها."),
  p("le-male", "Le Male", "Jean Paul Gaultier", "masculine", [2, 1, 2, 4, 3, 0, 1], ["daily", "party"], "cold", "strong", "اسطوخودوس و وانیل؛ گرم و اغواگر."),
  p("versace-eros", "Eros", "Versace", "masculine", [2, 2, 1, 4, 2, 0, 2], ["daily", "party"], "all", "strong", "نعنا و وانیل شیرین؛ جوان‌پسند و پرانرژی."),
  p("creed-aventus", "Aventus", "Creed", "masculine", [4, 3, 1, 2, 2, 1, 1], ["work", "party"], "all", "strong", "آناناسِ دودی و چوبی؛ نمادِ اقتدار."),
  p("la-nuit-de-lhomme", "La Nuit de L'Homme", "Yves Saint Laurent", "masculine", [3, 1, 1, 3, 4, 1, 0], ["party", "work"], "cold", "medium", "هل ادویه‌ای و نرم؛ باکلاس و گیرا."),
  p("the-one-for-men", "The One for Men", "Dolce & Gabbana", "masculine", [3, 2, 0, 3, 4, 1, 0], ["work", "party"], "cold", "medium", "توتون ادویه‌ای و گرم؛ رسمی و دلنشین."),
  p("prada-lhomme", "L'Homme", "Prada", "masculine", [3, 2, 3, 2, 1, 0, 1], ["daily", "work"], "all", "medium", "زنبق و نرولی پودری؛ تمیز و مؤدب."),
  p("montblanc-explorer", "Explorer", "Montblanc", "masculine", [4, 3, 0, 2, 1, 0, 1], ["daily", "work"], "all", "medium", "چوبی و مرکباتی؛ نسخه‌ای دلچسب و مقرون‌به‌صرفه."),
  p("armani-code", "Armani Code", "Giorgio Armani", "masculine", [2, 2, 1, 4, 3, 0, 0], ["party"], "cold", "medium", "تونکا و انیسون؛ شیرین و شبانه."),
  p("boss-bottled", "Boss Bottled", "Hugo Boss", "masculine", [3, 2, 1, 3, 3, 0, 0], ["daily", "work"], "all", "medium", "سیب و دارچین چوبی؛ کلاسیکِ محل کار."),
  p("givenchy-gentleman", "Gentleman", "Givenchy", "masculine", [3, 1, 3, 2, 2, 1, 0], ["party", "work"], "cold", "medium", "زنبق و چرم؛ مدرن و باوقار."),
  p("montblanc-legend", "Legend", "Montblanc", "masculine", [3, 3, 2, 1, 1, 0, 2], ["daily", "work"], "all", "medium", "معطر و تمیز؛ همه‌کاره و پرکاربرد."),
  p("azzaro-wanted", "Wanted", "Azzaro", "masculine", [3, 2, 0, 2, 4, 0, 0], ["party"], "cold", "strong", "زنجبیل و کاردامون؛ گرم و پرشور."),
  p("nautica-voyage", "Voyage", "Nautica", "masculine", [2, 2, 0, 1, 0, 0, 5], ["daily"], "warm", "medium", "دریایی و تازه؛ سبک و روزمره."),
  p("versace-dylan-blue", "Dylan Blue", "Versace", "masculine", [3, 3, 0, 1, 2, 0, 3], ["daily", "work"], "all", "medium", "آبی-چوبی؛ مدرن و همه‌فن‌حریف."),
  p("gucci-guilty-pour-homme", "Guilty pour Homme", "Gucci", "masculine", [2, 2, 2, 2, 2, 0, 1], ["daily", "party"], "all", "medium", "اسطوخودوس و ادویه؛ متعادل و خوش‌پوش."),
  p("terre-dhermes", "Terre d'Hermès", "Hermès", "masculine", [4, 4, 0, 0, 2, 0, 1], ["daily", "work"], "all", "medium", "مرکباتِ خاکی و چوبی؛ مردانه و باشخصیت."),
  p("dior-fahrenheit", "Fahrenheit", "Dior", "masculine", [3, 1, 3, 2, 2, 0, 0], ["party"], "cold", "strong", "چرم و بنفشه‌ی نفتی؛ یگانه و به‌یادماندنی."),
  p("jpg-le-beau", "Le Beau", "Jean Paul Gaultier", "masculine", [2, 1, 2, 3, 2, 0, 3], ["daily", "party"], "warm", "strong", "نارگیل و توبروز؛ گرمسیری و اغواگر."),
  p("ysl-y-edp", "Y EDP", "Yves Saint Laurent", "masculine", [3, 2, 2, 2, 2, 0, 2], ["daily", "work", "party"], "all", "medium", "معطرِ متعادل؛ از صبح تا شب."),
  p("stronger-with-you", "Stronger With You", "Emporio Armani", "masculine", [2, 1, 1, 4, 3, 0, 0], ["daily", "party"], "cold", "medium", "شاه‌بلوط و وانیل؛ گرم و صمیمی."),
  p("spicebomb", "Spicebomb", "Viktor & Rolf", "masculine", [2, 1, 0, 3, 5, 1, 0], ["party"], "cold", "strong", "انفجارِ ادویه؛ فلفل و توتون گرم."),
  p("leau-dissey-ph", "L'Eau d'Issey pour Homme", "Issey Miyake", "masculine", [2, 3, 0, 1, 1, 0, 5], ["daily", "work"], "warm", "medium", "یوزو و آبی؛ خنک و مینیمال."),
  p("luna-rossa-carbon", "Luna Rossa Carbon", "Prada", "masculine", [3, 2, 2, 1, 2, 0, 2], ["daily", "work"], "all", "medium", "اسطوخودوس فلزی و چوبی؛ تکنولوژیک و تمیز."),
  p("cdnim", "Club de Nuit Intense Man", "Armaf", "masculine", [4, 3, 0, 2, 2, 0, 1], ["party", "work"], "all", "strong", "الهام‌گرفته از اونتوس؛ دودی و پرقدرت."),
  p("rasasi-hawas", "Hawas", "Rasasi", "masculine", [3, 3, 1, 2, 1, 0, 3], ["daily", "party"], "all", "strong", "آبی-میوه‌ای و سرزنده؛ پرپخش و شاد."),
  p("lattafa-asad", "Asad", "Lattafa", "masculine", [3, 2, 0, 3, 3, 1, 0], ["party"], "cold", "strong", "آناناس و ادویه؛ جسورانه و شبانه."),
  p("lhomme-ideal", "L'Homme Idéal", "Guerlain", "masculine", [2, 3, 1, 3, 2, 0, 0], ["daily", "party"], "all", "medium", "بادام و مرکبات؛ گرم و خوشایند."),
  p("man-in-black", "Man in Black", "Bvlgari", "masculine", [3, 1, 1, 4, 4, 1, 0], ["party"], "cold", "strong", "چرم و ادویه‌ی شیرین؛ مردانه و پرحضور."),

  /* ---------------- زنانه ---------------- */
  p("chanel-no5", "No. 5", "Chanel", "feminine", [2, 2, 5, 2, 1, 0, 0], ["work", "party"], "all", "medium", "گلیِ آلدهیدی؛ افسانه‌ای و جاودان."),
  p("coco-mademoiselle", "Coco Mademoiselle", "Chanel", "feminine", [2, 3, 4, 2, 1, 0, 0], ["work", "party"], "all", "strong", "رز و پرتقال با پاچولی؛ شیک و پرقدرت."),
  p("dior-jadore", "J'adore", "Dior", "feminine", [1, 2, 5, 2, 0, 0, 1], ["work", "party"], "all", "medium", "دسته‌گلِ باشکوه؛ زنانه و درخشان."),
  p("black-opium", "Black Opium", "Yves Saint Laurent", "feminine", [2, 0, 2, 5, 2, 0, 0], ["party"], "cold", "strong", "قهوه و وانیل؛ اعتیادآور و شبانه."),
  p("la-vie-est-belle", "La Vie Est Belle", "Lancôme", "feminine", [1, 0, 3, 5, 1, 0, 0], ["daily", "party"], "all", "strong", "زنبق و پرالینه؛ شیرین و دلنشین."),
  p("chance-eau-tendre", "Chance Eau Tendre", "Chanel", "feminine", [1, 2, 4, 3, 0, 0, 1], ["daily", "party"], "warm", "medium", "گل و میوه‌ی نرم؛ لطیف و شاداب."),
  p("marc-jacobs-daisy", "Daisy", "Marc Jacobs", "feminine", [1, 2, 4, 1, 0, 0, 0], ["daily"], "warm", "light", "گلیِ تازه و ساده؛ روزمره و بهاری."),
  p("flowerbomb", "Flowerbomb", "Viktor & Rolf", "feminine", [1, 0, 5, 4, 1, 0, 0], ["party"], "cold", "strong", "بمبِ گل و شیرینی؛ پرحجم و اغواگر."),
  p("miss-dior", "Miss Dior", "Dior", "feminine", [1, 2, 5, 2, 0, 0, 0], ["party", "work"], "all", "medium", "گلی-رمانتیک با رزِ محوری؛ ظریف و باکلاس."),
  p("gucci-bloom", "Bloom", "Gucci", "feminine", [1, 0, 5, 1, 0, 0, 0], ["daily", "party"], "warm", "medium", "گل‌های سفیدِ پرحجم؛ توبروز و یاس."),
  p("lady-million", "Lady Million", "Paco Rabanne", "feminine", [1, 2, 3, 4, 1, 0, 0], ["party"], "cold", "strong", "شیرین و گلی؛ پرزرق‌وبرق و شبانه."),
  p("good-girl", "Good Girl", "Carolina Herrera", "feminine", [2, 0, 3, 4, 2, 1, 0], ["party"], "cold", "strong", "تونکا و یاس؛ اغواگر با کفشِ پاشنه‌بلند."),
  p("armani-si", "Sì", "Giorgio Armani", "feminine", [2, 2, 3, 3, 0, 0, 0], ["work", "party"], "all", "medium", "شیپرِ میوه‌ای و وانیلی؛ مدرن و زنانه."),
  p("bright-crystal", "Bright Crystal", "Versace", "feminine", [1, 2, 3, 2, 0, 0, 2], ["daily"], "warm", "light", "گل و انار؛ سبک و دل‌بازکن."),
  p("mugler-angel", "Angel", "Mugler", "feminine", [2, 0, 1, 5, 2, 0, 0], ["party"], "cold", "strong", "گورمندِ پاچولی؛ جسور و فراموش‌نشدنی."),
  p("chloe-edp", "Chloé EDP", "Chloé", "feminine", [1, 2, 4, 1, 0, 0, 0], ["daily", "work"], "all", "medium", "رزِ پودری؛ ظریف و باوقار."),
  p("dkny-be-delicious", "Be Delicious", "DKNY", "feminine", [1, 2, 3, 2, 0, 0, 1], ["daily"], "warm", "light", "سیب سبز و گل؛ شاداب و روزمره."),
  p("narciso-for-her", "For Her", "Narciso Rodriguez", "feminine", [2, 0, 3, 2, 0, 2, 0], ["daily", "party"], "all", "medium", "مشکِ گلی؛ حسی و پوستی."),
  p("lancome-idole", "Idôle", "Lancôme", "feminine", [1, 2, 4, 1, 0, 1, 0], ["daily", "work"], "all", "medium", "رز و مشکِ تمیز؛ مدرن و سبک‌بال."),
  p("ysl-libre", "Libre", "Yves Saint Laurent", "feminine", [1, 2, 4, 2, 1, 0, 0], ["work", "party"], "all", "strong", "اسطوخودوس و بهارنارنج؛ آزاد و باشخصیت."),
  p("mon-guerlain", "Mon Guerlain", "Guerlain", "feminine", [1, 0, 3, 4, 0, 0, 0], ["daily", "party"], "all", "medium", "اسطوخودوس و وانیل؛ نرم و زنانه."),
  p("light-blue", "Light Blue", "Dolce & Gabbana", "feminine", [1, 4, 2, 1, 0, 0, 2], ["daily"], "warm", "light", "سیب و لیمو؛ تابستانی و سرحال."),
  p("chanel-gabrielle", "Gabrielle", "Chanel", "feminine", [1, 2, 5, 1, 0, 0, 0], ["party", "work"], "all", "medium", "گل‌های سفیدِ درخشان؛ روشن و مجلل."),
  p("givenchy-linterdit", "L'Interdit", "Givenchy", "feminine", [2, 0, 4, 2, 1, 0, 0], ["party"], "cold", "strong", "توبروزِ تاریک؛ زنانه و پرکشش."),
  p("ysl-mon-paris", "Mon Paris", "Yves Saint Laurent", "feminine", [1, 1, 3, 4, 0, 0, 0], ["party"], "cold", "strong", "شیپرِ میوه‌ای شیرین؛ عاشقانه و شبانه."),
  p("vr-bonbon", "Bonbon", "Viktor & Rolf", "feminine", [1, 1, 2, 5, 0, 0, 0], ["party"], "cold", "strong", "کارامل و شیرینی؛ گورمندِ خالص."),
  p("armani-my-way", "My Way", "Giorgio Armani", "feminine", [1, 1, 4, 2, 0, 0, 0], ["daily", "party"], "all", "medium", "توبروز و بهارنارنج؛ روشن و امروزی."),
  p("chloe-nomade", "Nomade", "Chloé", "feminine", [2, 1, 3, 2, 0, 0, 0], ["daily", "work"], "all", "medium", "شیپرِ گلی با خزه‌ی بلوط؛ باشخصیت."),
  p("prada-paradoxe", "Paradoxe", "Prada", "feminine", [2, 0, 4, 2, 1, 0, 0], ["party", "work"], "all", "medium", "گلی-اَمبری؛ نرم و مدرن."),
  p("mugler-alien", "Alien", "Mugler", "feminine", [2, 0, 4, 2, 0, 2, 0], ["party"], "cold", "strong", "یاس و اَمبرِ چوبی؛ مرموز و پرقدرت."),
  p("burberry-her", "Her", "Burberry", "feminine", [1, 1, 3, 3, 0, 0, 0], ["daily", "party"], "cold", "medium", "توت‌های قرمزِ گورمند؛ سرخوش و شهری."),
  p("jpg-classique", "Classique", "Jean Paul Gaultier", "feminine", [1, 0, 4, 2, 1, 0, 0], ["party"], "cold", "medium", "گلیِ پودری؛ زنانه‌ی کلاسیک."),
  p("britney-fantasy", "Fantasy", "Britney Spears", "feminine", [0, 0, 3, 4, 0, 0, 1], ["daily", "party"], "warm", "medium", "کاپ‌کیک و میوه؛ شیرین و بازیگوش."),

  /* ---------------- یونیسکس ---------------- */
  p("br-540", "Baccarat Rouge 540", "Maison Francis Kurkdjian", "unisex", [3, 0, 2, 4, 3, 1, 0], ["party"], "all", "strong", "زعفران و اَمبرِ چوبی؛ نمادین و پرپخش."),
  p("tobacco-vanille", "Tobacco Vanille", "Tom Ford", "unisex", [3, 0, 0, 5, 4, 1, 0], ["party"], "cold", "strong", "توتون و وانیل؛ گرم و اعیانی."),
  p("oud-wood", "Oud Wood", "Tom Ford", "unisex", [4, 0, 0, 1, 2, 5, 0], ["party", "work"], "cold", "medium", "عودِ نرم و چوبی؛ لوکس و متعادل."),
  p("santal-33", "Santal 33", "Le Labo", "unisex", [5, 0, 0, 1, 2, 1, 0], ["daily", "party"], "all", "strong", "صندل و چرم؛ امضایی و به‌یادماندنی."),
  p("lost-cherry", "Lost Cherry", "Tom Ford", "unisex", [1, 0, 2, 5, 1, 0, 0], ["party"], "cold", "strong", "گیلاس و بادام؛ شیرین و اغواگر."),
  p("grand-soir", "Grand Soir", "Maison Francis Kurkdjian", "unisex", [3, 0, 0, 4, 2, 1, 0], ["party"], "cold", "strong", "اَمبر و وانیل؛ گرمِ شبانه و باشکوه."),
  p("replica-jazz-club", "Jazz Club", "Maison Margiela", "unisex", [3, 0, 0, 4, 3, 1, 0], ["party", "work"], "cold", "medium", "رام و توتون؛ حال‌وهوای کافه‌ی مردانه."),
  p("replica-fireplace", "By the Fireplace", "Maison Margiela", "unisex", [3, 0, 0, 4, 2, 0, 0], ["party"], "cold", "medium", "شاه‌بلوطِ دودی و وانیل؛ گرمِ زمستانی."),
  p("replica-beach-walk", "Beach Walk", "Maison Margiela", "unisex", [0, 1, 2, 2, 0, 0, 3], ["daily"], "warm", "light", "نارگیل و آفتاب؛ خاطره‌ی ساحل."),
  p("byredo-gypsy-water", "Gypsy Water", "Byredo", "unisex", [4, 2, 1, 2, 0, 0, 1], ["daily"], "all", "medium", "کاجِ چوبی و تازه؛ آزاد و بوهمی."),
  p("jo-malone-wsss", "Wood Sage & Sea Salt", "Jo Malone", "unisex", [3, 1, 0, 0, 0, 0, 4], ["daily"], "warm", "light", "نمکِ دریا و مریم‌گلی؛ خنک و مینیمال."),
  p("creed-smw", "Silver Mountain Water", "Creed", "unisex", [2, 4, 0, 0, 0, 0, 4], ["daily", "work"], "warm", "medium", "چای و آبشار؛ تازه و لطیف."),
  p("byredo-mojave-ghost", "Mojave Ghost", "Byredo", "unisex", [3, 0, 3, 1, 0, 0, 1], ["daily", "work"], "all", "medium", "گلِ چوبیِ صحرا؛ آرام و شفاف."),
  p("le-labo-another-13", "Another 13", "Le Labo", "unisex", [3, 0, 1, 1, 0, 3, 0], ["daily", "work"], "all", "medium", "مشکِ اَمبروکسان؛ تمیز و پوستی."),
  p("nishane-hacivat", "Hacivat", "Nishane", "unisex", [4, 3, 0, 2, 1, 0, 1], ["work", "party"], "all", "strong", "آناناس و چوب؛ باکلاس و پرحضور."),
  p("xerjoff-naxos", "Naxos", "Xerjoff", "unisex", [2, 0, 2, 4, 3, 0, 0], ["party"], "cold", "strong", "عسل و توتونِ اسطوخودوسی؛ مجلل و شیرین."),
  p("initio-ofg", "Oud for Greatness", "Initio", "unisex", [3, 0, 0, 1, 3, 5, 0], ["party"], "cold", "strong", "عود و زعفران؛ پرقدرت و باشکوه."),
  p("molecule-01", "Molecule 01", "Escentric Molecules", "unisex", [4, 0, 0, 0, 1, 1, 0], ["daily", "work"], "all", "light", "ایزو-ای-سوپر؛ چوبیِ مینیمال و پوستی."),
  p("kilian-angels-share", "Angels' Share", "Kilian", "unisex", [2, 0, 0, 5, 3, 0, 0], ["party"], "cold", "strong", "کنیاک و دارچین؛ گرم و اعتیادآور."),
  p("diptyque-philosykos", "Philosykos", "Diptyque", "unisex", [3, 2, 1, 0, 0, 0, 1], ["daily"], "warm", "light", "درخت انجیر؛ سبز و تابستانی."),
  p("hermes-jardin-nil", "Un Jardin sur le Nil", "Hermès", "unisex", [1, 4, 2, 0, 0, 0, 2], ["daily", "work"], "warm", "light", "انبه و مرکباتِ سبز؛ شاداب و آبکی."),
  p("mancera-cedrat-boise", "Cedrat Boisé", "Mancera", "unisex", [3, 4, 0, 2, 1, 0, 1], ["daily", "party"], "all", "strong", "لیمو و چوب؛ پرپخش و باطراوت."),
  p("replica-lsm", "Lazy Sunday Morning", "Maison Margiela", "unisex", [1, 0, 3, 1, 0, 2, 1], ["daily", "work"], "all", "light", "ملحفه‌ی تمیز و گلِ مشکی؛ نرم و آرام."),
  p("tf-ombre-leather", "Ombré Leather", "Tom Ford", "unisex", [3, 0, 1, 1, 1, 2, 0], ["party", "work"], "cold", "strong", "چرم و گلِ صحرایی؛ خام و باشخصیت."),
  p("kayali-vanilla-28", "Vanilla 28", "Kayali", "unisex", [1, 0, 1, 5, 1, 0, 0], ["party"], "cold", "strong", "وانیلِ کهربایی؛ شیرین و گرم."),
  p("tf-neroli-portofino", "Neroli Portofino", "Tom Ford", "unisex", [1, 5, 2, 0, 0, 0, 3], ["daily", "work"], "warm", "medium", "نرولی و مرکبات؛ تازه و مدیترانه‌ای."),
  p("replica-coffee-break", "Coffee Break", "Maison Margiela", "unisex", [1, 0, 0, 4, 2, 0, 0], ["daily"], "cold", "medium", "قهوه‌ی شیرین با شیر؛ دنج و صمیمی."),
  p("fm-musc-ravageur", "Musc Ravageur", "Frédéric Malle", "unisex", [2, 0, 1, 3, 3, 2, 0], ["party"], "cold", "strong", "مشک و ادویه؛ حسی و گرم."),
  p("byredo-bal-dafrique", "Bal d'Afrique", "Byredo", "unisex", [2, 3, 3, 1, 1, 0, 0], ["daily", "party"], "all", "medium", "نئرولی و بنفشه؛ سرزنده و هنری."),
  p("tf-rose-prick", "Rose Prick", "Tom Ford", "unisex", [2, 0, 4, 1, 2, 1, 0], ["party"], "all", "strong", "رزِ پرخار با ادویه؛ گستاخ و پرحضور."),
  p("tf-fucking-fabulous", "F. Fabulous", "Tom Ford", "unisex", [3, 0, 2, 2, 2, 1, 0], ["party"], "cold", "strong", "چرم و بادامِ تلخ؛ عجیب و اعتیادآور."),
  p("xerjoff-erba-pura", "Erba Pura", "Xerjoff", "unisex", [1, 3, 1, 4, 0, 0, 1], ["daily", "party"], "all", "strong", "میوه‌های شیرین و مرکبات؛ شاد و پرپخش."),
  p("jhag-not-a-perfume", "Not a Perfume", "Juliette Has a Gun", "unisex", [2, 0, 0, 1, 0, 1, 2], ["daily", "work"], "all", "light", "اَمبروکسِ تک‌نُت؛ تمیز و شفاف."),
];

/** Look up a perfume by id (used by the details route #/perfume/:id). */
export function getPerfumeById(id) {
  return PERFUMES.find((pf) => pf.id === id) || null;
}
