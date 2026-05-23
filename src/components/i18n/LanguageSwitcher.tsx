import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import LanguageMenu from "@/components/i18n/LanguageMenu";

export default function LanguageSwitcher() {
  return (
    <LocaleProvider>
      <LanguageMenu />
    </LocaleProvider>
  );
}
