import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { LanguageProvider } from "@/lib/i18n/language-provider";
import { LANG_COOKIE, DEFAULT_LANG, type LangCode } from "@/lib/lang-cookie";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "connectiv",
  description:
    "Rețeaua video-first pentru oamenii din Cluj-Napoca, București, Timișoara și Craiova care construiesc ceva.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "connectiv",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111318",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get(LANG_COOKIE)?.value as LangCode) ?? DEFAULT_LANG;

  return (
    <html
      lang={lang}
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
