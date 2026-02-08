"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Bell,
  TrendingUp,
} from "lucide-react";

interface CronJob {
  jobId: string;
  schedule: string;
  description: string;
  status: string;
}

interface CronJobExecution {
  jobId: string;
  lastExecution?: string;
  lastSuccess?: boolean;
  affectedUsers?: number;
  notificationsSent?: number;
  errors?: number;
}

export default function CronMonitoringPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<Record<string, CronJobExecution>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const jobIds = ["daily-facts", "streak-reminder", "weekly-digest", "monthly-aggregation"];

      const jobPromises = jobIds.map(async (jobId) => {
        const res = await fetch(`/api/cron/${jobId}`);
        if (res.ok) {
          return res.json();
        }
        return null;
      });

      const jobsData = (await Promise.all(jobPromises)).filter(Boolean);
      setJobs(jobsData);

      // Mock execution data (in production, this would come from a database)
      const mockExecutions: Record<string, CronJobExecution> = {
        "daily-facts": {
          jobId: "daily-facts",
          lastExecution: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          lastSuccess: true,
          affectedUsers: 127,
          notificationsSent: 124,
          errors: 3,
        },
        "streak-reminder": {
          jobId: "streak-reminder",
          lastExecution: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          lastSuccess: true,
          affectedUsers: 45,
          notificationsSent: 45,
          errors: 0,
        },
        "weekly-digest": {
          jobId: "weekly-digest",
          lastExecution: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastSuccess: true,
          affectedUsers: 89,
          notificationsSent: 86,
          errors: 3,
        },
        "monthly-aggregation": {
          jobId: "monthly-aggregation",
          lastExecution: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          lastSuccess: true,
          affectedUsers: 234,
          notificationsSent: 234,
          errors: 0,
        },
      };

      setExecutions(mockExecutions);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRun = async (jobId: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir exécuter le job "${jobId}" manuellement ?`)) {
      return;
    }

    setRunningJob(jobId);
    try {
      const res = await fetch(`/api/cron/${jobId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CRON_SECRET || "dev-secret"}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Job exécuté avec succès !\n\n${data.stats.notificationsSent} notifications envoyées à ${data.stats.affectedUsers} utilisateurs`);
        fetchJobs();
      } else {
        alert("Erreur lors de l'exécution du job");
      }
    } catch (error) {
      alert("Erreur réseau lors de l'exécution du job");
    } finally {
      setRunningJob(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Jamais exécuté";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  const getJobIcon = (jobId: string) => {
    switch (jobId) {
      case "daily-facts":
        return <Bell className="w-5 h-5 text-blue-600" />;
      case "streak-reminder":
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case "weekly-digest":
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case "monthly-aggregation":
        return <Users className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Monitoring des Cron Jobs
              </h1>
              <p className="text-gray-600">
                Surveillez l'exécution des tâches planifiées
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {jobs.map((job) => {
            const execution = executions[job.jobId];
            const isRunning = runningJob === job.jobId;

            return (
              <div
                key={job.jobId}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getJobIcon(job.jobId)}
                    <div>
                      <h3 className="font-bold text-gray-900">{job.jobId}</h3>
                      <p className="text-sm text-gray-600">{job.description}</p>
                    </div>
                  </div>
                  {execution?.lastSuccess !== undefined && (
                    execution.lastSuccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Planification :</span>
                    <span className="font-mono text-gray-900">{job.schedule}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dernière exécution :</span>
                    <span className="text-gray-900">{formatDate(execution?.lastExecution)}</span>
                  </div>

                  {execution && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Utilisateurs affectés :</span>
                        <span className="font-semibold text-blue-600">
                          {execution.affectedUsers}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Notifications envoyées :</span>
                        <span className="font-semibold text-green-600">
                          {execution.notificationsSent}
                        </span>
                      </div>

                      {execution.errors !== undefined && execution.errors > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Erreurs :</span>
                          <span className="font-semibold text-red-600">
                            {execution.errors}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button
                  onClick={() => handleManualRun(job.jobId)}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Exécution en cours...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Exécuter manuellement
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                À propos des cron jobs
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  • Les cron jobs sont exécutés automatiquement par Vercel selon la planification définie
                </li>
                <li>
                  • L'exécution manuelle ne compte pas dans les statistiques automatiques
                </li>
                <li>
                  • Les erreurs sont des échecs d'envoi individuels, pas des échecs de job complet
                </li>
                <li>
                  • Pour modifier la planification, éditez le fichier vercel.json
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
