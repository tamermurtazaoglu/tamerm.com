import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";

// Locale routing is handled client-side via LocaleProvider.
// This provides the SSR fallback so next-intl doesn't warn during static generation.
export default getRequestConfig(async () => {
  const messages = (await import("../messages/en.json")).default;
  return {
    locale: "en",
    timeZone: "Europe/Istanbul",
    messages: messages as unknown as AbstractIntlMessages,
  };
});
