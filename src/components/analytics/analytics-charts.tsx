"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

interface PriorityData {
  name: string;
  count: number;
  color: string;
}

interface CategoryData {
  name: string;
  count: number;
  color: string;
}

interface AnalyticsChartsProps {
  priorityData: PriorityData[];
  categoryData: CategoryData[];
}

export default function AnalyticsCharts({ priorityData, categoryData }: AnalyticsChartsProps) {
  const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/90 border border-zinc-800 p-2.5 rounded-lg shadow-xl backdrop-blur-md text-[11px]">
          <p className="font-semibold text-zinc-100">{payload[0].name}</p>
          <p className="text-indigo-400 mt-0.5">
            Tasks: <span className="font-bold text-white">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Priority Chart */}
      <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-[300px]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-200">Priority Distribution</h3>
          <p className="text-[11px] text-zinc-500">Volume of tasks grouped by importance levels</p>
        </div>
        <div className="flex-1 w-full min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(39, 39, 42, 0.15)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#71717a" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(39, 39, 42, 0.15)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Chart */}
      <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between h-[300px]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-200">Category Allocation</h3>
          <p className="text-[11px] text-zinc-500">Task counts mapped across different tags</p>
        </div>
        <div className="flex-1 w-full min-h-[180px]">
          {categoryData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No category data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
