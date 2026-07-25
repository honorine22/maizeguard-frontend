"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Leaf, Menu, X } from "lucide-react";

type NavbarProps = {
  /**
   * Set to true when the navbar is displayed over a light background.
   * The logo text, navigation labels, and mobile menu icon will be black.
   */
  darkText?: boolean;
};

export function Navbar({ darkText = false }: NavbarProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: "Project", href: "/#project" },
    { label: "How it works", href: "/#scan" },
    { label: "Workflow", href: "/#results" },
    { label: "Demo", href: "/#data" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {navItems.map((item) => (
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
          {/* CTA */}
          <a
            href="/#scan"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#2d7447] md:inline-flex"
          >
            View demo
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
            {navItems.map((item) => (
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
          </nav>
        </div>
      )}
    </header>
  );
}