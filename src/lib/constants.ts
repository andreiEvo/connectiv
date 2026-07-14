export const CITIES = [
  { slug: "cluj-napoca", label: "Cluj-Napoca" },
  { slug: "bucuresti", label: "București" },
  { slug: "timisoara", label: "Timișoara" },
  { slug: "craiova", label: "Craiova" },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];

export const DEFAULT_CITY: CitySlug = "cluj-napoca";

export function cityLabel(slug: string): string {
  return CITIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const CATEGORIES = [
  { slug: "side-hustle", label: "Side hustle" },
  { slug: "antreprenoriat", label: "Antreprenoriat" },
  { slug: "career-switch", label: "Career switch" },
  { slug: "colaborare", label: "Colaborare" },
  { slug: "caut-de-lucru", label: "Caut de lucru" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const ACTION_TYPES = [
  { slug: "sfat", label: "Sfat", promptPrefix: "Aș vrea un sfat despre" },
  { slug: "cafea", label: "Cafea", promptPrefix: "Hai la o cafea să vorbim despre" },
  { slug: "colaborare", label: "Colaborare", promptPrefix: "Aș vrea să propun o colaborare pe" },
] as const;

export type ActionTypeSlug = (typeof ACTION_TYPES)[number]["slug"];

export function actionTypeLabel(slug: string): string {
  return ACTION_TYPES.find((a) => a.slug === slug)?.label ?? slug;
}

export function actionTypePromptPrefix(slug: string): string {
  return ACTION_TYPES.find((a) => a.slug === slug)?.promptPrefix ?? "Salut! Legat de";
}

export const FREE_MONTHLY_CONVERSATIONS = 5;

export const PREMIUM_MONTHLY_PRICE_EUR = 18;

/** Static seed list of real offline networking spots per city, surfaced by the "Hai la o cafea" action. */
export const MEETING_SPOTS: Record<CitySlug, { name: string; area: string }[]> = {
  "cluj-napoca": [
    { name: "The Office Coffee Bar", area: "The Office Business Center" },
    { name: "Alt Shift Coffee", area: "Centru" },
    { name: "Nomad Skye Bar", area: "Centru" },
  ],
  bucuresti: [
    { name: "Verse Coffee", area: "SKY Tower, Barbu Văcărescu" },
    { name: "Anantea", area: "Orhideea Towers" },
    { name: "Beans & Dots", area: "Floreasca" },
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
