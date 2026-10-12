"use client";

import { useTranslations } from "next-intl";

// A small client boundary for static copy in Server Components. Passing a
// message key keeps these labels responsive to the persisted language choice.
export function TranslatedText({
  messageKey,
  before = "",
  after = "",
}: {
  messageKey: string;
  before?: string;
  after?: string;
}) {
  const t = useTranslations();
  return (
    <>
      {before}
      {t(messageKey)}
      {after}
    </>
  );
}
