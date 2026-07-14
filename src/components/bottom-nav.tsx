"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n/dictionary";
import { useLang } from "@/lib/i18n/language-provider";
import {
  HomeIcon,
  FeedIcon,
  MessageIcon,
  PlusIcon,
  SettingsIcon,
  ProfileIcon,
} from "@/components/nav-icons";

export function BottomNav({ profileId }: { profileId: string }) {
  const pathname = usePathname();
  const lang = useLang();

  const items = [
    { href: "/home", label: t(lang, "nav_home"), icon: HomeIcon },
    { href: "/feed", label: t(lang, "nav_feed"), icon: FeedIcon },
    { href: "/messages", label: t(lang, "nav_messages"), icon: MessageIcon },
    { href: "/compose", label: t(lang, "nav_compose"), icon: PlusIcon, isCompose: true },
    { href: "/settings", label: t(lang, "nav_settings"), icon: SettingsIcon },
  ];

  return (
    <nav className="lg:hidden sticky bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="flex items-stretch justify-around h-20 max-w-lg mx-auto">
        {items.map((item) => {
          const href = item.href === "/profile" ? `/profile/${profileId}` : item.href;
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCompose) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center flex-1"
              >
                <span className="flex items-center justify-center h-[52px] w-[52px] rounded-full bg-accent text-on-accent transition-transform duration-150 active:scale-90 hover:scale-105">
                  <Icon className="h-6 w-6" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={href}
              aria-label={item.label}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150",
                active ? "text-accent" : "text-text-muted hover:text-text",
              )}
            >
              <Icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href={`/profile/${profileId}`}
          aria-label={t(lang, "nav_profile")}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-150",
            pathname.startsWith("/profile") ? "text-accent" : "text-text-muted hover:text-text",
          )}
        >
          <ProfileIcon className="h-6 w-6" />
          {t(lang, "nav_profile")}
        </Link>
      </div>
    </nav>
  );
}
