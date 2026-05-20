import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../../utils/format.js';

const statusColor = (cumplimiento) => {
  const value = Number(cumplimiento || 0);
  if (value > 100) return '#16a34a';
  if (Math.abs(value - 100) < 0.01) return '#1d5596';
  return '#f97316';
};

const chartData = (data) => [...data]
  .sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)))
  .map((row) => ({
    ...row,
    ventas: Number(row.ventas || 0),
    meta: Number(row.meta || 0),
    cumplimiento: Number(row.cumplimiento || 0)
  }));

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-brandDark">{row.periodo}</p>
      <p>Ventas: {money(row.ventas)}</p>
      <p>Meta: {money(row.meta)}</p>
      <p>Cumplimiento: {row.cumplimiento.toFixed(2)}%</p>
    </div>
  );
};

export const MonthlySalesChart = ({ data = [] }) => {
  const rows = chartData(data);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">Ventas totales por mes</h3>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />Supera meta</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-brand" />En meta</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Bajo meta</span>
        </div>
      </div>
      <div className="grid gap-2 sm:hidden">
        {rows.map((row) => (
          <div key={row.periodo} className="rounded-md bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-brandDark">{row.periodo}</span>
              <span className="text-sm font-bold" style={{ color: statusColor(row.cumplimiento) }}>
                {money(row.ventas)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-600">
              <span>Meta: {money(row.meta)}</span>
              <span>{row.cumplimiento.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <div className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 12, right: 18, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="periodo" tick={{ fill: '#475569', fontWeight: 600 }} />
              <YAxis tickFormatter={(value) => money(value).replace('US$', '$')} tick={{ fill: '#475569' }} width={78} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={row.periodo} fill={statusColor(row.cumplimiento)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
