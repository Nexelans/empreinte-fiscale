import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
          Empreinte Fiscale
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Découvrez votre relation financière avec l'État
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Une application transparente, non-partisane et sourcée pour visualiser ce que vous
          payez en impôts et cotisations, et ce que vous recevez en services publics et
          transferts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/auth/register">
            <Button size="lg" className="w-full sm:w-auto">
              Créer mon compte
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Se connecter
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🔍 Transparent</h3>
            <p className="text-gray-600">
              Chaque chiffre est sourcé et traçable jusqu'aux données officielles
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">⚖️ Non-partisan</h3>
            <p className="text-gray-600">
              Aucun jugement de valeur, juste les faits et vos chiffres personnalisés
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🎯 Précis</h3>
            <p className="text-gray-600">
              Score de confiance pour comprendre la fiabilité de vos résultats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
