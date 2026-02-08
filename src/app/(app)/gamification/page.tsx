"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Users, Loader2 } from "lucide-react";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import { LevelDisplay } from "@/components/gamification/LevelDisplay";
import { StreakBanner } from "@/components/gamification/StreakBanner";
import { CelebrationAnimation } from "@/components/gamification/CelebrationAnimation";
import type { BadgeDefinition, UserChallenge, StreakData, ChallengeDefinition } from "@/modules/gamification/types";

type TabType = "badges" | "challenges" | "leaderboard";

interface BadgeWithStatus extends BadgeDefinition {
  earned: boolean;
  earnedAt: Date | null;
  progress: number;
}

interface UserChallengeWithDefinition extends UserChallenge {
  definition?: ChallengeDefinition;
}

interface LevelInfo {
  level: number;
  currentXP: number;
  totalXP: number;
  xpForNextLevel: number;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalXP: number;
  level: number;
  rank: number;
}

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("badges");
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [challenges, setChallenges] = useState<UserChallengeWithDefinition[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [challengeFilter, setChallengeFilter] = useState<"all" | "active" | "completed" | "expired">("all");
  const [challengeSort, setChallengeSort] = useState<"progress" | "time" | "xp">("progress");
  const [celebration, setCelebration] = useState<{
    show: boolean;
    title: string;
    message: string;
    icon: string;
    type: "badge" | "challenge" | "level_up" | "streak";
  }>({
    show: false,
    title: "",
    message: "",
    icon: "",
    type: "badge",
  });

  // Fetch all gamification data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch badges
        const badgesRes = await fetch("/api/gamification/badges");
        if (badgesRes.ok) {
          const badgesData = await badgesRes.json();
          setBadges(badgesData.badges || []);
        }

        // Fetch challenges
        const challengesRes = await fetch("/api/gamification/challenges");
        if (challengesRes.ok) {
          const challengesData = await challengesRes.json();
          setChallenges(challengesData.challenges || []);
        }

        // Fetch streak
        const streakRes = await fetch("/api/gamification/streak");
        if (streakRes.ok) {
          const streakData = await streakRes.json();
          setStreak(streakData.streak || null);
        }

        // Fetch XP and level
        const xpRes = await fetch("/api/gamification/xp");
        if (xpRes.ok) {
          const xpData = await xpRes.json();
          setLevelInfo({
            level: xpData.level,
            currentXP: xpData.currentXP,
            totalXP: xpData.totalXP,
            xpForNextLevel: xpData.xpForNextLevel,
          });
        }

        // Fetch leaderboard (will check opt-in server-side)
        const leaderboardRes = await fetch("/api/gamification/leaderboard");
        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setLeaderboard(leaderboardData.leaderboard || []);
          setLeaderboardOptIn(leaderboardData.isOptedIn || false);
        }
      } catch (error) {
        console.error("[Gamification] Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFreezeClick = async () => {
    if (!streak || streak.freezeTokens <= 0) return;

    try {
      const res = await fetch("/api/gamification/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use_freeze_token" }),
      });

      if (res.ok) {
        const data = await res.json();
        setStreak(data.streak);
        setCelebration({
          show: true,
          title: "Gel activé !",
          message: "Vous avez 24h pour logger une activité",
          icon: "❄️",
          type: "streak",
        });
      }
    } catch (error) {
      console.error("[Gamification] Error using freeze token:", error);
    }
  };

  const handleLeaderboardOptIn = async () => {
    try {
      const res = await fetch("/api/gamification/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: !leaderboardOptIn }),
      });

      if (res.ok) {
        const data = await res.json();
        setLeaderboardOptIn(data.isOptedIn);
        if (data.isOptedIn && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      }
    } catch (error) {
      console.error("[Gamification] Error toggling leaderboard opt-in:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);

  // Filter challenges
  const filteredChallenges = challenges.filter((c) => {
    if (challengeFilter === "all") return true;
    if (challengeFilter === "active") return c.status === "ACTIVE";
    if (challengeFilter === "completed") return c.status === "COMPLETED";
    if (challengeFilter === "expired") return c.status === "EXPIRED";
    return true;
  });

  // Sort challenges
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (challengeSort === "progress") {
      const progressA = (a.progress / a.target) * 100;
      const progressB = (b.progress / b.target) * 100;
      return progressB - progressA; // Higher progress first
    } else if (challengeSort === "time") {
      if (!a.expiresAt) return 1;
      if (!b.expiresAt) return -1;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(); // Soonest first
    } else if (challengeSort === "xp") {
      const xpA = a.definition?.recompenseXP || 0;
      const xpB = b.definition?.recompenseXP || 0;
      return xpB - xpA; // Higher XP first
    }
    return 0;
  });

  const activeChallenges = sortedChallenges.filter((c) => c.status === "ACTIVE");
  const completedChallenges = sortedChallenges.filter((c) => c.status === "COMPLETED");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Level Display */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gamification
            </h1>
            <p className="text-gray-600">
              Gagnez des badges, relevez des défis et progressez dans votre parcours fiscal
            </p>
          </div>
        </div>

        {/* Level Display and Streak Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {levelInfo && (
            <LevelDisplay
              level={levelInfo.level}
              currentXP={levelInfo.currentXP}
              totalXP={levelInfo.totalXP}
              xpForNextLevel={levelInfo.xpForNextLevel}
            />
          )}
          {streak && (
            <StreakBanner streak={streak} onFreezeClick={handleFreezeClick} />
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("badges")}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2
              ${
                activeTab === "badges"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <Trophy className="w-5 h-5" />
            <span>Badges</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {earnedBadges.length}/{badges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("challenges")}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2
              ${
                activeTab === "challenges"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <Target className="w-5 h-5" />
            <span>Défis</span>
            <span className="ml-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
              {activeChallenges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2
              ${
                activeTab === "leaderboard"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <Users className="w-5 h-5" />
            <span>Classement</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Badges Tab */}
        {activeTab === "badges" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Badges obtenus ({earnedBadges.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earnedBadges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </div>
            )}

            {/* Unearned Badges */}
            {unearnedBadges.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  À débloquer ({unearnedBadges.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unearnedBadges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </div>
            )}

            {badges.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun badge disponible pour le moment
              </div>
            )}
          </motion.div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrer
                </label>
                <select
                  value={challengeFilter}
                  onChange={(e) => setChallengeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="all">Tous les défis</option>
                  <option value="active">Actifs uniquement</option>
                  <option value="completed">Terminés uniquement</option>
                  <option value="expired">Expirés uniquement</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <select
                  value={challengeSort}
                  onChange={(e) => setChallengeSort(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="progress">Progression (+ élevée)</option>
                  <option value="time">Temps restant (expiration)</option>
                  <option value="xp">Récompense XP (+ élevée)</option>
                </select>
              </div>
            </div>

            {/* Active Challenges */}
            {challengeFilter === "all" && activeChallenges.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Défis actifs ({activeChallenges.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Challenges */}
            {challengeFilter === "all" && completedChallenges.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Défis terminés ({completedChallenges.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {completedChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            )}

            {/* Filtered Challenges (when filter is not "all") */}
            {challengeFilter !== "all" && sortedChallenges.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Résultats ({sortedChallenges.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sortedChallenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
            )}

            {sortedChallenges.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun défi disponible pour le moment
              </div>
            )}
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Opt-in Toggle */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Participer au classement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Activez cette option pour comparer votre progression avec vos amis.
                    Votre score sera visible uniquement par vos amis.
                  </p>
                </div>
                <button
                  onClick={handleLeaderboardOptIn}
                  className={`
                    ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                    ${leaderboardOptIn ? "bg-blue-600" : "bg-gray-200"}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                      transition duration-200 ease-in-out
                      ${leaderboardOptIn ? "translate-x-5" : "translate-x-0"}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Leaderboard List */}
            {leaderboardOptIn ? (
              leaderboard.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rang
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Niveau
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            XP Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leaderboard.map((entry) => (
                          <tr key={entry.userId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {entry.rank <= 3 ? (
                                  <span className="text-2xl">
                                    {entry.rank === 1
                                      ? "🥇"
                                      : entry.rank === 2
                                      ? "🥈"
                                      : "🥉"}
                                  </span>
                                ) : (
                                  <span className="text-sm font-medium text-gray-900">
                                    #{entry.rank}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {entry.userName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Niveau {entry.level}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {entry.totalXP.toLocaleString()} XP
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Ajoutez des amis pour voir le classement
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                Activez le classement pour voir votre position
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Celebration Animation */}
      <CelebrationAnimation
        show={celebration.show}
        title={celebration.title}
        message={celebration.message}
        icon={celebration.icon}
        type={celebration.type}
        onComplete={() => setCelebration({ ...celebration, show: false })}
      />
    </div>
  );
}
