"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { SimulationDelta } from "@/modules/simulations/types";

interface DeltaSummaryProps {
  delta: SimulationDelta;
}

export function DeltaSummary({ delta }: DeltaSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  const DeltaCard = ({
    label,
    deltaValue,
    icon,
    color,
    delay = 0,
  }: {
    label: string;
    deltaValue: { before: number; after: number; delta: number; percentChange: number };
    icon: React.ReactNode;
    color: "red" | "green" | "blue";
    delay?: number;
  }) => {
    const isIncrease = deltaValue.delta > 0;
    const isDecrease = deltaValue.delta < 0;

    const colorClasses = {
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        increase: "text-red-600",
        decrease: "text-green-600",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        increase: "text-green-600",
        decrease: "text-red-600",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        increase: "text-blue-600",
        decrease: "text-blue-600",
      },
    };

    const classes = colorClasses[color];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`${classes.bg} ${classes.border} border-2 rounded-xl p-6`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={classes.text}>{icon}</div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
          </div>

          {/* Trend indicator */}
          {deltaValue.delta !== 0 && (
            <div
              className={`flex items-center gap-1 ${
                isIncrease ? classes.increase : classes.decrease
              }`}
            >
              {isIncrease ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-sm font-semibold">
                {formatPercent(deltaValue.percentChange)}
              </span>
            </div>
          )}
        </div>

        {/* Values */}
        <div className="space-y-3">
          {/* Before → After */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avant</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(deltaValue.before)}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Après</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(deltaValue.after)}
            </span>
          </div>

          {/* Delta */}
          <div className="pt-3 border-t border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Différence</span>
              <span
                className={`text-xl font-bold ${
                  deltaValue.delta === 0
                    ? "text-gray-500"
                    : isIncrease
                    ? classes.increase
                    : classes.decrease
                }`}
              >
                {deltaValue.delta >= 0 ? "+" : ""}
                {formatCurrency(deltaValue.delta)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Impact de la simulation
        </h2>
        <p className="text-gray-600">
          Voici les différences entre votre situation actuelle et la simulation
        </p>
      </div>

      {/* Main deltas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DeltaCard
          label="Total payé"
          deltaValue={delta.totalPaye}
          icon={<span className="text-2xl">💸</span>}
          color="red"
          delay={0}
        />

        <DeltaCard
          label="Total reçu"
          deltaValue={delta.totalRecu}
          icon={<span className="text-2xl">💰</span>}
          color="green"
          delay={0.1}
        />

        <DeltaCard
          label="Solde net"
          deltaValue={delta.soldeNet}
          icon={<span className="text-2xl">⚖️</span>}
          color="blue"
          delay={0.2}
        />
      </div>

      {/* Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 border border-gray-200 rounded-xl p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3">
          💡 Interprétation
        </h3>

        <div className="space-y-2 text-sm text-gray-700">
          {/* Total payé interpretation */}
          {delta.totalPaye.delta !== 0 && (
            <p>
              {delta.totalPaye.delta > 0 ? (
                <>
                  Vous paierez <strong>{formatCurrency(delta.totalPaye.delta)}</strong> de{" "}
                  <strong className="text-red-600">plus</strong> en taxes et cotisations (
                  {formatPercent(delta.totalPaye.percentChange)}).
                </>
              ) : (
                <>
                  Vous paierez <strong>{formatCurrency(delta.totalPaye.delta)}</strong> de{" "}
                  <strong className="text-green-600">moins</strong> en taxes et cotisations (
                  {formatPercent(delta.totalPaye.percentChange)}).
                </>
              )}
            </p>
          )}

          {/* Total reçu interpretation */}
          {delta.totalRecu.delta !== 0 && (
            <p>
              {delta.totalRecu.delta > 0 ? (
                <>
                  Vous recevrez <strong>{formatCurrency(delta.totalRecu.delta)}</strong> de{" "}
                  <strong className="text-green-600">plus</strong> en transferts et services (
                  {formatPercent(delta.totalRecu.percentChange)}).
                </>
              ) : (
                <>
                  Vous recevrez <strong>{formatCurrency(delta.totalRecu.delta)}</strong> de{" "}
                  <strong className="text-red-600">moins</strong> en transferts et services (
                  {formatPercent(delta.totalRecu.percentChange)}).
                </>
              )}
            </p>
          )}

          {/* Solde net interpretation */}
          {delta.soldeNet.delta !== 0 && (
            <p className="pt-2 border-t">
              <strong>Au total</strong>, votre contribution nette{" "}
              {delta.soldeNet.delta > 0 ? (
                <>
                  <strong className="text-red-600">augmentera</strong> de{" "}
                  <strong>{formatCurrency(delta.soldeNet.delta)}</strong>
                </>
              ) : (
                <>
                  <strong className="text-green-600">diminuera</strong> de{" "}
                  <strong>{formatCurrency(Math.abs(delta.soldeNet.delta))}</strong>
                </>
              )}{" "}
              ({formatPercent(delta.soldeNet.percentChange)}).
            </p>
          )}

          {/* No change */}
          {delta.totalPaye.delta === 0 &&
            delta.totalRecu.delta === 0 &&
            delta.soldeNet.delta === 0 && (
              <p className="text-gray-600">
                Cette simulation n'a pas d'impact significatif sur votre situation fiscale.
              </p>
            )}
        </div>
      </motion.div>
    </div>
  );
}
