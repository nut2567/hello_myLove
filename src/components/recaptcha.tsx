"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type RecaptchaProps = {
  siteKey: string;
  onChange: (token: string) => void;
};

export function Recaptcha({ siteKey, onChange }: RecaptchaProps) {
  const t = useTranslations("Recaptcha");
  const locale = useLocale();
  if (!siteKey) return <p role="alert" className="text-sm text-red-200">{t("notConfigured")}</p>;

  // Changing the key or language requires a fresh widget and response token.
  return <RecaptchaWidget key={`${siteKey}:${locale}`} siteKey={siteKey} locale={locale} onChange={onChange} />;
}

function RecaptchaWidget({ siteKey, locale, onChange }: RecaptchaProps & { locale: string }) {
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
    <div className="grid min-w-0 gap-3">
      <p className="text-sm text-muted-foreground">{t("instruction")}</p>
      <ReCAPTCHA ref={widgetRef} sitekey={siteKey} theme="dark" size="compact" hl={locale}
        className="min-h-[144px]"
        onChange={token => { setError(false); onChange(token ?? ""); }}
        onExpired={() => onChange("")} onErrored={handleError}
        asyncScriptOnLoad={(state?: { errored?: boolean }) => {
          if (state?.errored) handleError();
          else setReady(true);
        }} />
      {!ready && !error && <p role="status" className="text-xs text-muted-foreground">{t("loading")}</p>}
      {error && <p role="alert" className="text-sm text-red-200">{t("loadFailed")}</p>}
    </div>
  );
}
