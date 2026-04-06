import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DefaultLayout from "@/layouts/default";

export default function DatenschutzPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="py-10 md:py-14 max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink mb-8">{t("datenschutz.title")}</h1>

        {/* Overview */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionPrinciple")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Website erhebt, speichert
            oder verarbeitet keinerlei personenbezogene Daten der Besucherinnen und Besucher.
          </p>
        </div>

        {/* No data collection */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionNoCollection")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Diese Website speichert keine personenbezogenen Daten. Es werden weder Name, Adresse,
            E-Mail-Adresse noch andere identifizierende Informationen erhoben oder gespeichert.
            Es findet keinerlei Nutzerverfolgung statt.
          </p>
        </div>

        {/* No cookies */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionNoCookies")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Diese Website setzt keine Cookies. Es werden keine Tracking-Cookies, Session-Cookies
            oder sonstige Cookies durch den Betreiber dieser Website gesetzt.
          </p>
          <p className="text-sm text-ink-tertiary mt-2 leading-relaxed">
            Hinweis: Ihr Browser oder Ihr Betriebssystem kann unabhängig davon eigene
            Mechanismen zur Zwischenspeicherung nutzen.
          </p>
        </div>

        {/* No analytics */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionNoTracking")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Diese Website verwendet keine Analyse-Werkzeuge, kein Web-Tracking und keine
            Dienste von Drittanbietern, die personenbezogene Daten erheben (z.B. Google Analytics,
            Matomo o.ä.). Es findet keine Auswertung des Nutzerverhaltens statt.
          </p>
        </div>

        {/* External API request */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionExternalApi")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Beim Aufruf dieser Website lädt Ihr Browser Umfragedaten direkt von der öffentlichen
            API unter{" "}
            <code className="text-xs bg-rule px-1 py-0.5 rounded">api.dawum.de</code> ab. Dabei
            stellt Ihr Browser eine Verbindung zu den Servern von dawum.de her. Auf die dabei
            ggf. verarbeiteten Daten hat der Betreiber dieser Website keinen Einfluss. Bitte
            beachten Sie die{" "}
            <a
              href="https://dawum.de/Datenschutz/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              Datenschutzerklärung von dawum.de
            </a>
            .
          </p>
        </div>

        {/* Hosting */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionHosting")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Diese Website wird als statische Webanwendung bereitgestellt. Der Hosting-Anbieter
            kann technische Zugriffsdaten (z.B. IP-Adresse, Zeitstempel) im Rahmen des normalen
            Serverbetriebs protokollieren. Auf diese Daten hat der Betreiber dieser Website
            keinen Zugriff und keinen Einfluss.
          </p>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("datenschutz.sectionContact")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Bei Fragen zum Datenschutz wenden Sie sich bitte an die im{" "}
            <Link
              to="/impressum"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              {t("datenschutz.linkImpressum")}
            </Link>{" "}
            angegebene Kontaktadresse.
          </p>
        </div>

        <div className="border-t border-rule pt-6 text-xs text-ink-tertiary flex gap-4">
          <Link
            to="/impressum"
            className="underline underline-offset-2 hover:text-accent transition-colors"
          >
            {t("datenschutz.linkImpressum")}
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
