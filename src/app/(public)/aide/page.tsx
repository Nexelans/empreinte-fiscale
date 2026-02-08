"use client";

import { Metadata } from "next";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search, Mail, Book, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function AidePage() {
  const [openCategory, setOpenCategory] = useState<string | null>("general");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "general",
      title: "Questions générales",
      icon: "❓",
      questions: [
        {
          id: "q1",
          question: "Qu'est-ce qu'Empreinte Fiscale ?",
          answer: "Empreinte Fiscale est une application web transparente et non-partisane qui vous permet de visualiser votre relation financière complète avec l'État français. Vous découvrez ce que vous payez (impôts, cotisations) et ce que vous recevez (services publics, aides), pour obtenir votre score fiscal personnel.",
        },
        {
          id: "q2",
          question: "Le service est-il gratuit ?",
          answer: "Oui, Empreinte Fiscale est 100% gratuit. Aucun abonnement, aucun frais caché. Nous ne vendons pas vos données. Le projet est financé par [à compléter selon le modèle économique : dons, subventions, open source communautaire, etc.].",
        },
        {
          id: "q3",
          question: "Ai-je besoin d'un compte pour utiliser l'application ?",
          answer: "Non, pas obligatoirement. Vous pouvez utiliser le Mode Découverte et le Quiz sans créer de compte. Mais pour calculer VOTRE score fiscal personnalisé, vous devez créer un compte gratuit (email + mot de passe).",
        },
        {
          id: "q4",
          question: "Mes données sont-elles sécurisées ?",
          answer: "Oui, absolument. Vos données sont chiffrées (AES-256), ne sont jamais vendues, et vous pouvez les supprimer à tout moment. Nous sommes 100% conformes au RGPD. Consultez notre Politique de confidentialité pour tous les détails.",
        },
      ],
    },
    {
      id: "calcul",
      title: "Calcul du score fiscal",
      icon: "🧮",
      questions: [
        {
          id: "q5",
          question: "Comment est calculé mon score fiscal ?",
          answer: "Le score fiscal est la différence entre ce que vous payez (impôts directs + cotisations + TVA + autres taxes) et ce que vous recevez (transferts directs + part valorisée des services publics). Le calcul utilise les barèmes officiels 2025-2026 et vos données personnelles.",
        },
        {
          id: "q6",
          question: "Le résultat est-il exact à 100% ?",
          answer: "Non, c'est une estimation basée sur les données que vous saisissez et les moyennes statistiques (ex: consommation, usage des services publics). Le Score de confiance (en %) vous indique la fiabilité de votre résultat. Plus vous vérifiez vos données (upload de documents), plus le score monte.",
        },
        {
          id: "q7",
          question: "Qu'est-ce que le 'Score de confiance' ?",
          answer: "C'est un indicateur de fiabilité de votre résultat, calculé en fonction du statut de vos données : 🟢 Vérifié (100%), 🟡 Déclaré (70%), 🔴 Estimé (30%). Par exemple, si 50% de vos données sont vérifiées et 50% déclarées, votre score de confiance sera d'environ 85%.",
        },
        {
          id: "q8",
          question: "Pourquoi mes cotisations patronales sont-elles incluses ?",
          answer: "Parce que c'est du 'coût du travail' réel. Même si vous ne les voyez pas sur votre fiche de paie, elles sont payées à cause de votre emploi. Nous voulons montrer la réalité complète de la fiscalité française, pas juste la partie visible.",
        },
      ],
    },
    {
      id: "donnees",
      title: "Mes données personnelles",
      icon: "🔐",
      questions: [
        {
          id: "q9",
          question: "Quelles données dois-je saisir ?",
          answer: "Pour un calcul personnalisé : situation familiale, revenus (salaire brut), patrimoine (propriété, véhicules), consommation (profil de dépenses), composition familiale. Chaque donnée améliore la précision du résultat. Vous pouvez aussi uploader des documents (bulletins de paie, avis d'imposition) pour pré-remplir automatiquement.",
        },
        {
          id: "q10",
          question: "Que deviennent mes documents uploadés ?",
          answer: "Workflow RGPD-safe : 1) Vous uploadez un document, 2) Nous extrayons les données structurées, 3) Vous validez, 4) Le document original est IMMÉDIATEMENT supprimé de nos serveurs. Seules les données validées sont conservées. Aucun fichier n'est stocké.",
        },
        {
          id: "q11",
          question: "Puis-je supprimer mon compte et mes données ?",
          answer: "Oui, à tout moment depuis Paramètres > Mes données > Supprimer mon compte. Toutes vos données sont effacées sous 48h, conformément au RGPD (droit à l'effacement, Art. 17). Cette action est irréversible.",
        },
        {
          id: "q12",
          question: "Mes données sont-elles partagées avec l'administration fiscale ?",
          answer: "NON, jamais. Vos données ne sont JAMAIS transmises à l'administration fiscale, aux impôts, ou à quelque organisme public que ce soit. Elles restent sur nos serveurs sécurisés et ne sont utilisées que pour votre calcul personnel.",
        },
      ],
    },
    {
      id: "fonctionnalites",
      title: "Fonctionnalités",
      icon: "✨",
      questions: [
        {
          id: "q13",
          question: "Qu'est-ce que le Mode Découverte ?",
          answer: "C'est un mode sans compte où vous explorez des profils types (enseignant, médecin, cadre, retraité, etc.) pour comprendre comment fonctionne le système fiscal. Parfait pour découvrir l'app avant de créer votre profil personnalisé.",
        },
        {
          id: "q14",
          question: "Comment fonctionne le Quiz Fiscal ?",
          answer: "Le quiz propose des questions pédagogiques sur le système fiscal français (barèmes, services publics, statistiques). Certaines questions sont personnalisées selon vos propres données si vous avez un compte. C'est ludique et instructif !",
        },
        {
          id: "q15",
          question: "Puis-je comparer mon score avec d'autres personnes ?",
          answer: "Oui, via le système d'amis et de groupes. Vous invitez des amis, choisissez votre niveau de partage (score seul, résumé, ou détail), et comparez vos résultats. Vous gardez le contrôle total : vous pouvez révoquer l'accès à tout moment.",
        },
        {
          id: "q16",
          question: "Qu'est-ce que le Journal Fiscal ?",
          answer: "C'est un outil pour logger vos dépenses quotidiennes (courses, essence, restaurants). Vous pouvez scanner vos tickets avec votre smartphone, et l'app calcule automatiquement les taxes invisibles (TVA, TICPE, etc.). Pratique pour voir votre empreinte fiscale au jour le jour.",
        },
      ],
    },
    {
      id: "technique",
      title: "Questions techniques",
      icon: "⚙️",
      questions: [
        {
          id: "q17",
          question: "D'où viennent les barèmes fiscaux ?",
          answer: "Tous les barèmes proviennent de sources officielles : INSEE, PLF (Projet de Loi de Finances), DEPP (Éducation), DREES (Santé/Social), Legifrance, data.gouv.fr. Chaque donnée affichée est traçable jusqu'à sa source. Mise à jour régulière du Référentiel.",
        },
        {
          id: "q18",
          question: "L'application fonctionne-t-elle sur mobile ?",
          answer: "Oui, Empreinte Fiscale est 100% responsive (mobile-first). Vous pouvez l'utiliser sur smartphone, tablette ou desktop. Le scan de tickets est optimisé pour la caméra mobile.",
        },
        {
          id: "q19",
          question: "Puis-je utiliser l'app hors ligne ?",
          answer: "Non, une connexion Internet est nécessaire pour accéder à l'application et au Référentiel fiscal à jour. Cependant, vos données sont sauvegardées automatiquement, vous ne perdez rien si vous fermez l'app.",
        },
        {
          id: "q20",
          question: "Le code source est-il disponible ?",
          answer: "Oui, Empreinte Fiscale est open source. Le code est disponible sur GitHub : github.com/Nexelans/empreinte-fiscale. Vous pouvez consulter, auditer, proposer des améliorations ou déployer votre propre instance.",
        },
      ],
    },
    {
      id: "legal",
      title: "Aspects légaux",
      icon: "⚖️",
      questions: [
        {
          id: "q21",
          question: "Puis-je utiliser les résultats pour ma déclaration d'impôts ?",
          answer: "Non. Empreinte Fiscale est un outil pédagogique et informatif. Les résultats sont des ESTIMATIONS, pas une déclaration fiscale officielle. Pour votre déclaration réelle, utilisez impots.gouv.fr ou consultez un expert-comptable.",
        },
        {
          id: "q22",
          question: "L'app remplace-t-elle un conseiller fiscal ?",
          answer: "Non. Nous ne fournissons pas d'avis fiscal ou juridique personnalisé. Pour des questions complexes (optimisation fiscale, cas particuliers), consultez un expert-comptable ou un avocat fiscaliste.",
        },
        {
          id: "q23",
          question: "Qui peut utiliser l'application ?",
          answer: "Toute personne résidant en France ou souhaitant comprendre le système fiscal français. Pour créer un compte, vous devez avoir 18 ans minimum (ou autorisation parentale). L'app est conçue pour les particuliers, pas les entreprises.",
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle size={48} style={{ color: "var(--color-sage, #81B29A)" }} />
            <h1 className="font-display text-4xl md:text-5xl font-bold" style={{ color: "var(--color-navy, #1A2332)" }}>
              Centre d'aide
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur Empreinte Fiscale
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link href="/tutoriel" className="group">
            <div className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Book size={24} style={{ color: "var(--color-sage, #81B29A)" }} />
                <h3 className="font-semibold">Tutoriel</h3>
              </div>
              <p className="text-sm text-gray-600">
                Guide pas à pas pour démarrer avec Empreinte Fiscale
              </p>
            </div>
          </Link>

          <a href="mailto:support@empreinte-fiscale.fr" className="group">
            <div className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={24} style={{ color: "var(--color-coral, #E07A5F)" }} />
                <h3 className="font-semibold">Contact</h3>
              </div>
              <p className="text-sm text-gray-600">
                Posez votre question directement à notre équipe
              </p>
            </div>
          </a>

          <Link href="/confidentialite" className="group">
            <div className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔐</span>
                <h3 className="font-semibold">RGPD & Données</h3>
              </div>
              <p className="text-sm text-gray-600">
                Tout sur la protection de vos données personnelles
              </p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h2 className="font-display text-xl font-bold" style={{ color: "var(--color-navy, #1A2332)" }}>
                    {category.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({category.questions.length} question{category.questions.length > 1 ? "s" : ""})
                  </span>
                </div>
                {openCategory === category.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>

              {openCategory === category.id && (
                <div className="border-t border-gray-100">
                  {category.questions.map((q, index) => (
                    <div key={q.id} className={index > 0 ? "border-t border-gray-100" : ""}>
                      <button
                        onClick={() => toggleQuestion(q.id)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                          {openQuestion === q.id && (
                            <p className="text-gray-600 text-sm leading-relaxed mt-3">{q.answer}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {openQuestion === q.id ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No results */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Aucun résultat pour "{searchQuery}"</p>
            <a
              href="mailto:support@empreinte-fiscale.fr"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Mail size={20} />
              Contactez-nous directement
            </a>
          </div>
        )}

        {/* CTA Footer */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy, #1A2332)" }}>
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Notre équipe est là pour vous aider. Envoyez-nous votre question par email,
            nous vous répondons sous 48h (jours ouvrés).
          </p>
          <a
            href="mailto:support@empreinte-fiscale.fr"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: "var(--color-coral, #E07A5F)",
              color: "white",
            }}
          >
            <Mail size={20} />
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}
