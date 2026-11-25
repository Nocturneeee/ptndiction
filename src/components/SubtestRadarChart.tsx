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
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 40]} stroke="#cbd5e1" />
          <Radar
            name="Bobot Subtes (%)"
            dataKey="weight"
            stroke="#0284c7"
            fill="#0284c7"
            fillOpacity={0.4}
          />
          <Tooltip
            formatter={(value: any) => [`${value}%`, 'Bobot']}
            labelFormatter={(label: any) => SUBTEST_LABELS[label] || label}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
