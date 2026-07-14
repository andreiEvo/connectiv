import { Logo, Wordmark } from "@/components/logo";
import { Tagline } from "@/components/tagline";
import { LanguageToggle } from "@/components/language-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
          <LanguageToggle />
        </div>
        <div className="flex flex-col items-center gap-2 mb-10">
          <Logo size={48} className="text-accent animate-bolt-pulse" />
          <Wordmark className="text-2xl" />
          <Tagline />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  );
}
