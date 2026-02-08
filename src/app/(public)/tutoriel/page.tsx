"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Check, PlayCircle, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TutorielPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Bienvenue sur Empreinte Fiscale !",
      icon: "👋",
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Ce tutoriel vous guide pas à pas pour découvrir <strong>votre empreinte fiscale</strong> :
            ce que vous payez en impôts et cotisations, et ce que vous recevez en services publics et aides.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="font-semibold mb-3 text-blue-900">📚 Ce que vous allez apprendre :</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Comment créer votre profil fiscal personnalisé</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Comment améliorer votre score de confiance (fiabilité du résultat)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Comment utiliser les visualisations et simulations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1">✓</span>
                <span>Comment protéger vos données (RGPD)</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="font-semibold mb-2">Durée</h3>
              <p className="text-gray-600 text-sm">5-10 minutes</p>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Niveau</h3>
              <p className="text-gray-600 text-sm">Débutant - Aucun prérequis</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: "Étape 1 : Créez votre compte",
      icon: "🔐",
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            Pour calculer <strong>votre</strong> score fiscal personnalisé, commencez par créer un compte gratuit.
          </p>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Informations requises
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Email</strong> : Pour vous connecter et recevoir des notifications (optionnelles)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Mot de passe</strong> : Minimum 8 caractères, chiffré avec bcrypt
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Nom</strong> : Votre vrai nom ou un pseudonyme (vous choisissez)
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <p className="text-green-900 font-semibold mb-2">🔒 100% sécurisé et confidentiel</p>
            <p className="text-green-800 text-sm">
              Vos données ne sont jamais vendues, partagées ou transmises à l'administration fiscale.
              Conformité RGPD totale. Vous pouvez tout supprimer à tout moment.
            </p>
          </div>

          <div className="text-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: "var(--color-coral, #E07A5F)",
                  color: "white",
                }}
              >
                Créer mon compte gratuitement
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Déjà inscrit ?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Étape 2 : Remplissez le Wizard de Profil Fiscal",
      icon: "📊",
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            Le wizard vous guide à travers <strong>5 étapes</strong> pour construire votre profil fiscal complet.
            Vous pouvez sauvegarder et revenir à tout moment.
          </p>

          <div className="space-y-4">
            {[
              {
                step: "1/5",
                title: "Situation personnelle",
                items: ["Statut : célibataire, marié/pacsé, divorcé, veuf", "Nombre de parts fiscales", "Commune de résidence", "Âge"],
                color: "blue",
              },
              {
                step: "2/5",
                title: "Revenus",
                items: [
                  "Salaire brut annuel (important pour les cotisations patronales)",
                  "Type de contrat : CDI, fonctionnaire, indépendant...",
                  "Revenus fonciers, capitaux, autres",
                ],
                color: "green",
              },
              {
                step: "3/5",
                title: "Patrimoine",
                items: ["Propriétaire ou locataire", "Véhicules (type, km/an)", "Patrimoine IFI si > 1,3M€"],
                color: "purple",
              },
              {
                step: "4/5",
                title: "Consommation",
                items: [
                  "3 modes au choix : Profil type, Estimation rapide, ou Détaillé",
                  "Budget courses, restaurants, carburant, loisirs",
                  "Alcool/tabac (optionnel, pour les accises)",
                ],
                color: "orange",
              },
              {
                step: "5/5",
                title: "Famille & Services publics",
                items: [
                  "Nombre d'enfants, âges, niveaux scolaires",
                  "Fréquence d'usage : transports, hôpital, équipements sportifs",
                  "Aides reçues : CAF, APL, RSA, chômage...",
                ],
                color: "pink",
              },
            ].map((section, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-${section.color}-500`}>
                    {section.step}
                  </span>
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded">
            <p className="text-amber-900 font-semibold mb-2">💡 Astuce</p>
            <p className="text-amber-800 text-sm">
              Vous ne connaissez pas toutes les données ? Pas de problème ! Entrez ce que vous savez,
              le moteur estimera le reste. Vous pourrez affiner plus tard en uploadant des documents.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Étape 3 : Améliorez votre Score de Confiance",
      icon: "🎯",
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            Le <strong>Score de confiance</strong> indique la fiabilité de votre résultat (0-100%).
            Plus vous vérifiez vos données, plus il monte.
          </p>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold mb-4">🎨 Statuts des données</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                  <span className="text-2xl">🟢</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold">Vérifié (100%)</h4>
                  <p className="text-sm text-gray-600">
                    Donnée extraite d'un document officiel (bulletin de paie, avis d'imposition, etc.)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
                  <span className="text-2xl">🟡</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold">Déclaré (70%)</h4>
                  <p className="text-sm text-gray-600">Donnée saisie manuellement par vous, non vérifiée</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                  <span className="text-2xl">🔴</span>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold">Estimé (30%)</h4>
                  <p className="text-sm text-gray-600">
                    Donnée calculée par le moteur via moyennes INSEE (ex: consommation)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="text-blue-900 font-semibold mb-2">📸 Upload de documents</p>
            <p className="text-blue-800 text-sm mb-3">
              Pour passer vos données de 🟡 Déclaré à 🟢 Vérifié, uploadez vos documents :
            </p>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>• Bulletin de paie → Salaire brut, cotisations</li>
              <li>• Avis d'imposition → Impôt sur le revenu, revenus déclarés</li>
              <li>• Avis de taxe foncière → Montant taxe foncière</li>
              <li>• Relevé CAF → Allocations reçues</li>
              <li>• Tickets de caisse → Consommation réelle</li>
            </ul>
            <p className="text-blue-800 text-sm mt-3 font-semibold">
              🔐 Workflow RGPD : extraction → validation → suppression immédiate du document original
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center">
            <p className="font-semibold mb-2">Objectif recommandé</p>
            <div className="text-4xl font-bold font-mono mb-2" style={{ color: "var(--color-sage, #81B29A)" }}>
              ≥ 75%
            </div>
            <p className="text-sm text-gray-600">Score de confiance pour un résultat fiable</p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Étape 4 : Explorez vos résultats",
      icon: "📈",
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            Une fois votre profil complété, découvrez votre <strong>Score Fiscal</strong> et explorez les visualisations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Dashboard principal",
                icon: "📊",
                desc: "Jauge du score, deux colonnes 'Je paie' vs 'Je reçois', ratio contributeur/bénéficiaire",
              },
              {
                title: "Diagramme Sankey",
                icon: "🌊",
                desc: "Flux d'argent : où va votre argent ? Du contribuable vers les postes de dépense publique",
              },
              {
                title: "Treemap budgétaire",
                icon: "🗺️",
                desc: "Budget de votre 'mini-État' : chaque rectangle = un poste proportionnel",
              },
              {
                title: "Journée animée",
                icon: "⏰",
                desc: "Animation déroulant une journée type avec les taxes révélées à chaque geste",
              },
              {
                title: "Graphique temporel",
                icon: "📉",
                desc: "Évolution de votre score sur plusieurs années (avec simulations)",
              },
              {
                title: "Journal fiscal",
                icon: "📝",
                desc: "Timeline quotidienne : loggez vos dépenses, voyez les taxes en temps réel",
              },
            ].map((viz, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                <div className="text-3xl mb-3">{viz.icon}</div>
                <h3 className="font-semibold mb-2">{viz.title}</h3>
                <p className="text-sm text-gray-600">{viz.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
            <p className="text-purple-900 font-semibold mb-2">🎓 Pédagogie intégrée</p>
            <p className="text-purple-800 text-sm">
              Chaque ligne de résultat est cliquable → panneau latéral avec formule simplifiée, source officielle,
              statut de la donnée, date de MAJ du barème. Glossaire fiscal intégré (tooltip sur les termes techniques).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Étape 5 : Simulations & Gamification",
      icon: "🎮",
      content: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              Simulations "What if"
            </h3>
            <p className="text-gray-600 mb-4">
              Testez l'impact de changements de vie sur votre score fiscal :
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Si j'ai un enfant",
                "Si je déménage",
                "Si je passe freelance",
                "Si mon salaire +10%",
                "Si je pars à la retraite",
                "Si je vivais en Allemagne",
              ].map((sim, idx) => (
                <div key={idx} className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-center">
                  {sim}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Gamification & Engagement
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">🎖️ Badges à débloquer</h4>
                <p className="text-sm text-gray-600">
                  Bâtisseur (km route financés), Mécène scolaire, Pilier de santé, Profil cristallin (confiance &gt;90%),
                  Assidu (30 jours logging), Chasseur de taxes...
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">🎯 Défis mensuels</h4>
                <p className="text-sm text-gray-600">
                  Logger 5 jours consécutifs, uploader un avis d'imposition, défis saisonniers liés au calendrier fiscal
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">❓ Quiz personnalisé</h4>
                <p className="text-sm text-gray-600">
                  Questions générées depuis vos propres données. Score cumulé, classement entre amis
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              Social & Comparaison
            </h3>
            <p className="text-gray-600 mb-4">
              Invitez des amis, créez des groupes (Famille, Collègues), comparez vos scores de manière ludique.
              Vous contrôlez le niveau de partage (score seul / résumé / détail).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Étape 6 : Protégez vos données (RGPD)",
      icon: "🔐",
      content: (
        <div className="space-y-6">
          <p className="text-lg">
            Empreinte Fiscale est <strong>100% conforme au RGPD</strong>. Vous gardez le contrôle total de vos données.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "👁️",
                title: "Droit d'accès",
                desc: "Consultez toutes vos données depuis 'Mes données' dans votre profil",
              },
              {
                icon: "📥",
                title: "Droit de portabilité",
                desc: "Exportez toutes vos données au format JSON en un clic",
              },
              {
                icon: "✏️",
                title: "Droit de rectification",
                desc: "Modifiez vos données à tout moment",
              },
              {
                icon: "🗑️",
                title: "Droit à l'effacement",
                desc: "Supprimez votre compte et toutes vos données sous 48h (irréversible)",
              },
            ].map((right, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border-2 border-green-200">
                <div className="text-3xl mb-3">{right.icon}</div>
                <h3 className="font-semibold mb-2">{right.title}</h3>
                <p className="text-sm text-gray-600">{right.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <p className="text-red-900 font-semibold mb-2">❌ Ce que nous ne faisons JAMAIS :</p>
            <ul className="space-y-2 text-red-800 text-sm">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Vendre ou louer vos données à des tiers (publicitaires, courtiers)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Transmettre vos données à l'administration fiscale ou aux impôts</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Stocker vos documents originaux (suppression immédiate après extraction)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Conserver vos données après suppression de compte (effacement total sous 48h)</span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/confidentialite">
              <Button variant="outline" size="lg" className="px-8 py-4">
                📄 Lire la Politique de confidentialité complète
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Félicitations ! Vous êtes prêt 🎉",
      icon: "✅",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="font-display text-3xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
              Vous maîtrisez Empreinte Fiscale !
            </h2>
            <p className="text-lg text-gray-600">
              Vous savez maintenant comment découvrir votre relation financière complète avec l'État.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-xl">
            <h3 className="font-semibold text-lg mb-4 text-center">🚀 Prochaines étapes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/auth/register" className="group">
                <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-300">
                  <div className="text-3xl mb-2">📝</div>
                  <h4 className="font-semibold mb-2">Créer mon compte</h4>
                  <p className="text-sm text-gray-600">Commencez votre parcours fiscal personnalisé</p>
                </div>
              </Link>

              <Link href="/decouverte" className="group">
                <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-all border-2 border-transparent hover:border-green-300">
                  <div className="text-3xl mb-2">✨</div>
                  <h4 className="font-semibold mb-2">Mode Découverte</h4>
                  <p className="text-sm text-gray-600">Explorez sans compte avec des profils types</p>
                </div>
              </Link>

              <Link href="/quiz" className="group">
                <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-300">
                  <div className="text-3xl mb-2">🎮</div>
                  <h4 className="font-semibold mb-2">Quiz Fiscal</h4>
                  <p className="text-sm text-gray-600">Testez vos connaissances de façon ludique</p>
                </div>
              </Link>

              <Link href="/aide" className="group">
                <div className="bg-white p-6 rounded-lg hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300">
                  <div className="text-3xl mb-2">❓</div>
                  <h4 className="font-semibold mb-2">Centre d'aide</h4>
                  <p className="text-sm text-gray-600">FAQ et réponses à vos questions</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg border-2 border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Une question ou un problème ?</p>
            <a
              href="mailto:support@empreinte-fiscale.fr"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline font-semibold"
            >
              📧 support@empreinte-fiscale.fr
            </a>
            <p className="text-sm text-gray-500 mt-2">Nous répondons sous 48h (jours ouvrés)</p>
          </div>
        </div>
      ),
    },
  ];

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen size={48} style={{ color: "var(--color-sage, #81B29A)" }} />
            <h1 className="font-display text-4xl md:text-5xl font-bold" style={{ color: "var(--color-navy, #1A2332)" }}>
              Tutoriel
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Guide pas à pas pour maîtriser Empreinte Fiscale
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-sage, #81B29A)" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--color-sage, #81B29A)",
              }}
            />
          </div>
        </div>

        {/* Step Navigation Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStep(index);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? "w-8"
                  : index < currentStep
                  ? "opacity-100"
                  : "opacity-30"
              }`}
              style={{
                backgroundColor:
                  index <= currentStep ? "var(--color-sage, #81B29A)" : "#d1d5db",
              }}
              aria-label={`Aller à l'étape ${index + 1}`}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">{currentStepData?.icon}</div>
            <h2 className="font-display text-3xl font-bold" style={{ color: "var(--color-navy, #1A2332)" }}>
              {currentStepData?.title}
            </h2>
          </div>

          <div className="prose prose-lg max-w-none">{currentStepData?.content}</div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={goToPrev}
            disabled={currentStep === 0}
            variant="outline"
            size="lg"
            className="px-6 py-4"
          >
            <ChevronLeft className="mr-2" size={20} />
            Précédent
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={goToNext}
              size="lg"
              className="px-6 py-4"
              style={{
                backgroundColor: "var(--color-sage, #81B29A)",
                color: "white",
              }}
            >
              Suivant
              <ChevronRight className="ml-2" size={20} />
            </Button>
          ) : (
            <Link href="/auth/register">
              <Button
                size="lg"
                className="px-8 py-4"
                style={{
                  backgroundColor: "var(--color-coral, #E07A5F)",
                  color: "white",
                }}
              >
                <Award className="mr-2" size={20} />
                Commencer maintenant
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
