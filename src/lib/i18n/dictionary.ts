import type { LangCode } from "@/lib/lang-cookie";

const dictionary = {
  nav_home: { ro: "Home", en: "Home" },
  nav_feed: { ro: "Feed", en: "Feed" },
  nav_messages: { ro: "Mesaje", en: "Messages" },
  nav_compose: { ro: "Postează", en: "Post" },
  nav_settings: { ro: "Setări", en: "Settings" },
  nav_profile: { ro: "Profil", en: "Profile" },

  feed_tab_for_you: { ro: "Pentru tine", en: "For you" },
  feed_tab_following: { ro: "Urmăriți", en: "Following" },

  empty_feed_title: { ro: "Feed-ul e gol deocamdată", en: "The feed is empty for now" },
  empty_feed_description: {
    ro: "Fii primul care construiește ceva vizibil aici.",
    en: "Be the first to build something visible here.",
  },
  empty_following_title: { ro: "Nu urmărești pe nimeni încă", en: "You're not following anyone yet" },
  empty_following_description: {
    ro: "Urmărește progresul cuiva din Pentru tine ca să apară aici.",
    en: "Follow someone from For You to see them here.",
  },
  empty_home_title: { ro: "Nimic pe aici încă", en: "Nothing here yet" },
  empty_home_description: {
    ro: "Fii primul care construiește ceva vizibil în orașul tău.",
    en: "Be the first to build something visible in your city.",
  },
  empty_messages_title: { ro: "Nicio conversație încă", en: "No conversations yet" },
  empty_messages_description: {
    ro: "Pornește una din feed — continuă un chat, oferă sprijin, propune o cafea sau o colaborare.",
    en: "Start one from the feed — continue a chat, offer support, suggest coffee or a collaboration.",
  },
  empty_saved_title: { ro: "Nimic salvat încă", en: "Nothing saved yet" },
  empty_saved_description: {
    ro: "Salvează postări din feed ca să le găsești rapid aici.",
    en: "Save posts from the feed to find them quickly here.",
  },
  empty_posts_title: { ro: "Nicio postare încă", en: "No posts yet" },
  empty_posts_own: { ro: "Publică prima ta postare din butonul + de jos.", en: "Publish your first post from the + button below." },
  empty_posts_other: { ro: "Această persoană nu a publicat încă nimic.", en: "This person hasn't posted anything yet." },
  create_first_post: { ro: "Creează prima postare", en: "Create the first post" },

  action_chat: { ro: "Continuă în chat", en: "Continue in chat" },
  action_support: { ro: "Oferă sprijin la tranziție", en: "Offer transition support" },
  action_coffee: { ro: "Hai la o cafea", en: "Grab a coffee" },
  action_collab: { ro: "Propune colaborare", en: "Propose collaboration" },
  action_follow: { ro: "Urmărește progresul", en: "Follow progress" },
  action_following: { ro: "Urmărești", en: "Following" },
  action_save: { ro: "Salvează", en: "Save" },
  action_own_post: { ro: "Postarea ta", en: "Your post" },

  limit_title: { ro: "Ai folosit 5/5 conversații luna asta", en: "You've used 5/5 conversations this month" },
  limit_description: {
    ro: "Treci la Master Profile pentru conversații nelimitate și vizibilitate crescută în feed",
    en: "Upgrade to Master Profile for unlimited conversations and increased feed visibility",
  },
  limit_cancel: { ro: "Renunță", en: "Cancel" },
  limit_upgrade: { ro: "Treci la Master Profile", en: "Upgrade to Master Profile" },

  auth_login_title: { ro: "Bine ai revenit", en: "Welcome back" },
  auth_login_subtitle: { ro: "Intră în cont și continuă să construiești.", en: "Sign in and keep building." },
  auth_login_button: { ro: "Intră în cont", en: "Sign in" },
  auth_login_loading: { ro: "Se conectează…", en: "Signing in…" },
  auth_no_account: { ro: "Nu ai cont încă?", en: "Don't have an account yet?" },
  auth_create_one: { ro: "Creează unul", en: "Create one" },
  auth_register_title: { ro: "Hai să construim", en: "Let's build" },
  auth_register_subtitle: { ro: "Câteva detalii, apoi ești în feed.", en: "A few details, then you're in the feed." },
  auth_register_button: { ro: "Creează cont", en: "Create account" },
  auth_have_account: { ro: "Ai deja cont?", en: "Already have an account?" },
  auth_login_link: { ro: "Intră", en: "Sign in" },
} as const;

export type DictionaryKey = keyof typeof dictionary;

export function t(lang: LangCode, key: DictionaryKey): string {
  return dictionary[key][lang];
}
