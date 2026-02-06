import { ResultatScoreConfiance } from "@/modules/score";

interface ConfianceScoreProps {
  scoreConfiance: ResultatScoreConfiance;
}

export function ConfianceScore({ scoreConfiance }: ConfianceScoreProps) {
  const getColorClass = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score de confiance</h3>

      {/* Score principal */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${getColorClass(
              scoreConfiance.scoreGlobal
            )}`}
          >
            {scoreConfiance.scoreGlobal}%
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {scoreConfiance.nombreChampsVerifies} / {scoreConfiance.nombreChampsTotal} champs
            vérifiés
          </p>
        </div>

        {/* Jauge visuelle */}
        <div className="w-32 h-32 relative">
          <svg className="transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={
                scoreConfiance.scoreGlobal >= 80
                  ? "#10b981"
                  : scoreConfiance.scoreGlobal >= 60
                  ? "#3b82f6"
                  : scoreConfiance.scoreGlobal >= 40
                  ? "#f59e0b"
                  : "#ef4444"
              }
              strokeWidth="12"
              strokeDasharray={`${(scoreConfiance.scoreGlobal / 100) * 339.292} 339.292`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{scoreConfiance.scoreGlobal}%</span>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      {scoreConfiance.recommandations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Recommandations</h4>
          <ul className="space-y-1">
            {scoreConfiance.recommandations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Détails */}
      {scoreConfiance.details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Détail par catégorie</h4>
          <div className="space-y-2">
            {scoreConfiance.details.slice(0, 5).map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{detail.categorie}</span>
                <span
                  className={`font-medium ${
                    detail.score >= 80
                      ? "text-green-600"
                      : detail.score >= 60
                      ? "text-blue-600"
                      : detail.score >= 40
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {detail.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
