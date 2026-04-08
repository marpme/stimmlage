import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const establishedYear = 2025;
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-2 md:px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full border-t border-rule py-6 px-2 md:px-6">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-tertiary">
          <span className="flex items-center gap-3">
            <span>
              {t("footer.madeIn")} &mdash; &copy;{" "}
              {establishedYear === currentYear
                ? establishedYear
                : `${establishedYear}–${currentYear}`}
            </span>
            <Link
              to="/daten"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              {t("footer.datasource")}
            </Link>
            <Link
              to="/methodik"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              {t("footer.methodology")}
            </Link>
            <Link
              to="/impressum"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              {t("footer.impressum")}
            </Link>
            <Link
              to="/datenschutz"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              {t("footer.datenschutz")}
            </Link>
          </span>
          <span className="flex items-center gap-1">
            {t("footer.dataLabel")}{" "}
            <a
              href="https://dawum.de/"
              target="_blank"
              rel="noopener noreferrer"
              title={t("footer.dataLinkTitle")}
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              dawum.de
            </a>
            {" "}{t("footer.licenseConnector")}{" "}
            <a
              href="https://opendatacommons.org/licenses/odbl/1-0/"
              target="_blank"
              rel="noopener noreferrer"
              title={t("footer.licenseLinkTitle")}
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              ODbL
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
