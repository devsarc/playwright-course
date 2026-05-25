'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardChartsProps {
  stats: { todo: number; inProgress: number; inReview: number; done: number };
}

const COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e'];

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const data = [
    { name: 'To Do', count: stats.todo },
    { name: 'In Progress', count: stats.inProgress },
    { name: 'In Review', count: stats.inReview },
    { name: 'Done', count: stats.done },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Tasks by status</h2>
        <ResponsiveContainer width="100%" height={220} className="mt-4">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#4f6ef7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Task distribution</h2>
        <ResponsiveContainer width="100%" height={220} className="mt-4">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                (percent ?? 0) > 0 ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
