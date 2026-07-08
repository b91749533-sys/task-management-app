"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ProgressChartProps {
  data: {
    name: string;
    Created: number;
    Completed: number;
  }[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="h-[260px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(9, 9, 11, 0.9)", 
              borderColor: "rgba(39, 39, 42, 0.8)", 
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)"
            }}
            labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Legend 
            wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }} 
            verticalAlign="bottom"
            align="center"
          />
          <Bar dataKey="Created" fill="url(#createdGrad)" radius={[4, 4, 0, 0]} name="Created" />
          <Bar dataKey="Completed" fill="url(#completedGrad)" radius={[4, 4, 0, 0]} name="Completed" />
          
          {/* Gradients definition for beautiful Vercel/Linear-like chart styles */}
          <defs>
            <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4338ca" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
