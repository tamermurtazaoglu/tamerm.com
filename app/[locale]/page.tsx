import { redirect } from "next/navigation";

// Locale-based routing removed. Redirect old /en/ and /tr/ URLs to root.
export default function LocaleRedirect() {
  redirect("/");
}
