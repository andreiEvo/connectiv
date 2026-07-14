import Link from "next/link";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n/dictionary";
import type { LangCode } from "@/lib/lang-cookie";

export function FeedTabs({ active, lang }: { active: "for-you" | "following"; lang: LangCode }) {
  return (
    <div className="absolute top-3 inset-x-0 z-20 flex items-center justify-center gap-1">
      <TabLink href="/feed?tab=for-you" active={active === "for-you"}>
        {t(lang, "feed_tab_for_you")}
      </TabLink>
      <TabLink href="/feed?tab=following" active={active === "following"}>
        {t(lang, "feed_tab_following")}
      </TabLink>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 backdrop-blur-sm",
        active
          ? "bg-accent text-on-accent"
          : "bg-black/35 text-white/80 hover:text-white border border-white/10",
      )}
    >
      {children}
    </Link>
  );
}
