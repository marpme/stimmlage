import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DefaultLayout from "@/layouts/default";

export default function ImpressumPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="py-10 md:py-14 max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink mb-8">{t("impressum.title")}</h1>

        {/* §5 TMG contact */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("impressum.sectionContact")}
          </h2>
          <p className="text-sm text-ink mt-3">
            {/* TODO: Replace with real contact email */}
            E-Mail:{" "}
            <span className="underline underline-offset-2">
              stimmlage.k55wx [at] 8shield [dot] net
            </span>
          </p>
        </div>

        {/* Non-affiliation */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("impressum.sectionNoAffiliation")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Dieses Projekt ist nicht mit einer politischen Partei verbunden,
            wird von keiner Partei finanziert und vertritt keine politische
            Partei. Die Darstellung von Parteien und Umfragedaten dient
            ausschließlich der neutralen Information und Visualisierung.
            Parteifarben werden ausschließlich als Datenkodierung verwendet und
            stellen keine politische Stellungnahme dar.
          </p>
          <p className="text-sm text-ink-tertiary mt-2 leading-relaxed">
            <em>
              This project is not affiliated with, funded by, or representing
              any political party shown in the data. Party colors are used
              solely as data encodings.
            </em>
          </p>
        </div>

        {/* Non-endorsement */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("impressum.sectionNoEndorsement")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Dieses Projekt befürwortet, unterstützt oder empfiehlt keine
            politische Partei, Kandidatin, keinen Kandidaten oder politische
            Position. Alle dargestellten Daten stammen aus öffentlich
            zugänglichen Umfragequellen und werden unverändert visualisiert.
            Eine Bewertung oder Empfehlung ist damit ausdrücklich nicht
            verbunden.
          </p>
          <p className="text-sm text-ink-tertiary mt-2 leading-relaxed">
            <em>
              No political opinion, party, or candidate is endorsed by this
              project or its maintainers.
            </em>
          </p>
        </div>

        {/* Data source */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("impressum.sectionDataSource")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Die dargestellten Umfragedaten stammen ausschließlich von{" "}
            <a
              href="https://dawum.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              dawum.de
            </a>{" "}
            und werden über deren öffentliche API bezogen. gelection erhebt,
            erzeugt oder besitzt keine eigenen Umfragedaten. Für Inhalt und
            Richtigkeit der Rohdaten ist dawum.de verantwortlich.
          </p>
        </div>

        {/* Open source */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            {t("impressum.sectionOpenSource")}
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Der Quellcode dieses Projekts ist unter der{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              MIT-Lizenz
            </a>{" "}
            veröffentlicht. Der vollständige Quellcode ist auf{" "}
            <a
              href="https://github.com/marpme/gelection"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              GitHub
            </a>{" "}
            verfügbar.
          </p>
        </div>

        <div className="border-t border-rule pt-6 text-xs text-ink-tertiary flex gap-4">
          <Link
            to="/datenschutz"
            className="underline underline-offset-2 hover:text-accent transition-colors"
          >
            {t("impressum.linkDatenschutz")}
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
