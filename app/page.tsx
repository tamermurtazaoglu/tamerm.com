"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocaleToggle } from "@/components/providers/LocaleProvider";

import OrbField from "@/components/canvas/OrbField";
import CustomCursor from "@/components/cursor/CustomCursor";
import Spotlight from "@/components/layout/Spotlight";
import HeroSection from "@/components/hero/HeroSection";
import CvModal from "@/components/modals/CvModal";
import TerminalModal from "@/components/modals/TerminalModal";
import VisitorCard from "@/components/ui/VisitorCard";
import Toast from "@/components/ui/Toast";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const t = useTranslations();
  const { locale } = useLocaleToggle();
  const [cvOpen, setCvOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Console easter egg
  useEffect(() => {
    console.log(
      "%c  tamerm.com  ",
      "background:#6366f1;color:#fff;font-size:14px;font-weight:bold;padding:6px 18px;border-radius:6px;"
    );
    console.log(
      "%cHey there, fellow developer! 👋\nLike what you see? The source is on GitHub.",
      "color:#94a3b8;font-size:12px;line-height:1.6;"
    );
  }, []);

  // Global keyboard shortcut: / or ` opens terminal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" || e.key === "`") {
        const active = document.activeElement;
        if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
        e.preventDefault();
        setTermOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Animated background */}
      <OrbField />

      {/* Custom cursor (desktop only) */}
      <CustomCursor />

      {/* Mouse spotlight */}
      <Spotlight />

      {/* Ambient glow orbs (CSS) */}
      <div aria-hidden="true" className="fixed inset-0 z-[1] pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] -left-[14%] -top-[20%] rounded-full
                     animate-amb-drift-a"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] -right-[12%] -bottom-[16%] rounded-full
                     animate-amb-drift-b"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* Hero — keyed to locale so scramble + entrance animations replay on language switch */}
      <HeroSection
        key={locale}
        onOpenTerminal={() => setTermOpen(true)}
        onOpenCv={() => setCvOpen(true)}
      />

      {/* Modals */}
      <CvModal
        open={cvOpen}
        onClose={() => setCvOpen(false)}
        onDownload={() => setToastVisible(true)}
      />
      <TerminalModal open={termOpen} onClose={() => setTermOpen(false)} />

      {/* Visitor context card */}
      <VisitorCard />

      {/* Toast */}
      <Toast
        message={t("toast")}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {/* Footer */}
      <Footer onOpenTerminal={() => setTermOpen(true)} />
    </>
  );
}
