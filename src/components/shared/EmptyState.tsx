"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FileQuestion,
  Trophy,
  TrendingUp,
  Calendar,
  Bell,
  Zap,
  BookOpen,
} from "lucide-react";

interface EmptyStateProps {
  /**
   * Icon type or custom icon element
   */
  icon?: "default" | "trophy" | "trending" | "calendar" | "bell" | "zap" | "book" | ReactNode;
  /**
   * Main title
   */
  title: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Primary CTA button text
   */
  actionLabel?: string;
  /**
   * Primary CTA click handler
   */
  onAction?: () => void;
  /**
   * Secondary CTA button text
   */
  secondaryLabel?: string;
  /**
   * Secondary CTA click handler
   */
  onSecondary?: () => void;
  /**
   * Optional illustration/emoji
   */
  illustration?: string;
}

const iconComponents = {
  default: FileQuestion,
  trophy: Trophy,
  trending: TrendingUp,
  calendar: Calendar,
  bell: Bell,
  zap: Zap,
  book: BookOpen,
};

/**
 * Reusable empty state component with call-to-action
 * Use this when a feature has no data to display
 */
export function EmptyState({
  icon = "default",
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  illustration,
}: EmptyStateProps) {
  // Get icon component
  let IconComponent: ReactNode;
  if (typeof icon === "string") {
    const Icon = iconComponents[icon as keyof typeof iconComponents];
    IconComponent = <Icon className="w-16 h-16 text-gray-400" />;
  } else {
    IconComponent = icon;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]"
    >
      {/* Illustration */}
      {illustration && (
        <div className="text-8xl mb-6 animate-bounce">
          {illustration}
        </div>
      )}

      {/* Icon */}
      {!illustration && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="mb-6"
        >
          {IconComponent}
        </motion.div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-6">{description}</p>

      {/* Actions */}
      <div className="flex gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button onClick={onSecondary} variant="outline" size="lg">
            {secondaryLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */

export function EmptyBadges({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="trophy"
      illustration="🏆"
      title="Aucun badge pour le moment"
      description="Complétez des défis, explorez l'app et gagnez vos premiers badges !"
      actionLabel="Explorer les défis"
      onAction={onExplore}
    />
  );
}

export function EmptyChallenges({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="zap"
      illustration="⚡"
      title="Aucun défi actif"
      description="Relevez des défis pour gagner de l'expérience et débloquer des badges."
      actionLabel="Voir les défis disponibles"
      onAction={onCreate}
    />
  );
}

export function EmptyJournal({ onAddEntry }: { onAddEntry?: () => void }) {
  return (
    <EmptyState
      icon="calendar"
      illustration="📝"
      title="Votre journal est vide"
      description="Commencez à suivre vos dépenses quotidiennes pour visualiser les taxes que vous payez."
      actionLabel="Ajouter une dépense"
      secondaryLabel="Scanner un ticket"
      onAction={onAddEntry}
      onSecondary={onAddEntry}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="bell"
      illustration="🔔"
      title="Aucune notification"
      description="Vous êtes à jour ! Les nouvelles notifications apparaîtront ici."
    />
  );
}

export function EmptySimulations({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="trending"
      illustration="📊"
      title="Aucune simulation"
      description="Créez des simulations pour explorer différents scénarios fiscaux."
      actionLabel="Créer une simulation"
      onAction={onCreate}
    />
  );
}

export function EmptyEvolution() {
  return (
    <EmptyState
      icon="trending"
      illustration="📈"
      title="Pas encore de données"
      description="Continuez à utiliser l'application pour voir l'évolution de votre empreinte fiscale."
    />
  );
}
