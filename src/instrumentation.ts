export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
      enabled: !!process.env.SENTRY_DSN,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.2,
      enabled: !!process.env.SENTRY_DSN,
    });
  }
}

export async function onRequestError(
  ...args: Parameters<NonNullable<typeof import("@sentry/nextjs").captureRequestError>>
) {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
