import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import LanguageMenu from "@/components/i18n/LanguageMenu";

export default function SiteNavBar() {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      if (y < 10) {
        setHidden(false);
      } else if (y > last + 4) {
        setHidden(true);   // scrolling down
      } else if (y < last - 4) {
        setHidden(false);  // scrolling up
      }
      last = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
        hidden ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100",
        scrolled
          ? "border-b border-border/60 bg-background/85 shadow-[0_1px_20px_-8px_oklch(0_0_0/0.12)] backdrop-blur-md"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        {/* Logo */}
        <a href="/" className="transition-opacity hover:opacity-80" aria-label={t("appName")}>
          <img src="/logo.png" alt={t("appName")} className="h-12 w-12 object-contain" />
        </a>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          <a href="/#course" className="transition-colors hover:text-foreground">{t("navCourse")}</a>
          <a href="/#approach" className="transition-colors hover:text-foreground">{t("navApproach")}</a>
          <a href="/blog" className="transition-colors hover:text-foreground">{t("navBlog")}</a>
        </nav>

        {/* Right: language + mobile menu */}
        <LanguageMenu />
      </div>
    </header>
  );
}
