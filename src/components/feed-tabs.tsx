import Link from "next/link";
import { cn } from "@/lib/cn";

export function FeedTabs({ active }: { active: "for-you" | "following" }) {
  return (
    <div className="absolute top-3 inset-x-0 z-20 flex items-center justify-center gap-1">
      <TabLink href="/feed?tab=for-you" active={active === "for-you"}>
        Pentru tine
      </TabLink>
      <TabLink href="/feed?tab=following" active={active === "following"}>
        Urmăriți
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
