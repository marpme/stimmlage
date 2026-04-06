import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import DefaultLayout from "@/layouts/default";

function Section({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-10">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">
        {label}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-secondary leading-relaxed">{children}</p>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-ink-tertiary leading-relaxed border-l-2 border-rule pl-3 italic">
      {children}
    </p>
  );
}

function Formula({ children }: { children: string }) {
  return (
    <div className="py-3 px-4 bg-surface rounded overflow-x-auto text-sm">
      <BlockMath math={children} />
    </div>
  );
}

export default function MethodologyPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="py-10 md:py-14 max-w-2xl">
        <h1 className="text-2xl font-semibold text-ink mb-2">
          {t("methodology.title")}
        </h1>
        <p className="text-sm text-ink-tertiary mb-10 leading-relaxed">
          {t("methodology.intro")}
        </p>

        {/* 1. Data source */}
        <Section id="data-source" label={t("methodology.sectionDataSource")}>
          <P>
            Alle Rohdaten stammen aus der öffentlichen API von{" "}
            <a
              href="https://dawum.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent transition-colors"
            >
              dawum.de
            </a>
            . Jede Erhebung (<em>Survey</em>) enthält: ein Erhebungsinstitut,
            ein Datum, ein Zielparlament sowie Prozentwerte je Partei.
          </P>
          <Note>
            Stimmlage erhebt, verändert oder gewichtet keine Rohdaten. Die
            nachfolgenden Berechnungen aggregieren ausschließlich die von
            dawum.de veröffentlichten Werte.
          </Note>
        </Section>

        {/* 2. Current poll average */}
        <Section id="current-average" label={t("methodology.sectionCurrentAverage")}>
          <P>
            Der angezeigte aktuelle Umfragewert einer Partei ist der
            ungewichtete Durchschnitt der jeweils neuesten Erhebung pro
            Institut. Zunächst wird ein Zeitfenster der letzten 30 Tage
            geprüft:
          </P>
          <Formula>{`\\text{recentSurveys} = \\{\\, s \\in S \\mid t_{\\text{now}} - t_s \\leq 30\\text{ d}\\,\\}`}</Formula>
          <P>
            Enthält dieses Fenster Daten von mindestens zwei verschiedenen
            Instituten, wird es verwendet; andernfalls werden alle verfügbaren
            Erhebungen herangezogen:
          </P>
          <Formula>{`\\text{pool} = \\begin{cases} \\text{recentSurveys} & \\text{falls } |\\{\\text{Institute}\\}_{\\text{recent}}| \\geq 2 \\\\ S & \\text{sonst} \\end{cases}`}</Formula>
          <P>
            Aus dem Pool wird pro Institut nur die aktuellste Erhebung
            berücksichtigt (<InlineMath math="s_i^*" /> = neueste Erhebung von
            Institut <InlineMath math="i" />). Der Durchschnitt über alle{" "}
            <InlineMath math="n" /> Institute ergibt den angezeigten Wert:
          </P>
          <Formula>{`\\bar{v}_P = \\frac{1}{n}\\sum_{i=1}^{n} v_{P,\\,s_i^*}`}</Formula>
          <Note>
            Jedes Institut geht mit gleichem Gewicht ein — unabhängig von
            Stichprobengröße, Methodik oder Aktualität. Die Auswahl
            „aktuellste Erhebung je Institut" verhindert, dass ein Institut
            durch mehrere Veröffentlichungen überrepräsentiert wird.
          </Note>
        </Section>

        {/* 3. Five percent barrier */}
        <Section id="five-percent" label={t("methodology.sectionFivePercent")}>
          <P>
            Für die Sitzverteilung im Parlamentsrechner gelten nur Parteien als
            eingezogen, die die gesetzliche Sperrklausel erfüllen. Der Filter
            ist eine einfache Schwellenwertbedingung:
          </P>
          <Formula>{`\\text{eingezogen}(P) = \\begin{cases} \\text{ja} & \\bar{v}_P \\geq 5{,}0\\% \\\\ \\text{nein} & \\text{sonst} \\end{cases}`}</Formula>
          <P>
            Nutzerinnen und Nutzer können einzelne Parteien manuell als
            „Direktmandat" kennzeichnen. Diese Parteien werden unabhängig vom
            Umfragewert in die Berechnung aufgenommen:
          </P>
          <Formula>{`\\text{eingezogen}(P) = (\\bar{v}_P \\geq 5\\%) \\lor (P \\in \\text{directCandidates})`}</Formula>
          <Note>
            „Sonstige" (sonstige Parteien, die nicht einzeln ausgewiesen
            werden) sind von dieser Berechnung stets ausgeschlossen.
          </Note>
        </Section>

        {/* 4. Seat distribution */}
        <Section id="seats" label={t("methodology.sectionSeats")}>
          <P>
            Die Sitzzahl einer Partei im Donut-Diagramm wird proportional zum
            Stimmenanteil der eingezogenen Parteien berechnet (Hare/Niemeyer-
            ähnliche Proportionalverteilung auf die Gesamtzahl der Mandate{" "}
            <InlineMath math="M" />):
          </P>
          <Formula>{`\\text{seats}_P = \\text{round}\\!\\left(\\frac{\\bar{v}_P}{\\displaystyle\\sum_{Q \\in \\text{eingezogen}} \\bar{v}_Q} \\times M\\right)`}</Formula>
          <Note>
            Die Gesamtmandate <InlineMath math="M" /> sind je Parliament fest
            konfiguriert (z.B. 630 für den Bundestag). Die Visualisierung dient
            der Veranschaulichung von Mehrheitsverhältnissen und spiegelt nicht
            das tatsächliche Wahlrecht mit Überhang- und Ausgleichsmandaten
            wider.
          </Note>
        </Section>

        {/* 5. Trends */}
        <Section id="trends" label={t("methodology.sectionTrends")}>
          <P>
            Für jede Partei werden Trendwerte über 30 und 90 Tage ausgewiesen.
            Basis ist jeweils der Durchschnitt der aktuellsten Erhebung pro
            Institut zum Stichtag <InlineMath math="t_0" />:
          </P>
          <Formula>{`\\bar{v}_P(t_0) = \\frac{1}{n(t_0)}\\sum_{i=1}^{n(t_0)} v_{P,\\,s_i^*(t_0)}`}</Formula>
          <P>
            Der ausgewiesene Trend ist die Differenz zwischen dem aktuellen
            Wert und dem Stichtagsdurchschnitt:
          </P>
          <Formula>{`\\Delta_{30} = \\bar{v}_P(\\text{heute}) - \\bar{v}_P(t_{-30})`}</Formula>
          <Formula>{`\\Delta_{90} = \\bar{v}_P(\\text{heute}) - \\bar{v}_P(t_{-90})`}</Formula>
          <Note>
            Ein Trendwert wird nur berechnet, wenn zum jeweiligen Stichtag
            mindestens zwei Institute Daten liefern. Fehlen ausreichend Daten,
            wird kein Wert angezeigt.
          </Note>

          <P>
            Die <strong>Spanne</strong> (Spread) misst die Streuung zwischen
            den Instituten zum aktuellen Zeitpunkt:
          </P>
          <Formula>{`\\text{spread}_P = \\max_i(v_{P,s_i^*}) - \\min_i(v_{P,s_i^*})`}</Formula>
          <Note>
            Eine große Spanne deutet auf uneinheitliche Ergebnisse zwischen den
            Instituten hin. Die Spanne wird nur ausgewiesen, wenn mindestens
            zwei Institute vorliegen.
          </Note>
        </Section>

        {/* 6. Linear projection */}
        <Section id="projection" label={t("methodology.sectionProjection")}>
          <P>
            Die gestrichelte Projektionslinie im Zeitverlauf wird mittels
            einfacher linearer Regression (Methode der kleinsten Quadrate) über
            ein gleitendes Fenster der letzten 60 Tage berechnet. Zunächst
            werden alle Erhebungen in diesem Fenster nach Datum aggregiert:
          </P>
          <Formula>{`\\hat{v}_P(t) = \\frac{1}{m_t}\\sum_{j=1}^{m_t} v_{P,j}`}</Formula>
          <P>
            wobei <InlineMath math="m_t" /> die Anzahl der Institute ist, die
            am Tag <InlineMath math="t" /> eine Erhebung veröffentlicht haben.
            Daraus entstehen <InlineMath math="n \\geq 5" /> Datenpunkte{" "}
            <InlineMath math="(t_i,\\, y_i)" />. Die Regressionsgerade ergibt
            sich aus:
          </P>
          <Formula>{`\\bar{t} = \\frac{1}{n}\\sum_{i=1}^{n} t_i \\qquad \\bar{y} = \\frac{1}{n}\\sum_{i=1}^{n} y_i`}</Formula>
          <Formula>{`m = \\frac{\\displaystyle\\sum_{i=1}^{n}(t_i - \\bar{t})(y_i - \\bar{y})}{\\displaystyle\\sum_{i=1}^{n}(t_i - \\bar{t})^2} \\qquad b = \\bar{y} - m\\bar{t}`}</Formula>
          <P>
            Der projizierte Wert in 30 Tagen wird auf den gültigen Bereich
            geklemmt:
          </P>
          <Formula>{`\\hat{y}_{+30\\text{d}} = \\operatorname{clamp}\\bigl(m \\cdot t_{+30\\text{d}} + b,\\;[0,\\,100]\\bigr)`}</Formula>
          <Note>
            Die Projektion ist rein statistisch-extrapolativ und hat keinen
            prädiktiven Anspruch. Sie wird nur dargestellt, wenn mindestens 5
            aggregierte Datenpunkte im 60-Tage-Fenster vorliegen.
          </Note>
        </Section>

        {/* 7. Rolling average */}
        <Section id="rolling-average" label={t("methodology.sectionRollingAverage")}>
          <P>
            Die geglättete Kurve im Zeitverlauf basiert auf einem gleitenden
            14-Tage-Fenster. Für jeden Rohdatenpunkt{" "}
            <InlineMath math="i" /> mit Datum <InlineMath math="t_i" /> werden
            alle Punkte <InlineMath math="j \leq i" /> einbezogen, für die
            gilt:
          </P>
          <Formula>{`t_i - t_j \\leq 14\\text{ d}`}</Formula>
          <P>
            Der geglättete Wert an Stelle <InlineMath math="i" /> ist der
            ungewichtete Mittelwert dieser Fensterpunkte:
          </P>
          <Formula>{`\\tilde{v}_i = \\frac{1}{i - w_{\\text{start}} + 1}\\sum_{j=w_{\\text{start}}}^{i} v_j`}</Formula>
          <P>
            Zusätzlich werden monatliche Min/Max-Bänder dargestellt. Für jeden
            Kalendermonat <InlineMath math="k" /> gilt:
          </P>
          <Formula>{`\\text{band}_k = \\Bigl(\\min_{t_j \\in \\text{Monat}_k} v_j,\\;\\max_{t_j \\in \\text{Monat}_k} v_j\\Bigr)`}</Formula>
          <Note>
            In die Zeitverlaufs-Darstellung gehen nur Parteien ein, die in
            mindestens einer Erhebung einen Wert von ≥ 5 % erreicht haben.
          </Note>
        </Section>

        <div className="border-t border-rule pt-6 text-xs text-ink-tertiary flex gap-4">
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
        </div>
      </section>
    </DefaultLayout>
  );
}
