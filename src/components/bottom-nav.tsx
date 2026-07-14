"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n/dictionary";
import { useLang } from "@/lib/i18n/language-provider";

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
    <nav className="sticky bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function FeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 10l4 2.5L9 15V10z" fill="currentColor" />
    </svg>
  );
}
function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 5h16v11H8l-4 4V5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
