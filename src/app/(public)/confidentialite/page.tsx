import { Metadata } from "next";
import { Shield, Lock, Eye, Trash2, Download, UserX } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité - Empreinte Fiscale",
  description: "Politique de confidentialité et protection des données personnelles (RGPD)",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={48} style={{ color: "var(--color-sage, #81B29A)" }} />
          <h1 className="font-display text-4xl md:text-5xl font-bold" style={{ color: "var(--color-navy, #1A2332)" }}>
            Politique de confidentialité
          </h1>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded">
          <p className="text-blue-900 font-semibold mb-2">🔒 Engagement RGPD</p>
          <p className="text-blue-800">
            Empreinte Fiscale est <strong>100% conforme au RGPD</strong>. Vos données personnelles vous appartiennent.
            Nous ne les vendons jamais, ne les partageons pas avec des tiers, et vous gardez le contrôle total.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              1. Qui est responsable de vos données ?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-2">
              <p className="mb-4">
                Le responsable du traitement des données personnelles est :
              </p>
              <p><strong>NEXELANS</strong></p>
              <p><strong>Adresse :</strong> 141 Chemin de la Basse Biousse, 38890 Saint-Chef, France</p>
              <p><strong>SIRET :</strong> 952 552 420 00012</p>
              <p><strong>Email :</strong> <a href="mailto:contact@nexelans.fr" className="text-blue-600 hover:underline">contact@nexelans.fr</a></p>
              <p><strong>Téléphone :</strong> 09 72 02 75 90</p>
              <p className="mt-4 text-sm text-gray-600">
                Pour toute question concernant vos données personnelles, vous pouvez nous contacter par email ou téléphone.
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              2. Quelles données collectons-nous ?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--color-coral, #E07A5F)" }}>
                  📝 Données d'inscription (obligatoires)
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse email</li>
                  <li>Nom (ou pseudonyme)</li>
                  <li>Mot de passe (chiffré avec bcrypt, jamais stocké en clair)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--color-coral, #E07A5F)" }}>
                  💰 Données fiscales (facultatives, saisies volontairement)
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Situation familiale (célibataire, marié, etc.)</li>
                  <li>Nombre de parts fiscales</li>
                  <li>Commune de résidence</li>
                  <li>Revenus (salaire, foncier, capitaux)</li>
                  <li>Patrimoine (propriété, véhicules)</li>
                  <li>Consommation (profil de dépenses)</li>
                  <li>Composition familiale (nombre d'enfants, âges)</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  ⚠️ <strong>Important :</strong> Ces données ne sont <strong>jamais</strong> transmises à l'administration fiscale
                  ou à des tiers. Elles servent uniquement au calcul de votre score fiscal personnel.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--color-coral, #E07A5F)" }}>
                  📄 Documents (traitement RGPD-safe)
                </h3>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                  <p className="font-semibold text-amber-900 mb-2">🔐 Protection maximale</p>
                  <p className="text-amber-800 text-sm">
                    Lorsque vous uploadez un document (bulletin de paie, avis d'imposition, ticket de caisse),
                    nous extrayons uniquement les données nécessaires au calcul, puis <strong>supprimons immédiatement le document original</strong>.
                  </p>
                  <p className="text-amber-800 text-sm mt-2">
                    ✅ Le document ne reste <strong>jamais</strong> stocké sur nos serveurs.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--color-coral, #E07A5F)" }}>
                  🔧 Données techniques
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP (pour sécurité et rate limiting)</li>
                  <li>Logs de connexion (authentification, sessions)</li>
                  <li>Données de navigation (pages visitées, durée de session)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalités */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              3. Pourquoi collectons-nous ces données ?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-sage, #81B29A)" }}>
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Calcul de votre score fiscal</h3>
                    <p className="text-gray-600 text-sm">
                      Calculer précisément ce que vous payez (impôts, cotisations) et ce que vous recevez (services publics, aides).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-sage, #81B29A)" }}>
                    <span className="text-white text-xl">🔐</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Gestion de votre compte</h3>
                    <p className="text-gray-600 text-sm">
                      Authentification, sécurité, sauvegarde de votre profil fiscal.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-sage, #81B29A)" }}>
                    <span className="text-white text-xl">📈</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Amélioration du service</h3>
                    <p className="text-gray-600 text-sm">
                      Statistiques anonymisées pour comprendre l'usage et améliorer l'application (aucune donnée personnelle identifiable).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              4. Base légale du traitement (RGPD Art. 6)
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>Consentement explicite</strong> : Vous acceptez volontairement de créer un compte et de saisir vos données.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>Exécution du contrat</strong> : Le traitement est nécessaire pour vous fournir le service (calcul fiscal).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>Intérêt légitime</strong> : Sécurité du site, prévention des abus (rate limiting, logs).
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Durée conservation */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              5. Combien de temps conservons-nous vos données ?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Type de donnée</th>
                    <th className="text-left p-3 font-semibold">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Compte utilisateur actif</td>
                    <td className="p-3">Tant que le compte existe</td>
                  </tr>
                  <tr>
                    <td className="p-3">Compte inactif (sans connexion)</td>
                    <td className="p-3">Suppression après 3 ans d'inactivité</td>
                  </tr>
                  <tr>
                    <td className="p-3">Documents uploadés</td>
                    <td className="p-3"><strong className="text-red-600">Supprimés immédiatement après extraction</strong></td>
                  </tr>
                  <tr>
                    <td className="p-3">Logs de sécurité</td>
                    <td className="p-3">90 jours maximum</td>
                  </tr>
                  <tr>
                    <td className="p-3">Données après suppression de compte</td>
                    <td className="p-3"><strong className="text-red-600">Effacement total sous 48h</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Partage */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              6. Partageons-nous vos données ?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                <p className="font-semibold text-red-900 mb-2">❌ NON, jamais sans votre consentement explicite</p>
                <p className="text-red-800 text-sm">
                  Vos données fiscales ne sont <strong>jamais</strong> vendues, louées ou partagées avec des tiers
                  (publicitaires, courtiers de données, administrations).
                </p>
              </div>

              <p className="mb-4"><strong>Exceptions (avec votre consentement explicite) :</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Connexion IA utilisateur</strong> : Si vous activez cette fonctionnalité, vos données sont envoyées
                  au fournisseur d'IA que vous avez choisi (OpenAI, Anthropic, etc.). Vous êtes clairement averti avant chaque envoi.
                </li>
                <li>
                  <strong>Partage social</strong> : Si vous partagez votre score avec des amis, seules les données que vous
                  avez explicitement autorisées sont visibles (niveau de partage configurable).
                </li>
              </ul>

              <p className="mt-4 text-sm text-gray-600">
                <strong>Prestataires techniques :</strong> Nos prestataires (hébergement Vercel, base de données)
                ont accès aux données uniquement pour fournir le service, sous contrat de confidentialité strict (DPA RGPD).
              </p>
            </div>
          </section>

          {/* Vos droits */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              7. Vos droits (RGPD Art. 15-22)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Eye className="flex-shrink-0 mt-1" size={24} style={{ color: "var(--color-sage, #81B29A)" }} />
                  <div>
                    <h3 className="font-semibold mb-1">Droit d'accès</h3>
                    <p className="text-sm text-gray-600">
                      Accédez à toutes vos données depuis la page "Mes données" dans votre profil.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Download className="flex-shrink-0 mt-1" size={24} style={{ color: "var(--color-sage, #81B29A)" }} />
                  <div>
                    <h3 className="font-semibold mb-1">Droit de portabilité</h3>
                    <p className="text-sm text-gray-600">
                      Exportez toutes vos données au format JSON en un clic.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Lock className="flex-shrink-0 mt-1" size={24} style={{ color: "var(--color-sage, #81B29A)" }} />
                  <div>
                    <h3 className="font-semibold mb-1">Droit de rectification</h3>
                    <p className="text-sm text-gray-600">
                      Modifiez vos données à tout moment depuis votre profil.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Trash2 className="flex-shrink-0 mt-1" size={24} style={{ color: "var(--color-coral, #E07A5F)" }} />
                  <div>
                    <h3 className="font-semibold mb-1">Droit à l'effacement</h3>
                    <p className="text-sm text-gray-600">
                      Supprimez votre compte et toutes vos données sous 48h. Irréversible.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <UserX className="flex-shrink-0 mt-1" size={24} style={{ color: "var(--color-sage, #81B29A)" }} />
                  <div>
                    <h3 className="font-semibold mb-1">Droit d'opposition</h3>
                    <p className="text-sm text-gray-600">
                      Refusez le traitement de certaines données (ex: statistiques anonymisées).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="flex-shrink-0 mt-1" size={24} style={{ color: "var(--color-sage, #81B29A)" }} />
                  <div>
                    <h3 className="font-semibold mb-1">Droit de limitation</h3>
                    <p className="text-sm text-gray-600">
                      Demandez la limitation du traitement pendant une contestation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-900 text-sm">
                <strong>Comment exercer vos droits ?</strong> Contactez-nous à{" "}
                <a href="mailto:contact@nexelans.fr" className="underline">contact@nexelans.fr</a>.
                Nous répondons sous 1 mois maximum (délai légal RGPD).
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              8. Comment sécurisons-nous vos données ?
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">🔐 Chiffrement</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• TLS 1.3 (HTTPS) pour le transit</li>
                    <li>• AES-256 pour les données sensibles au repos</li>
                    <li>• Bcrypt pour les mots de passe (12 rounds)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">🛡️ Protection applicative</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Protection CSRF (tokens SameSite)</li>
                    <li>• Protection XSS (sanitisation)</li>
                    <li>• Rate limiting (anti-brute force)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">📊 Surveillance</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Logs d'accès aux données sensibles</li>
                    <li>• Alertes en cas d'activité suspecte</li>
                    <li>• Audits de sécurité réguliers</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold mb-2">🔒 Hébergement sécurisé</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Serveurs européens (RGPD)</li>
                    <li>• Backups chiffrés quotidiens</li>
                    <li>• Infrastructure redondante</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Réclamation */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              9. Droit de réclamation
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="mb-4">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL :
              </p>
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>CNIL (Commission Nationale de l'Informatique et des Libertés)</strong></p>
                <p className="text-sm mt-2">3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</p>
                <p className="text-sm">Téléphone : 01 53 73 22 22</p>
                <p className="text-sm">Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnil.fr</a></p>
              </div>
            </div>
          </section>

          {/* Mise à jour */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              10. Modifications de cette politique
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p>
                Nous pouvons modifier cette politique de confidentialité pour refléter les évolutions de nos pratiques
                ou de la législation. En cas de modification substantielle, nous vous en informerons par email
                et/ou notification dans l'application.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                <strong>Version actuelle :</strong> 1.0 - Janvier 2026
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg">
            <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Des questions sur vos données ?
            </h2>
            <p className="mb-4">
              Notre délégué à la protection des données (DPO) est à votre disposition :
            </p>
            <p className="font-semibold">
              📧 <a href="mailto:contact@nexelans.fr" className="text-blue-600 hover:underline">contact@nexelans.fr</a>
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Nous nous engageons à répondre sous 1 mois maximum (délai légal RGPD).
            </p>
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
