"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Country {
  code: string;
  name: string;
  flag: string;
  available: boolean;
  comingSoon?: boolean;
}

interface InternationalComparisonProps {
  onSelectCountry?: (countryCode: string) => void;
}

export function InternationalComparison({ onSelectCountry }: InternationalComparisonProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("/api/simulations/international");
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries || []);
          setDisclaimer(data.disclaimer || "");
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCountries();
  }, []);

  const handleCountryClick = async (country: Country) => {
    if (!country.available) {
      alert(`${country.name} : comparaison bientôt disponible !`);
      return;
    }

    if (country.code === "FR") {
      alert("Vous utilisez déjà les barèmes français !");
      return;
    }

    if (onSelectCountry) {
      onSelectCountry(country.code);
    } else {
      alert("Fonctionnalité en développement. La comparaison internationale sera bientôt disponible !");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Globe className="w-6 h-6 text-blue-600 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">Comparaison internationale</h3>
          <p className="text-gray-600 mt-1">
            Comparez votre situation fiscale avec d'autres pays
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">{disclaimer}</p>
        </div>
      )}

      {/* Countries Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {countries.map((country, index) => (
          <motion.button
            key={country.code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: country.available ? 1.05 : 1.02 }}
            whileTap={{ scale: country.available ? 0.95 : 1 }}
            onClick={() => handleCountryClick(country)}
            className={`
              relative p-4 rounded-xl border-2 transition-all
              ${
                country.available
                  ? "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                  : "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
              }
            `}
            disabled={!country.available && country.code !== "FR"}
          >
            {/* Flag */}
            <div className="text-4xl mb-2">{country.flag}</div>

            {/* Country name */}
            <p className="text-sm font-semibold text-gray-900 text-center">
              {country.name}
            </p>

            {/* Status badge */}
            {country.code === "FR" && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Actuel
              </div>
            )}

            {country.comingSoon && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Bientôt
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Future feature teaser */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-2">🚀 Bientôt disponible</h4>
        <p className="text-gray-700 text-sm mb-4">
          Les comparaisons internationales arrivent ! Vous pourrez bientôt comparer votre situation
          fiscale avec l'Allemagne, la Suède, le Royaume-Uni et les États-Unis.
        </p>
        <p className="text-gray-600 text-xs">
          Méthodologie : nous utiliserons les barèmes officiels de chaque pays, avec des
          simplifications documentées pour garantir la transparence.
        </p>
      </div>
    </div>
  );
}
