/**
 * Composant graphique pour analytics admin
 * Phase 4 - Admin Interface
 * Utilise Recharts pour les visualisations
 */

'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface YKeyConfig {
  key: string;
  label: string;
  color: string;
}

interface AnalyticsChartProps {
  data: any[];
  type: 'line' | 'bar';
  xKey: string;
  yKeys: YKeyConfig[];
  height?: number;
}

export function AnalyticsChart({
  data,
  type,
  xKey,
  yKeys,
  height = 300,
}: AnalyticsChartProps) {
  // Format date for display
  const formatXAxis = (value: string) => {
    if (!value) return '';

    // If it's a date string
    if (value.includes('-') || value.includes('/')) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('fr-FR', {
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return value;
      }
    }

    // If it's a feature name, truncate if too long
    return value.length > 20 ? value.substring(0, 18) + '...' : value;
  };

  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    return value.toLocaleString('fr-FR');
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">{formatTooltipValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xKey}
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
            stroke="#888888"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#888888" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="circle"
          />
          {yKeys.map((yKey) => (
            <Line
              key={yKey.key}
              type="monotone"
              dataKey={yKey.key}
              name={yKey.label}
              stroke={yKey.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey={xKey}
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          stroke="#888888"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} stroke="#888888" />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
          iconType="rect"
        />
        {yKeys.map((yKey) => (
          <Bar
            key={yKey.key}
            dataKey={yKey.key}
            name={yKey.label}
            fill={yKey.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
