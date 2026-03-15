import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Logo } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLatestUpdateTime } from "@/hooks/useLatestUpdateTime.ts";
import { usePollData } from "@/hooks/usePollData.ts";

const LANDTAG_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];

const navLinkClass = (isActive: boolean) =>
  `text-sm font-medium py-1 border-b-2 transition-[color,border-color] duration-200 ${
    isActive
      ? "text-accent border-accent"
      : "text-ink-tertiary border-transparent hover:text-ink hover:border-rule"
  }`;

export const Navbar = () => {
  const { t } = useTranslation();
  const { data: lastUpdatedData } = useLatestUpdateTime();
  const { data: pollData } = usePollData();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandtagActive = LANDTAG_IDS.some(
    (id) => location.pathname === `/parliament/${id}`,
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper border-b border-rule">
      <div className="container mx-auto max-w-7xl px-2 md:px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0" aria-label={t("navbar.homeAriaLabel")}>
          <Logo size={22} />
          <span className="text-sm font-bold tracking-tight text-ink">{t("navbar.home")}</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            to="/parliament/0"
            className={navLinkClass(location.pathname === "/parliament/0")}
            aria-current={location.pathname === "/parliament/0" ? "page" : undefined}
          >
            {t("navbar.bundestag")}
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`${navLinkClass(isLandtagActive)} flex items-center gap-1 cursor-pointer`}
                aria-current={isLandtagActive ? "page" : undefined}
              >
                {t("navbar.landtage")}
                <svg className="w-3 h-3 opacity-60" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-48 bg-paper border border-rule rounded-lg shadow-sm py-1 z-50 data-[state=open]:animate-fade-up data-[state=closed]:animate-fade-in [animation-duration:150ms]"
                sideOffset={8}
                align="start"
              >
                {LANDTAG_IDS.filter((id) => pollData?.Parliaments[id]).map((id) => (
                  <DropdownMenu.Item
                    key={id}
                    className={`px-3 py-1.5 text-sm cursor-pointer outline-none transition-colors ${
                      location.pathname === `/parliament/${id}`
                        ? "text-accent font-medium"
                        : "text-ink-secondary hover:text-ink hover:bg-rule/40"
                    }`}
                    onSelect={() => navigate(`/parliament/${id}`)}
                  >
                    {pollData?.Parliaments[id]?.Name ?? id}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Link
            to="/parliament/17"
            className={navLinkClass(location.pathname === "/parliament/17")}
            aria-current={location.pathname === "/parliament/17" ? "page" : undefined}
          >
            {t("navbar.eu")}
          </Link>
        </div>

        {/* Language + Data freshness */}
        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher />

          {lastUpdatedData && (
            <span className="text-xs text-ink-tertiary tabular-nums">
              {lastUpdatedData.formatedLastUpdated}
            </span>
          )}
        </div>

      </div>
    </nav>
  );
};
