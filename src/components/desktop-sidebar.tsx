"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n/dictionary";
import { useLang } from "@/lib/i18n/language-provider";
import { Logo, Wordmark } from "@/components/logo";
import {
  HomeIcon,
  FeedIcon,
  MessageIcon,
  PlusIcon,
  SettingsIcon,
  ProfileIcon,
} from "@/components/nav-icons";

export function DesktopSidebar({ profileId }: { profileId: string }) {
  const pathname = usePathname();
  const lang = useLang();

  const items = [
    { href: "/home", label: t(lang, "nav_home"), icon: HomeIcon },
    { href: "/feed", label: t(lang, "nav_feed"), icon: FeedIcon },
    { href: "/messages", label: t(lang, "nav_messages"), icon: MessageIcon },
    { href: `/profile/${profileId}`, label: t(lang, "nav_profile"), icon: ProfileIcon, match: "/profile" },
    { href: "/settings", label: t(lang, "nav_settings"), icon: SettingsIcon },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border h-dvh sticky top-0 px-4 py-6">
      <Link href="/feed" className="flex items-center gap-2 px-2 mb-8">
        <Logo size={24} className="text-accent" />
        <Wordmark className="text-xl" />
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = pathname.startsWith(item.match ?? item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                active ? "bg-accent/10 text-accent" : "text-text-muted hover:bg-surface hover:text-text",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/compose"
        className="mt-6 flex items-center justify-center gap-2 h-11 rounded-lg bg-accent text-on-accent text-sm font-semibold hover:bg-accent/90 transition-colors duration-150"
      >
        <PlusIcon className="h-4 w-4" />
        {t(lang, "nav_compose")}
      </Link>
    </aside>
  );
}
