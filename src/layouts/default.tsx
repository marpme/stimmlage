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
      <main className="container mx-auto max-w-7xl px-2 md:px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex flex-col items-center justify-center py-3">
        <div className="text-default-600">
          Made with ❤️ in Germany &mdash; ©{" "}
          {establishedYear - currentYear === 0
            ? establishedYear
            : `${establishedYear} - ${currentYear}`}
        </div>
        <div className="flex items-center justify-center gap-1 pt-4">
          License: Data retrieved from
          <Link
            isExternal
            href="https://dawum.de/"
            title="Dawum - Neueste Wahlumfragen und Ergebnisse"
          >
            dawum.de
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1">
          licensed under
          <Link
            isExternal
            href="https://opendatacommons.org/licenses/odbl/1-0/"
            title="Open Database License (ODbL) v1.0"
          >
            Open Database License (ODbL)
          </Link>
        </div>
      </footer>
    </div>
  );
}
