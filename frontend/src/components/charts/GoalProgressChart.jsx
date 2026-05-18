import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../../utils/format.js';

const statusColor = (cumplimiento) => {
  const value = Number(cumplimiento || 0);
  if (value > 100) return '#16a34a';
  if (Math.abs(value - 100) < 0.01) return '#1d5596';
  return '#f97316';
};

const chartData = (data) => data.map((row) => {
  const cumplimiento = Number(row.cumplimiento || 0);
  const ventas = Number(row.ventas_periodo || 0);
  const meta = Number(row.monto_meta || 0);
  const diferencia = ventas - meta;
  return {
    ...row,
    ventas,
    meta,
    falta: Math.max(meta - ventas, 0),
    excedente: Math.max(diferencia, 0),
    cumplimiento_real: cumplimiento,
    cumplimiento_visual: Math.min(cumplimiento, 150),
    label: row.nomenclatura || row.nombre,
    estado: diferencia >= 0 ? 'Sobrepaso' : 'Falta'
  };
});

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-semibold text-brandDark">{row.nombre}</p>
      <p>Venta: {money(row.ventas)}</p>
      <p>Meta: {money(row.meta)}</p>
      <p>Cumplimiento: {Number(row.cumplimiento_real || 0).toFixed(2)}%</p>
      {row.estado === 'Sobrepaso' ? (
        <p className="font-semibold text-emerald-600">Sobrepaso: {money(row.excedente)}</p>
      ) : (
        <p className="font-semibold text-orange-600">Falta: {money(row.falta)}</p>
      )}
    </div>
  );
};

export const GoalProgressChart = ({ data = [] }) => (
  <div className="h-80 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="text-xl font-bold text-slate-700">Cumplimiento de Meta</h3>
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />Sobrepaso</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-brand" />En meta</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Falta</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height="80%">
      <BarChart data={chartData(data)} margin={{ top: 22, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontWeight: 700, fill: '#555' }} />
        <YAxis domain={[0, 150]} ticks={[0, 25, 50, 75, 100, 125, 150]} tickFormatter={(value) => `${value}%`} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={100} stroke="#e2762d" strokeDasharray="10 8" strokeWidth={4} />
        <Bar dataKey="cumplimiento_visual" radius={[2, 2, 0, 0]}>
          {chartData(data).map((row) => (
            <Cell key={row.almacen_id || row.label} fill={statusColor(row.cumplimiento_real)} />
          ))}
          <LabelList
            dataKey="cumplimiento_real"
            position="top"
            formatter={(value) => `${Math.round(Number(value || 0))}%`}
            fontWeight={700}
            fill="#3f3f46"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
