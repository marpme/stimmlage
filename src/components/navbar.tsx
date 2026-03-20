import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Logo } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { usePollData } from "@/hooks/usePollData.ts";

const LANDTAG_IDS = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"];

const navLinkClass = (isActive: boolean) =>
  `text-sm font-medium py-1 border-b-2 transition-[color,border-color] duration-200 ${
    isActive
      ? "text-accent border-accent"
      : "text-ink-tertiary border-transparent hover:text-ink hover:border-rule"
  }`;

// Hamburger icon
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    {open ? (
      <>
        <line x1="3" y1="3" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="3" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ) : (
      <>
        <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

export const Navbar = () => {
  const { t } = useTranslation();
  const { data: pollData } = usePollData();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandtagActive = LANDTAG_IDS.some(
    (id) => location.pathname === `/parliament/${id}`,
  );

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-paper border-b border-rule">
      <div className="container mx-auto max-w-7xl px-2 md:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0"
          aria-label={t("navbar.homeAriaLabel")}
          onClick={closeMobileMenu}
        >
          <Logo size={22} />
          <span className="text-sm font-bold tracking-tight text-ink">{t("navbar.home")}</span>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-6">
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

        {/* Right cluster: language + timestamp + mobile menu toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher />


          {/* Mobile hamburger — visible only on small screens */}
          <button
            className="sm:hidden flex items-center justify-center w-9 h-9 -mr-1 text-ink-tertiary hover:text-ink transition-colors"
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <HamburgerIcon open={mobileMenuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile drawer — slides down when open */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-rule bg-paper">
          <div className="container mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            <Link
              to="/parliament/0"
              className={`px-2 py-2.5 rounded text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                location.pathname === "/parliament/0"
                  ? "text-accent bg-accent/[0.06]"
                  : "text-ink-secondary hover:text-ink hover:bg-rule/40"
              }`}
              aria-current={location.pathname === "/parliament/0" ? "page" : undefined}
              onClick={closeMobileMenu}
            >
              {t("navbar.bundestag")}
            </Link>

            {/* Landtage as a flat list on mobile */}
            <details className="group">
              <summary
                className={`px-2 py-2.5 rounded text-sm font-medium cursor-pointer list-none flex items-center justify-between transition-colors min-h-[44px] ${
                  isLandtagActive
                    ? "text-accent bg-accent/[0.06]"
                    : "text-ink-secondary hover:text-ink hover:bg-rule/40"
                }`}
              >
                <span>{t("navbar.landtage")}</span>
                <svg
                  className="w-3.5 h-3.5 opacity-60 transition-transform group-open:rotate-180"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="pl-4 pb-1 flex flex-col gap-0.5 mt-0.5">
                {LANDTAG_IDS.filter((id) => pollData?.Parliaments[id]).map((id) => (
                  <Link
                    key={id}
                    to={`/parliament/${id}`}
                    className={`px-2 py-2 rounded text-sm transition-colors min-h-[44px] flex items-center ${
                      location.pathname === `/parliament/${id}`
                        ? "text-accent font-medium bg-accent/[0.06]"
                        : "text-ink-secondary hover:text-ink hover:bg-rule/40"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {pollData?.Parliaments[id]?.Name ?? id}
                  </Link>
                ))}
              </div>
            </details>

            <Link
              to="/parliament/17"
              className={`px-2 py-2.5 rounded text-sm font-medium transition-colors min-h-[44px] flex items-center ${
                location.pathname === "/parliament/17"
                  ? "text-accent bg-accent/[0.06]"
                  : "text-ink-secondary hover:text-ink hover:bg-rule/40"
              }`}
              aria-current={location.pathname === "/parliament/17" ? "page" : undefined}
              onClick={closeMobileMenu}
            >
              {t("navbar.eu")}
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
};
