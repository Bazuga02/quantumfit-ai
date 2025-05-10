import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const bodyParts = [
  'All', 'Chest', 'Back', 'Arms', 'Waist', 'Hips', 'Thighs', 'Full Body', 'Other'
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl shadow-lg border bg-white dark:bg-gray-900 px-4 py-3">
        <div className="font-semibold text-primary mb-1">{label}</div>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm mb-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: entry.color }}></span>
            <span className="font-medium">{entry.name}:</span>
            <span className="font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function ProgressGraph({ measurements }: { measurements: any[] }) {
  const [selectedPart, setSelectedPart] = useState('All');
  if (!measurements || measurements.length === 0) return null;
  // Format data for chart
  const data = measurements.map((m: any) => ({
    date: m.date ? new Date(m.date).toLocaleDateString() : '',
    weight: m.weight,
    bodyFat: m.body_fat || m.bodyFat,
    chest: m.chest,
    back: m.back,
    arms: m.arms,
    waist: m.waist,
    hips: m.hips,
    thighs: m.thighs,
    fullBody: m['full_body'] || m['Full Body'],
    other: m.other
  }));

  // Filter logic for body part
  let lines = [
    <Line
      key="weight"
      type="monotone"
      dataKey="weight"
      stroke="url(#weightGradient)"
      strokeWidth={4}
      dot={{ r: 7, fill: '#e11d48', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 2px 6px #e11d4840)' }}
      activeDot={{ r: 10, fill: '#e11d48', stroke: '#fff', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #e11d48)' }}
      name="Weight (kg)"
      isAnimationActive={true}
      animationDuration={1200}
    />,
    <Line
      key="bodyFat"
      type="monotone"
      dataKey="bodyFat"
      stroke="#fbbf24"
      strokeWidth={3}
      dot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 2px 6px #fbbf2440)' }}
      activeDot={{ r: 9, fill: '#fbbf24', stroke: '#fff', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #fbbf24)' }}
      name="Body Fat (%)"
      isAnimationActive={true}
      animationDuration={1200}
    />
  ];
  if (selectedPart !== 'All') {
    const partKey = selectedPart.toLowerCase().replace(/ /g, '');
    lines = [
      <Line
        key={partKey}
        type="monotone"
        dataKey={partKey}
        stroke="#3b82f6"
        strokeWidth={4}
        dot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 2px 6px #3b82f640)' }}
        activeDot={{ r: 10, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3, filter: 'drop-shadow(0 2px 8px #3b82f6)' }}
        name={`${selectedPart} (cm)`}
        isAnimationActive={true}
        animationDuration={1200}
      />
    ];
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-xl font-extrabold text-primary mb-0 tracking-tight">Progress Over Time</h3>
        <select
          className="ml-auto border border-primary/40 rounded-full px-4 py-1.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
          value={selectedPart}
          onChange={e => setSelectedPart(e.target.value)}
        >
          {bodyParts.map(bp => (
            <option key={bp} value={bp}>{bp}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 