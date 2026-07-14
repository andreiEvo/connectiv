import Link from "next/link";
import { Logo, Wordmark } from "@/components/logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border">
        <div className="flex items-center h-14 max-w-2xl mx-auto px-4">
          <Link href="/" className="flex items-center gap-1.5">
            <Logo size={20} className="text-accent" />
            <Wordmark className="text-base" />
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-8 prose-legal">{children}</main>
      <footer className="border-t border-border py-4">
        <p className="text-xs text-text-muted text-center">
          © {new Date().getFullYear()} connectiv. Toate drepturile rezervate.
        </p>
      </footer>
    </div>
  );
}
