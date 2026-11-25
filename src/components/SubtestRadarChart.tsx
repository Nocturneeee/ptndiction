'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import type { SubtestWeights } from '@/lib/scoring-engine';

interface SubtestRadarChartProps {
  weights: SubtestWeights;
  prioritySubtests: string[];
}

const SUBTEST_LABELS: Record<string, string> = {
  PU: 'Penalaran Umum',
  PPU: 'Pengetahuan & Pemahaman Umum',
  PBM: 'Pemahaman Bacaan & Menulis',
  PK: 'Pengetahuan Kuantitatif',
  LBI: 'Literasi Bahasa Indonesia',
  LBE: 'Literasi Bahasa Inggris',
  PM: 'Penalaran Matematika',
};

export default function SubtestRadarChart({
  weights,
  prioritySubtests,
}: SubtestRadarChartProps) {
  const data = Object.entries(weights).map(([key, val]) => ({
    subject: key,
    name: SUBTEST_LABELS[key] || key,
    weight: Number((val * 100).toFixed(1)), // percentage
    isPriority: prioritySubtests.includes(key),
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ payload, x, y, cx, cy, textAnchor }: any) => {
              const isPrio = prioritySubtests.includes(payload.value);
              return (
                <text
                  x={x}
                  y={y}
                  fill={isPrio ? '#34d399' : '#a1a1aa'}
                  fontSize={11}
                  fontWeight={isPrio ? 700 : 500}
                  textAnchor={textAnchor}
                  className="font-mono"
                >
                  {payload.value}
                </text>
              );
            }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 40]} stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} />
          <Radar
            name="Bobot Subtes (%)"
            dataKey="weight"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.22}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '0.75rem',
              color: '#f4f4f5',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value}%`, 'Bobot']}
            labelFormatter={(label: any) => SUBTEST_LABELS[label] || label}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
