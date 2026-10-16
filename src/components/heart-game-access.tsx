"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { verifyHeartGameAccess } from "@/app/(site)/th/heart/actions";
import { getCurrentTimestamp } from "@/lib/date-time";
import { Recaptcha } from "@/components/recaptcha";

export function HeartGameAccess({ children, initialExpiry, siteKey }: {
  children: ReactNode;
  initialExpiry: number | null;
  siteKey: string;
}) {
  const t = useTranslations("Recaptcha");
  const [expiresAt, setExpiresAt] = useState(initialExpiry);
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const timeout = window.setTimeout(() => setExpiresAt(null), Math.max(0, expiresAt - getCurrentTimestamp()));
    return () => window.clearTimeout(timeout);
  }, [expiresAt]);

  async function verify() {
    if (!token || pending) return;
    setPending(true);
    setError(false);
    try {
      const result = await verifyHeartGameAccess(token);
      if (result.ok) setExpiresAt(result.expiresAt);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setToken("");
      setAttempt(value => value + 1);
      setPending(false);
    }
  }

  if (expiresAt) return children;

  return (
    <section className="grid w-full place-items-center overflow-y-auto px-3 py-8 sm:px-5">
      <div className="pixel-panel grid w-full max-w-md gap-5 p-4 sm:p-7">
        <h1 className="text-balance text-center text-xl font-bold leading-8 text-lime-200">{t("heartTitle")}</h1>
        <Recaptcha key={attempt} siteKey={siteKey} onChange={setToken} />
        {error && <p role="alert" className="text-center text-sm leading-6 text-red-200">{t("verificationFailed")}</p>}
        <button type="button" className="pixel-button min-h-12 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending || !token} onClick={() => void verify()}>
          {t(pending ? "verifying" : "startGame")}
        </button>
      </div>
    </section>
  );
}
