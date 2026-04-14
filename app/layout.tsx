import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import LocaleProvider from "@/components/providers/LocaleProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#030712",
};

export const metadata: Metadata = {
  title: "Tamer Murtazaoğlu",
  description: "Software Engineer specialized in Java & Spring Boot, scalable backend systems and CI/CD pipelines. Currently at Inomera, Istanbul.",
  authors: [{ name: "Tamer Murtazaoğlu" }],
  metadataBase: new URL("https://tamerm.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tamer Murtazaoğlu — Software Engineer",
    description: "Software Engineer specialized in Java & Spring Boot, scalable backend systems and CI/CD pipelines. Currently at Inomera, Istanbul.",
    type: "website",
    url: "https://tamerm.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamer Murtazaoğlu — Software Engineer",
    description: "Software Engineer specialized in Java & Spring Boot, scalable backend systems and CI/CD pipelines. Currently at Inomera, Istanbul.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >

      <body className="font-sans" suppressHydrationWarning>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
