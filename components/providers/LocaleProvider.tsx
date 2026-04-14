"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import enMessages from "@/messages/en.json";
import trMessages from "@/messages/tr.json";

export type Locale = "en" | "tr";

interface LocaleCtx {
  locale: Locale;
  toggle: () => void;
}

const LocaleContext = createContext<LocaleCtx>({
  locale: "en",
  toggle: () => {},
});

export const useLocaleToggle = () => useContext(LocaleContext);

const MESSAGES: Record<Locale, AbstractIntlMessages> = {
  en: enMessages as unknown as AbstractIntlMessages,
  tr: trMessages as unknown as AbstractIntlMessages,
};

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const toggle = useCallback(() => {
    setLocale((l) => (l === "en" ? "tr" : "en"));
  }, []);

  // Keep <html lang="…"> in sync for accessibility / SEO
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, toggle }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Europe/Istanbul">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
