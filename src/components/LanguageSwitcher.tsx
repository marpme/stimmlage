import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pl", label: "Polski" },
] as const;

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language.split("-")[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1 text-xs font-medium text-ink-tertiary hover:text-ink transition-colors cursor-pointer"
          aria-label="Select language"
        >
          <span className="uppercase tracking-wide">{current}</span>
          <svg className="w-3 h-3 opacity-60" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-36 bg-paper border border-rule rounded-lg shadow-sm py-1 z-50 data-[state=open]:animate-fade-up data-[state=closed]:animate-fade-in [animation-duration:150ms]"
          sideOffset={8}
          align="end"
        >
          {LANGUAGES.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              className={`px-3 py-1.5 text-sm cursor-pointer outline-none transition-colors flex items-center justify-between gap-3 ${
                current === lang.code
                  ? "text-accent font-medium"
                  : "text-ink-secondary hover:text-ink hover:bg-rule/40"
              }`}
              onSelect={() => i18n.changeLanguage(lang.code)}
            >
              <span>{lang.label}</span>
              <span className="text-[10px] uppercase tracking-widest text-ink-tertiary font-mono">{lang.code}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
