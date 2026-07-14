import { Logo, Wordmark } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-10">
          <Logo size={26} className="text-accent" />
          <Wordmark className="text-2xl" />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  );
}
