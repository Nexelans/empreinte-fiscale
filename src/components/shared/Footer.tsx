import Link from "next/link";
import { Mail, Github, FileText, Shield, HelpCircle, BookOpen } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* À propos */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Empreinte Fiscale
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Application transparente, non-partisane et sourcée pour visualiser votre relation financière avec l'État.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/Nexelans/empreinte-fiscale"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:contact@empreinte-fiscale.fr"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Contact"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Aide & Support */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-gray-900">Aide & Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tutoriel"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <BookOpen size={16} />
                  Tutoriel
                </Link>
              </li>
              <li>
                <Link
                  href="/aide"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <HelpCircle size={16} />
                  Centre d'aide & FAQ
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@empreinte-fiscale.fr"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contactez-nous
                </a>
              </li>
            </ul>
          </div>

          {/* Découvrir */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-gray-900">Découvrir</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/decouverte"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Mode Découverte
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Quiz Fiscal
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-gray-900">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <FileText size={16} />
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <Shield size={16} />
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/cgu"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Empreinte Fiscale. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-400">
              Données sources : INSEE, PLF 2026, DEPP, DREES • Mise à jour : Janvier 2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
