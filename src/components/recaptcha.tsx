"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type RecaptchaProps = {
  siteKey: string;
  onChange: (token: string) => void;
};

type WidgetSize = "normal" | "compact";

export function Recaptcha({ siteKey, onChange }: RecaptchaProps) {
  const t = useTranslations("Recaptcha");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<WidgetSize | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Measure the available card space, including text-size preference changes.
    const observer = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect.width >= 304 ? "normal" : "compact");
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [siteKey]);

  if (!siteKey) return <p role="alert" className="text-sm text-red-200">{t("notConfigured")}</p>;

  return (
    <div className="grid w-full min-w-0 gap-4">
      <p className="text-center text-sm leading-6 text-muted-foreground">{t("instruction")}</p>
      <div ref={containerRef} className="grid min-h-[110px] min-w-0 place-items-center border-y border-border/30 bg-muted/20 py-4">
        {size ? (
          // Each layout or language change requires a fresh response token.
          <RecaptchaWidget key={`${siteKey}:${locale}:${size}`} siteKey={siteKey} locale={locale} size={size} onChange={onChange} />
        ) : <p role="status" className="text-center text-xs text-muted-foreground">{t("loading")}</p>}
      </div>
    </div>
  );
}

function RecaptchaWidget({ siteKey, locale, size, onChange }: RecaptchaProps & { locale: string; size: WidgetSize }) {
  const t = useTranslations("Recaptcha");
  const widgetRef = useRef<ReCAPTCHA>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const widget = widgetRef.current;
    onChange("");
    return () => widget?.reset();
  }, [onChange]);

  function handleError() {
    onChange("");
    setError(true);
  }

  return (
    <div className="grid w-full min-w-0 justify-items-center gap-3">
      <ReCAPTCHA ref={widgetRef} sitekey={siteKey} theme="dark" size={size} hl={locale}
        className={size === "normal" ? "h-[78px]" : "h-[144px]"}
        onChange={token => { setError(false); onChange(token ?? ""); }}
        onExpired={() => onChange("")} onErrored={handleError}
        asyncScriptOnLoad={(state?: { errored?: boolean }) => {
          if (state?.errored) handleError();
          else setReady(true);
        }} />
      {!ready && !error && <p role="status" className="text-center text-xs text-muted-foreground">{t("loading")}</p>}
      {error && <p role="alert" className="px-3 text-center text-sm leading-6 text-red-200">{t("loadFailed")}</p>}
    </div>
  );
}
