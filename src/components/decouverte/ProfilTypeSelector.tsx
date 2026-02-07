"use client";

import Link from "next/link";

const PROFIL_TYPES = [
  {
    id: "enseignant",
    name: "Enseignant",
    icon: "👨‍🏫",
    description: "Professeur certifié, 35 ans, célibataire",
  },
  {
    id: "medecin",
    name: "Médecin",
    icon: "👨‍⚕️",
    description: "Médecin généraliste libéral, 45 ans, marié 2 enfants",
  },
  {
    id: "artisan",
    name: "Artisan",
    icon: "🔧",
    description: "Plombier auto-entrepreneur, 38 ans, pacsé 1 enfant",
  },
  {
    id: "cadre",
    name: "Cadre",
    icon: "💼",
    description: "Cadre supérieur, 42 ans, marié 2 enfants",
  },
  {
    id: "retraite",
    name: "Retraité",
    icon: "👴",
    description: "Retraité fonction publique, 68 ans, marié",
  },
  {
    id: "etudiant",
    name: "Étudiant",
    icon: "🎓",
    description: "Étudiant master, 23 ans, célibataire",
  },
  {
    id: "smicard",
    name: "Smicard",
    icon: "👷",
    description: "Employé commerce, 28 ans, célibataire",
  },
];

export function ProfilTypeSelector() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Découvrez votre empreinte fiscale
        </h1>
        <p className="text-xl text-gray-600">
          Explorez des profils types pour comprendre le système fiscal français
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROFIL_TYPES.map(profil => (
          <Link
            key={profil.id}
            href={`/decouverte/${profil.id}`}
            className="block bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{profil.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {profil.name}
              </h3>
              <p className="text-sm text-gray-600">{profil.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center bg-blue-50 border border-blue-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          Créez votre compte pour VOTRE vrai score
        </h2>
        <p className="text-blue-700 mb-6">
          Ces profils sont des exemples basés sur des moyennes. Pour connaître votre empreinte fiscale personnelle, créez votre compte gratuitement.
        </p>
        <Link
          href="/auth/register"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Créer mon compte gratuit
        </Link>
      </div>
    </div>
  );
}
