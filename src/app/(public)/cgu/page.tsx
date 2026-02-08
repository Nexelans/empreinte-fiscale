import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - Empreinte Fiscale",
  description: "Conditions générales d'utilisation du service Empreinte Fiscale",
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8" style={{ color: "var(--color-navy, #1A2332)" }}>
          Conditions Générales d'Utilisation
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded">
          <p className="text-blue-900 text-sm">
            <strong>Date d'entrée en vigueur :</strong> Janvier 2026<br />
            En utilisant Empreinte Fiscale, vous acceptez ces conditions. Si vous n'êtes pas d'accord, veuillez ne pas utiliser le service.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Article 1 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 1 - Objet
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités d'accès et d'utilisation
                du service <strong>Empreinte Fiscale</strong>, application web permettant aux citoyens français de visualiser
                leur relation financière avec l'État.
              </p>
              <p>
                Le service est accessible gratuitement à tout utilisateur disposant d'un accès à Internet.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 2 - Définitions
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ul className="space-y-2">
                <li><strong>Service :</strong> L'application web Empreinte Fiscale accessible à l'adresse [URL].</li>
                <li><strong>Utilisateur :</strong> Toute personne accédant au Service, avec ou sans compte.</li>
                <li><strong>Compte :</strong> Espace personnel créé par l'Utilisateur pour accéder aux fonctionnalités personnalisées.</li>
                <li><strong>Score fiscal :</strong> Résultat du calcul personnalisé basé sur les données saisies par l'Utilisateur.</li>
                <li><strong>Référentiel :</strong> Base de données contenant les barèmes fiscaux et statistiques officielles.</li>
              </ul>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 3 - Accès au Service
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div>
                <h3 className="font-semibold mb-2">3.1 Accès libre (Mode Découverte)</h3>
                <p className="text-gray-600 text-sm">
                  Certaines fonctionnalités (profils types, quiz, comparaisons internationales) sont accessibles
                  sans création de compte.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3.2 Accès avec compte</h3>
                <p className="text-gray-600 text-sm">
                  Pour accéder au calcul personnalisé de votre score fiscal, vous devez créer un compte avec :
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-4 mt-2">
                  <li>Une adresse email valide</li>
                  <li>Un mot de passe sécurisé (minimum 8 caractères)</li>
                  <li>L'acceptation des présentes CGU et de la Politique de confidentialité</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3.3 Conditions d'accès</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                  <li>Avoir 18 ans minimum ou l'autorisation parentale</li>
                  <li>Fournir des informations exactes lors de l'inscription</li>
                  <li>Ne pas usurper l'identité d'une autre personne</li>
                  <li>Maintenir la confidentialité de vos identifiants</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 4 - Nature du Service
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mb-4">
                <p className="font-semibold text-amber-900 mb-2">⚠️ Avertissement important</p>
                <p className="text-amber-800 text-sm">
                  Empreinte Fiscale est un <strong>outil pédagogique et informatif</strong>. Les résultats fournis sont
                  des <strong>estimations</strong> basées sur les données que vous saisissez et les barèmes officiels en vigueur.
                </p>
              </div>

              <h3 className="font-semibold mb-3">Le Service ne constitue pas :</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600">
                <li>Un avis fiscal ou juridique personnalisé</li>
                <li>Une déclaration fiscale officielle</li>
                <li>Un service de conseil en gestion de patrimoine</li>
                <li>Une garantie d'exactitude absolue des calculs</li>
              </ul>

              <p className="mt-4 text-sm text-gray-600">
                Pour toute question fiscale personnalisée, nous vous recommandons de consulter un expert-comptable,
                un avocat fiscaliste ou le service des impôts.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 5 - Obligations de l'Utilisateur
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div>
                <h3 className="font-semibold mb-2">5.1 Usage conforme</h3>
                <p className="text-gray-600 text-sm mb-2">L'Utilisateur s'engage à :</p>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-4 space-y-1">
                  <li>Utiliser le Service de manière loyale et conforme aux présentes CGU</li>
                  <li>Ne pas tenter de contourner les mesures de sécurité</li>
                  <li>Ne pas utiliser de robots, scrapers ou outils automatisés sans autorisation</li>
                  <li>Ne pas surcharger volontairement l'infrastructure (attaques DDoS)</li>
                  <li>Ne pas extraire ou copier le Référentiel fiscal à des fins commerciales</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.2 Exactitude des données</h3>
                <p className="text-gray-600 text-sm">
                  L'Utilisateur est seul responsable de l'exactitude des données qu'il saisit. La qualité du calcul
                  dépend directement de la fiabilité des informations fournies.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.3 Sécurité du compte</h3>
                <p className="text-gray-600 text-sm">
                  L'Utilisateur est responsable de la confidentialité de ses identifiants. Toute activité réalisée
                  depuis son compte est présumée effectuée par lui. En cas de compromission, il doit immédiatement
                  nous en informer.
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 6 - Propriété intellectuelle
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Le code source de l'application est disponible en open source sous licence [À compléter].
                L'Utilisateur peut consulter, modifier et redistribuer le code selon les termes de cette licence.
              </p>
              <p className="mb-4">
                Le <strong>Référentiel fiscal</strong> (barèmes, taux, statistiques) provient de sources officielles publiques
                et reste la propriété de leurs auteurs respectifs (INSEE, Direction du Budget, etc.).
              </p>
              <p>
                La marque "Empreinte Fiscale", le logo, la charte graphique et le contenu éditorial sont protégés
                par le droit d'auteur et ne peuvent être reproduits sans autorisation.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 7 - Données personnelles
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Le traitement des données personnelles est régi par notre{" "}
                <a href="/confidentialite" className="text-blue-600 hover:underline font-semibold">
                  Politique de confidentialité
                </a>, conforme au RGPD.
              </p>
              <p>
                En résumé :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-600 mt-2">
                <li>Vos données vous appartiennent</li>
                <li>Nous ne les vendons jamais</li>
                <li>Vous pouvez les exporter ou les supprimer à tout moment</li>
                <li>Les documents uploadés sont supprimés immédiatement après extraction</li>
              </ul>
            </div>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 8 - Limitation de responsabilité
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3">8.1 Disponibilité du Service</h3>
              <p className="text-gray-600 text-sm mb-4">
                Nous nous efforçons d'assurer une disponibilité continue du Service, mais ne garantissons pas
                une accessibilité 24h/24 et 7j/7. Des interruptions peuvent survenir pour maintenance, mise à jour
                ou en cas de force majeure.
              </p>

              <h3 className="font-semibold mb-3">8.2 Exactitude des calculs</h3>
              <p className="text-gray-600 text-sm mb-4">
                Bien que nous utilisions les barèmes officiels les plus récents, nous ne pouvons garantir
                l'exactitude absolue des calculs. Les résultats sont des <strong>estimations</strong>.
              </p>

              <h3 className="font-semibold mb-3">8.3 Décisions fiscales</h3>
              <p className="text-gray-600 text-sm mb-4">
                Empreinte Fiscale n'est pas responsable des décisions fiscales ou financières prises sur la base
                des résultats affichés. L'Utilisateur reste seul responsable de ses choix.
              </p>

              <h3 className="font-semibold mb-3">8.4 Dommages indirects</h3>
              <p className="text-gray-600 text-sm">
                En aucun cas Empreinte Fiscale ne pourra être tenu responsable de dommages indirects
                (perte de données, manque à gagner, préjudice commercial) résultant de l'utilisation ou de
                l'impossibilité d'utiliser le Service.
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 9 - Modification et évolution du Service
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Nous nous réservons le droit de modifier, enrichir ou interrompre tout ou partie du Service
                à tout moment, sans préavis.
              </p>
              <p>
                Les modifications substantielles des CGU seront notifiées aux Utilisateurs inscrits par email
                et/ou notification dans l'application. La poursuite de l'utilisation du Service après notification
                vaut acceptation des nouvelles conditions.
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 10 - Résiliation
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3">10.1 Par l'Utilisateur</h3>
              <p className="text-gray-600 text-sm mb-4">
                L'Utilisateur peut supprimer son compte à tout moment depuis les paramètres. Cette action
                entraîne la suppression définitive de toutes ses données sous 48h (RGPD Art. 17).
              </p>

              <h3 className="font-semibold mb-3">10.2 Par Empreinte Fiscale</h3>
              <p className="text-gray-600 text-sm">
                Nous nous réservons le droit de suspendre ou supprimer un compte en cas de :
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-4 mt-2 space-y-1">
                <li>Violation des présentes CGU</li>
                <li>Activité frauduleuse ou malveillante</li>
                <li>Inactivité prolongée (3 ans sans connexion, après notification)</li>
                <li>Demande d'une autorité judiciaire</li>
              </ul>
            </div>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 11 - Loi applicable et juridiction
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Les présentes CGU sont soumises au <strong>droit français</strong>.
              </p>
              <p className="mb-4">
                En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire.
              </p>
              <p>
                À défaut de résolution amiable, les tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Article 12 */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Article 12 - Contact
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Pour toute question relative aux présentes CGU :
              </p>
              <p>
                <strong>Email :</strong>{" "}
                <a href="mailto:contact@empreinte-fiscale.fr" className="text-blue-600 hover:underline">
                  contact@empreinte-fiscale.fr
                </a>
              </p>
            </div>
          </section>

          {/* Version */}
          <section className="text-sm text-gray-500 text-center pt-8 border-t">
            <p><strong>Version des CGU :</strong> 1.0</p>
            <p><strong>Dernière mise à jour :</strong> Janvier 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}
