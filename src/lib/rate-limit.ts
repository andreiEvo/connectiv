import { createClient } from "@/lib/supabase/server";

/**
 * Sliding-window rate limit backed by the rate_limit_events table (no Redis —
 * we stayed on Supabase per the infra decision). Returns false when the caller
 * should be blocked. Old rows for the same key are pruned on every check so
 * the table doesn't grow unbounded.
 */
export async function checkRateLimit(
  key: string,
  opts: { limit: number; windowSeconds: number },
): Promise<boolean> {
  const supabase = await createClient();
  const since = new Date(Date.now() - opts.windowSeconds * 1000).toISOString();

  const { count } = await supabase
    .from("rate_limit_events")
    .select("*", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", since);

  if ((count ?? 0) >= opts.limit) {
    return false;
  }

  await supabase.from("rate_limit_events").insert({ key });
  await supabase.from("rate_limit_events").delete().eq("key", key).lt("created_at", since);

  return true;
}

export async function clientIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}
