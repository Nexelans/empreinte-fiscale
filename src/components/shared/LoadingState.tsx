"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  /**
   * Size of the loading spinner
   */
  size?: "sm" | "md" | "lg";
  /**
   * Optional message to display
   */
  message?: string;
  /**
   * If true, renders as fullscreen overlay
   */
  fullscreen?: boolean;
  /**
   * If true, shows skeleton loaders instead of spinner
   */
  skeleton?: boolean;
}

/**
 * Reusable loading state component
 * Use this for all async operations to provide consistent loading UX
 */
export function LoadingState({
  size = "md",
  message,
  fullscreen = false,
  skeleton = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (skeleton) {
    return <SkeletonLoader />;
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {spinner}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}

/**
 * Skeleton loader for list items
 */
function SkeletonLoader() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading spinner for inline use
 */
export function InlineLoader({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
}

/**
 * Loading overlay for specific sections
 */
export function SectionLoader({ message }: { message?: string }) {
  return (
    <div className="relative min-h-[200px] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg"></div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        {message && (
          <p className="text-sm text-gray-600 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}
