/**
 * Graphique radar pour comparer plusieurs membres d'un groupe
 * Affiche les métriques fiscales sur un radar multi-axes
 * Phase 4 - Social Features
 */

'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export interface GroupMemberMetrics {
  userId: string;
  userName: string;
  color: string;
  metrics: {
    totalPaye: number;
    totalRecu: number;
    scoreConfiance: number;
    ratio: number;
  };
}

interface GroupRadarChartProps {
  members: GroupMemberMetrics[];
  currentUserId: string;
}

/**
 * Normalise les métriques sur une échelle 0-100 pour le radar
 * Chaque métrique est normalisée par rapport au max du groupe
 */
function normalizeMetrics(members: GroupMemberMetrics[]) {
  // Trouver les max pour normaliser
  const maxPaye = Math.max(...members.map((m) => m.metrics.totalPaye));
  const maxRecu = Math.max(...members.map((m) => m.metrics.totalRecu));
  const maxRatio = Math.max(...members.map((m) => m.metrics.ratio));

  // Construire les données pour le radar
  // Format: [{ metric: "Payé", user1: 80, user2: 60, ... }, ...]
  const metrics = [
    'Payé',
    'Reçu',
    'Confiance',
    'Ratio',
  ];

  return metrics.map((metricName) => {
    const dataPoint: any = { metric: metricName };

    members.forEach((member) => {
      let value = 0;

      switch (metricName) {
        case 'Payé':
          value = maxPaye > 0 ? (member.metrics.totalPaye / maxPaye) * 100 : 0;
          break;
        case 'Reçu':
          value = maxRecu > 0 ? (member.metrics.totalRecu / maxRecu) * 100 : 0;
          break;
        case 'Confiance':
          value = member.metrics.scoreConfiance; // Déjà en %
          break;
        case 'Ratio':
          value = maxRatio > 0 ? (member.metrics.ratio / maxRatio) * 100 : 0;
          break;
      }

      dataPoint[member.userName] = Math.round(value);
    });

    return dataPoint;
  });
}

export default function GroupRadarChart({
  members,
  currentUserId,
}: GroupRadarChartProps) {
  const data = normalizeMetrics(members);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-semibold mb-2">{payload[0].payload.metric}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span>{entry.value}/100</span>
          </div>
        ))}
      </div>
    );
  };

  // Si un seul membre, afficher un message
  if (members.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Au moins 2 membres requis pour la comparaison radar</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: '#6b7280', fontSize: 14 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />

        {/* Une ligne par membre du groupe */}
        {members.map((member) => (
          <Radar
            key={member.userId}
            name={member.userName}
            dataKey={member.userName}
            stroke={member.color}
            fill={member.color}
            fillOpacity={member.userId === currentUserId ? 0.6 : 0.3}
            strokeWidth={member.userId === currentUserId ? 3 : 2}
          />
        ))}

        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
