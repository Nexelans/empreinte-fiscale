"use client";

interface DailyScoreImpactProps {
  dailyTaxes: number;
  dailyServicesValue: number;
}

export function DailyScoreImpact({ dailyTaxes, dailyServicesValue }: DailyScoreImpactProps) {
  const netImpact = dailyTaxes - dailyServicesValue;
  const isContributor = netImpact > 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Impact fiscal du jour
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Taxes paid */}
        <div className="bg-white rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💸</span>
            <span className="text-sm font-medium text-red-600">Taxes payées</span>
          </div>
          <div className="text-2xl font-bold text-red-700">
            {dailyTaxes.toFixed(2)} €
          </div>
        </div>

        {/* Services value */}
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎁</span>
            <span className="text-sm font-medium text-green-600">Services reçus</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {dailyServicesValue.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Net impact */}
      <div className={`rounded-lg p-4 border ${
        isContributor
          ? "bg-orange-50 border-orange-200"
          : "bg-blue-50 border-blue-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Solde du jour</div>
            <div className="text-xs text-gray-600 mt-1">
              {isContributor
                ? "Vous contribuez au financement des services publics"
                : "Vous bénéficiez des services publics"}
            </div>
          </div>
          <div className={`text-2xl font-bold ${
            isContributor ? "text-orange-700" : "text-blue-700"
          }`}>
            {isContributor ? "+" : ""}{netImpact.toFixed(2)} €
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        💡 Les services reçus sont estimés en répartissant la valeur annuelle des services publics
        mutualisés (éducation, santé, sécurité, infrastructure...) sur 365 jours.
      </p>
    </div>
  );
}
