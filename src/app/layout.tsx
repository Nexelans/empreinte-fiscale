import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Empreinte Fiscale",
  description: "Visualisez votre relation financière avec l'État",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        {/* Skip to main content link - WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>

        <SessionProvider>
          <main id="main-content" tabIndex={-1} className="flex-grow">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
