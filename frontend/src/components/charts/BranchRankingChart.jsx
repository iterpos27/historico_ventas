import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const BranchRankingChart = ({ data = [] }) => (
  <div className="h-72 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-4 text-sm font-semibold text-slate-700">Ranking de almacenes</h3>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart layout="vertical" data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="nombre" width={90} />
        <Tooltip />
        <Bar dataKey="total" fill="#1d5596" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
