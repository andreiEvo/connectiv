export const CITIES = [
  { slug: "bucuresti", label: "București" },
  { slug: "cluj-napoca", label: "Cluj-Napoca" },
  { slug: "timisoara", label: "Timișoara" },
  { slug: "craiova", label: "Craiova" },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];

export const DEFAULT_CITY: CitySlug = "bucuresti";

export function cityLabel(slug: string): string {
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

export function categoryLabel(slug: string): string {
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

export function actionTypeLabel(slug: string): string {
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
