import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import LanguageMenu from "@/components/i18n/LanguageMenu";
import { Menu, X } from "lucide-react";

export default function SiteNavBar() {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      if (y < 10) {
        setHidden(false);
      } else if (y > last + 4) {
        setHidden(true);
        setMenuOpen(false);
      } else if (y < last - 4) {
        setHidden(false);
      }
      last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#course", label: t("navCourse") },
    { href: "/#approach", label: t("navApproach") },
    { href: "/blog", label: t("navBlog") },
  ];

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
        hidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100",
        scrolled || menuOpen
          ? "border-b border-border/60 bg-background/95 shadow-[0_1px_20px_-8px_oklch(0_0_0/0.12)] backdrop-blur-md"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* Logo */}
        <a href="/" className="transition-opacity hover:opacity-80" aria-label={t("appName")}>
          <img src="/logo.png" alt={t("appName")} className="h-12 w-12 object-contain" />
        </a>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageMenu />
          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-out sm:hidden",
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <nav className="flex flex-col border-t border-border/60 px-5 py-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
