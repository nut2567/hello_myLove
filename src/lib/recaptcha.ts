import "server-only";

export function getRecaptchaSiteKey(): string {
  // Read at request time so the same Docker image supports different domains.
  return process.env.RECAPTCHA_SITE_KEY?.trim() ?? "";
}

export async function verifyRecaptcha(token: unknown): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret || !getRecaptchaSiteKey() || typeof token !== "string" ||
      !token.trim() || token.length > 4096) return false;

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const result: unknown = await response.json();
    if (typeof result !== "object" || result === null) return false;
    const verification = result as Record<string, unknown>;
    // Also reject provider errors accompanying success (for example quota errors).
    return verification.success === true &&
      (!Array.isArray(verification["error-codes"]) || verification["error-codes"].length === 0);
  } catch {
    // Never log response tokens, keys, or upstream request details.
    return false;
  }
}
