import type { LangCode } from "@/lib/lang-cookie";

export const CITIES = [
  { slug: "bucuresti", label: "București" },
  { slug: "cluj-napoca", label: "Cluj-Napoca" },
  { slug: "timisoara", label: "Timișoara" },
  { slug: "craiova", label: "Craiova" },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];

export const DEFAULT_CITY: CitySlug = "bucuresti";

// City names are proper nouns — same spelling in English, only diacritics are
// commonly dropped in English-language contexts.
const CITY_LABELS_EN: Record<CitySlug, string> = {
  bucuresti: "Bucharest",
  "cluj-napoca": "Cluj-Napoca",
  timisoara: "Timisoara",
  craiova: "Craiova",
};

export function cityLabel(slug: string, lang: LangCode = "ro"): string {
  if (lang === "en" && slug in CITY_LABELS_EN) return CITY_LABELS_EN[slug as CitySlug];
  return CITIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const CATEGORIES = [
  { slug: "side-hustle", label: "Side hustle" },
  { slug: "antreprenoriat", label: "Antreprenoriat" },
  { slug: "career-switch", label: "Career switch" },
  { slug: "colaborare", label: "Colaborare" },
  { slug: "caut-de-lucru", label: "Caut de lucru" },
  { slug: "eveniment", label: "Eveniment" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const CATEGORY_LABELS_EN: Record<CategorySlug, string> = {
  "side-hustle": "Side hustle",
  antreprenoriat: "Entrepreneurship",
  "career-switch": "Career switch",
  colaborare: "Collaboration",
  "caut-de-lucru": "Looking for work",
  eveniment: "Event",
};

export function categoryLabel(slug: string, lang: LangCode = "ro"): string {
  if (lang === "en" && slug in CATEGORY_LABELS_EN) return CATEGORY_LABELS_EN[slug as CategorySlug];
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

/** The 4 conversation-starting actions shown in the feed's action column. */
export const ACTION_TYPES = [
  { slug: "chat", label: "Continuă în chat", promptPrefix: "Salut! Am văzut ce construiești și aș vrea să continuăm discuția despre" },
  { slug: "sprijin", label: "Oferă sprijin la tranziție", promptPrefix: "Salut! Trec și eu printr-o tranziție de carieră și aș vrea să vorbim despre" },
  { slug: "cafea", label: "Hai la o cafea", promptPrefix: "Hai la o cafea să vorbim despre" },
  { slug: "colaborare", label: "Propune colaborare", promptPrefix: "Aș vrea să propun o colaborare pe" },
] as const;

export type ActionTypeSlug = (typeof ACTION_TYPES)[number]["slug"];

const ACTION_TYPE_LABELS_EN: Record<ActionTypeSlug, string> = {
  chat: "Continue in chat",
  sprijin: "Offer transition support",
  cafea: "Grab a coffee",
  colaborare: "Propose collaboration",
};

export function actionTypeLabel(slug: string, lang: LangCode = "ro"): string {
  if (lang === "en" && slug in ACTION_TYPE_LABELS_EN) {
    return ACTION_TYPE_LABELS_EN[slug as ActionTypeSlug];
  }
  return ACTION_TYPES.find((a) => a.slug === slug)?.label ?? slug;
}

export function actionTypePromptPrefix(slug: string): string {
  return ACTION_TYPES.find((a) => a.slug === slug)?.promptPrefix ?? "Salut! Legat de";
}

export const REACTION_KINDS = [
  { slug: "foc", label: "Foc" },
  { slug: "fulger", label: "Fulger" },
] as const;

export type ReactionKind = (typeof REACTION_KINDS)[number]["slug"];

export const ACCOUNT_TYPES = [
  { slug: "individual", label: "Cont personal" },
  { slug: "companie", label: "Cont companie" },
] as const;

export type AccountTypeSlug = (typeof ACCOUNT_TYPES)[number]["slug"];

const ACCOUNT_TYPE_LABELS_EN: Record<AccountTypeSlug, string> = {
  individual: "Personal account",
  companie: "Company account",
};

export function accountTypeLabel(slug: string, lang: LangCode = "ro"): string {
  if (lang === "en" && slug in ACCOUNT_TYPE_LABELS_EN) {
    return ACCOUNT_TYPE_LABELS_EN[slug as AccountTypeSlug];
  }
  return ACCOUNT_TYPES.find((a) => a.slug === slug)?.label ?? slug;
}

export const FREE_MONTHLY_CONVERSATIONS = 5;

export const MASTER_PROFILE_MONTHLY_PRICE_USD = 6;

/** Static seed list of real offline networking spots per city, surfaced by the "Hai la o cafea" action. */
export const MEETING_SPOTS: Record<CitySlug, { name: string; area: string }[]> = {
  bucuresti: [
    { name: "Verse Coffee", area: "SKY Tower, Barbu Văcărescu" },
    { name: "Anantea", area: "Orhideea Towers" },
    { name: "Beans & Dots", area: "Floreasca" },
  ],
  "cluj-napoca": [
    { name: "The Office Coffee Bar", area: "The Office Business Center" },
    { name: "Alt Shift Coffee", area: "Centru" },
    { name: "Nomad Skye Bar", area: "Centru" },
  ],
  timisoara: [
    { name: "Alfa Coffee", area: "Centru" },
    { name: "Ivan Torent", area: "Piața Unirii" },
    { name: "The Coffee Room", area: "Complex Openville" },
  ],
  craiova: [
    { name: "Diesel Cafe", area: "Centru" },
    { name: "Coffee Time", area: "Craiova Business Park" },
    { name: "Nord Est", area: "Centru" },
  ],
};
