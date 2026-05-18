import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../../utils/format.js';

const buildData = (data, compliance = []) => {
  const complianceByBranch = new Map(compliance.map((row) => [row.almacen_id, row]));

  return data.map((row) => {
    const goal = complianceByBranch.get(row.almacen_id);
    const cumplimiento = Number(goal?.cumplimiento || 0);

    return {
      ...row,
      total: Number(row.total || 0),
      cumplimiento,
      fill: cumplimiento >= 100 ? '#16a34a' : '#1d5596'
    };
  });
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-brandDark">{row.nomenclatura || row.nombre}</p>
      <p>Venta: {money(row.total)}</p>
      {row.cumplimiento ? <p>Cumplimiento: {row.cumplimiento.toFixed(2)}%</p> : null}
    </div>
  );
};

export const SalesBarChart = ({ data = [], compliance = [] }) => (
  <div className="h-72 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <h3 className="mb-4 text-sm font-semibold text-slate-700">Ventas por almacén</h3>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart data={buildData(data, compliance)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="nomenclatura" />
        <YAxis tickFormatter={(value) => money(value).replace(',00', '')} width={88} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
