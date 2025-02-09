import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();
  const establishedYear = 2025;
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex flex-col items-center justify-center py-3">
        <div className="text-default-600">
          Made with ❤️ in Germany &mdash; ©{" "}
          {establishedYear - currentYear === 0
            ? establishedYear
            : `${establishedYear} - ${currentYear}`}
        </div>
        <div className="w-full flex items-center justify-center gap-1 py-3">
          Daten von
          <Link
            isExternal
            className="flex items-center gap-1"
            href="https://dawum.de/"
            title="Dawum - Neueste Wahlumfragen und Ergebnisse"
          >
            dawum.de
          </Link>
          licensed under
          <Link
            isExternal
            className="flex items-center gap-1 "
            href="https://opendatacommons.org/licenses/odbl/1-0/"
            title="Open Database License (ODbL) v1.0"
          >
            Open Database License (ODbL)
          </Link>
        </div>
        <p className="text-primary">HeroUI</p>
      </footer>
    </div>
  );
}
