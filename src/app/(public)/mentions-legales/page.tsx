import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales - Empreinte Fiscale",
  description: "Mentions légales et informations sur l'éditeur du site Empreinte Fiscale",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8" style={{ color: "var(--color-navy, #1A2332)" }}>
          Mentions légales
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Éditeur */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              1. Éditeur du site
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-2">
              <p><strong>Nom de l'application :</strong> Empreinte Fiscale</p>
              <p><strong>Éditeur :</strong> NEXELANS</p>
              <p><strong>Forme juridique :</strong> SAS (Société par Actions Simplifiée)</p>
              <p><strong>Siège social :</strong> 141 Chemin de la Basse Biousse, 38890 Saint-Chef, France</p>
              <p><strong>SIRET :</strong> 952 552 420 00012</p>
              <p><strong>SIREN :</strong> 952 552 420</p>
              <p><strong>RCS :</strong> Vienne</p>
              <p><strong>Capital social :</strong> 7 024,07 €</p>
              <p><strong>NAF/APE :</strong> 7022Z - Conseil pour les affaires et autres conseils de gestion</p>
              <p><strong>Email :</strong> <a href="mailto:contact@nexelans.fr" className="text-blue-600 hover:underline">contact@nexelans.fr</a></p>
              <p><strong>Téléphone :</strong> 09 72 02 75 90</p>
              <p><strong>Site web :</strong> <a href="https://www.nexelans.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.nexelans.fr</a></p>
              <p><strong>Directeur de la publication :</strong> Emmanuel Chaumery</p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              2. Hébergement
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-2">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com</a></p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-2 mt-4">
              <p><strong>Base de données :</strong> À définir lors du déploiement (Supabase, Railway ou Vercel Postgres)</p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              3. Propriété intellectuelle
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                L'ensemble du contenu de ce site (structure, textes, logos, images, vidéos, code source) est la propriété exclusive de NEXELANS, sauf mention contraire.
              </p>
              <p className="mb-4">
                Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans l'autorisation écrite préalable de NEXELANS.
              </p>
              <p>
                Le code source de l'application est disponible sur <a href="https://github.com/Nexelans/empreinte-fiscale" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>. Tous droits réservés.
              </p>
            </div>
          </section>

          {/* Données sources */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              4. Sources des données fiscales
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Les données fiscales, barèmes et statistiques utilisés dans l'application proviennent exclusivement de sources officielles :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>INSEE</strong> - Institut National de la Statistique et des Études Économiques</li>
                <li><strong>Direction du Budget</strong> - Projet de Loi de Finances (PLF)</li>
                <li><strong>DEPP</strong> - Direction de l'évaluation, de la prospective et de la performance (Éducation)</li>
                <li><strong>DREES</strong> - Direction de la recherche, des études, de l'évaluation et des statistiques (Santé/Social)</li>
                <li><strong>Legifrance</strong> - Service public de la diffusion du droit</li>
                <li><strong>data.gouv.fr</strong> - Plateforme ouverte des données publiques françaises</li>
              </ul>
              <p className="mt-4">
                Chaque donnée affichée dans l'application est traçable jusqu'à sa source officielle.
              </p>
            </div>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              5. Limitation de responsabilité
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Empreinte Fiscale s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
                Toutefois, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
              </p>
              <p className="mb-4">
                Les résultats fournis par l'application sont des <strong>estimations</strong> basées sur les données saisies par l'utilisateur
                et les barèmes officiels en vigueur. Ils ne constituent en aucun cas un avis fiscal ou juridique.
              </p>
              <p>
                Pour toute question fiscale personnalisée, nous vous recommandons de consulter un expert-comptable ou le service des impôts.
              </p>
            </div>
          </section>

          {/* CNIL */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              6. Protection des données personnelles (RGPD)
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
                vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.
              </p>
              <p className="mb-4">
                Pour plus d'informations sur la collecte et le traitement de vos données, consultez notre{" "}
                <a href="/confidentialite" className="text-blue-600 hover:underline font-semibold">
                  Politique de confidentialité
                </a>.
              </p>
              <p>
                <strong>Responsable du traitement des données :</strong> NEXELANS<br />
                <strong>Contact DPO :</strong> <a href="mailto:contact@nexelans.fr" className="text-blue-600 hover:underline">contact@nexelans.fr</a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              7. Cookies
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Le site utilise des cookies strictement nécessaires au fonctionnement de l'application (authentification, session).
              </p>
              <p>
                Aucun cookie de tracking ou publicitaire n'est utilisé. Vous pouvez à tout moment désactiver les cookies
                dans les paramètres de votre navigateur, mais cela peut affecter certaines fonctionnalités du site.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              8. Contact
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-2">
              <p className="mb-2">
                Pour toute question concernant ces mentions légales ou le fonctionnement du site :
              </p>
              <p>
                <strong>Email :</strong>{" "}
                <a href="mailto:contact@nexelans.fr" className="text-blue-600 hover:underline">
                  contact@nexelans.fr
                </a>
              </p>
              <p>
                <strong>Téléphone :</strong> 09 72 02 75 90
              </p>
              <p>
                <strong>Adresse postale :</strong> NEXELANS, 141 Chemin de la Basse Biousse, 38890 Saint-Chef, France
              </p>
            </div>
          </section>

          {/* Mise à jour */}
          <section className="text-sm text-gray-500 text-center pt-8 border-t">
            <p>Dernière mise à jour : Février 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}
