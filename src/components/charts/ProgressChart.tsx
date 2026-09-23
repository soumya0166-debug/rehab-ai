'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export interface ProgressChartProps {
  data: { label: string; value: number; target?: number }[];
  targetValue?: number;
  unit?: string;
  yMin?: number;
  yMax?: number;
}

export function ProgressChart({
  data,
  targetValue = 172,
  unit = '°',
  yMin = 140,
  yMax = 185,
}: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-500">
        No telemetry sessions recorded yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
          <YAxis domain={[yMin, yMax]} stroke="#64748b" fontSize={11} unit={unit} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          {targetValue && (
            <ReferenceLine
              y={targetValue}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: `Target (${targetValue}${unit})`, fill: '#10b981', fontSize: 11 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ fill: '#06b6d4', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
