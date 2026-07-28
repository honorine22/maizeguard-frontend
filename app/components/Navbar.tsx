"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Globe2, Leaf, Menu, X } from "lucide-react";
import { SupabaseAuthButtons } from "./SupabaseAuthButtons";

type Language = "en" | "rw" | "fr";

type NavbarProps = {
  /**
   * Set to true when the navbar is displayed over a light background.
   * The logo text, navigation labels, and mobile menu icon will be black.
   */
  darkText?: boolean;
  copy?: Partial<NavbarCopy>;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
};

type NavbarCopy = {
  home: string;
  dashboard: string;
  data: string;
  assessSample: string;
};

const defaultCopy: NavbarCopy = {
  home: "Home",
  dashboard: "Dashboard",
  data: "Data",
  assessSample: "Assess sample",
};

const languageNames: Record<Language, string> = {
  en: "EN",
  rw: "RW",
  fr: "FR",
};

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "rw" || value === "fr";
}

export function Navbar({
  darkText = false,
  copy: copyOverride,
  language: controlledLanguage,
  onLanguageChange,
}: NavbarProps) {
  const copy = { ...defaultCopy, ...copyOverride };
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [internalLanguage, setInternalLanguage] = useState<Language>("en");
  const language = controlledLanguage ?? internalLanguage;

  const navItems = [
    { label: copy.home, href: "/#project" },
    { label: copy.dashboard, href: "/dashboard" },
    { label: copy.data, href: "/#data" },
  ];
  const visibleNavItems = navItems.filter((item) => {
    if (pathname === "/" && item.href === "/#project") return false;
    if (pathname === "/dashboard" && item.href === "/dashboard") return false;
    return true;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (controlledLanguage) return;

    const stored = window.localStorage.getItem("maizeguard-language");
    if (isLanguage(stored)) setInternalLanguage(stored);
  }, [controlledLanguage]);

  function changeLanguage(nextLanguage: Language) {
    if (!controlledLanguage) setInternalLanguage(nextLanguage);
    window.localStorage.setItem("maizeguard-language", nextLanguage);
    onLanguageChange?.(nextLanguage);
  }

  /*
   * When the navbar has scrolled, the background becomes dark,
   * so the text automatically changes to white for readability.
   */
  const showDarkText = darkText && !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/70 shadow-lg shadow-black/20 backdrop-blur-md"
          : showDarkText
            ? "bg-white/90 backdrop-blur-md"
            : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        {/* Logo */}
        <a
          href="/#project"
          className={`flex items-center gap-2 text-lg font-semibold transition ${
            showDarkText ? "text-black" : "text-white"
          }`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
            <Leaf className="h-4 w-4" />
          </span>

          <span>
            <span className="text-[#d8a900]">MaizeGuard</span>{" "}
            <span>Rwanda</span>
          </span>
        </a>

        {/* Desktop navigation */}
        <nav
          className={`hidden items-center gap-8 text-sm font-medium md:flex ${
            showDarkText ? "text-black/75" : "text-white/85"
          }`}
        >
          {visibleNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`transition ${
                showDarkText
                  ? "hover:text-black"
                  : "hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector
            language={language}
            onChange={changeLanguage}
            darkText={showDarkText}
            className="hidden md:flex"
          />

          <SupabaseAuthButtons darkText={showDarkText} />

          {/* CTA */}
          <a
            href="/dashboard/scan"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#2d7447] md:inline-flex"
          >
            {copy.assessSample}
            <ArrowRight className="h-4 w-4" />
          </a>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setNavOpen((current) => !current)}
            aria-label="Toggle menu"
            aria-expanded={navOpen}
            className={`grid h-10 w-10 place-items-center rounded-lg transition md:hidden ${
              showDarkText
                ? "text-black hover:bg-black/5"
                : "text-white hover:bg-white/10"
            }`}
          >
            {navOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {navOpen && (
        <div
          className={`border-t backdrop-blur-md md:hidden ${
            showDarkText
              ? "border-black/10 bg-white"
              : "border-white/10 bg-black/90"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3">
            <div className="border-b border-inherit py-3">
              <LanguageSelector language={language} onChange={changeLanguage} darkText={showDarkText} />
            </div>
            {visibleNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={`border-b py-3 text-sm font-medium transition last:border-0 ${
                  showDarkText
                    ? "border-black/10 text-black/80 hover:text-black"
                    : "border-white/10 text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
            <div className="py-3">
              <SupabaseAuthButtons darkText={showDarkText} mobile />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LanguageSelector({
  language,
  onChange,
  darkText,
  className = "",
}: {
  language: Language;
  onChange: (language: Language) => void;
  darkText: boolean;
  className?: string;
}) {
  const tone = darkText
    ? "border-black/10 bg-white text-black shadow-sm"
    : "border-white/15 bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur";

  return (
    <label className={`relative flex min-w-[5.75rem] items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold ${tone} ${className}`}>
      <Globe2 className="h-4 w-4 shrink-0" />
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as Language)}
        className="min-w-0 flex-1 appearance-none bg-transparent pr-6 font-bold outline-none [&>option]:text-ink"
        aria-label="Language"
      >
        <option value="en">{languageNames.en}</option>
        <option value="rw">{languageNames.rw}</option>
        <option value="fr">{languageNames.fr}</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 shrink-0 opacity-80" />
    </label>
  );
}
