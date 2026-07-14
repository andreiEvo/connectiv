import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Publicly reachable without a session.
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/api/health", "/terms", "/privacy"];
// Only these redirect an already-authenticated visitor away (to /feed) — the
// legal/health pages stay visible to logged-in users too.
const AUTH_ONLY_PATHS = ["/auth/login", "/auth/register"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some((p) => pathname.startsWith(p));
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    /\.(png|jpg|jpeg|svg|ico|webmanifest)$/.test(pathname);

  if (!user && !isPublicPath && !isStaticAsset) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return response;
}
