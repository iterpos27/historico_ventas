import React from 'react';
import { money, percent } from '../utils/format.js';

const numeric = (value) => Number(value || 0);
const complianceClass = (value) => {
  const cumplimiento = numeric(value);
  if (cumplimiento > 100) return 'text-emerald-600';
  if (Math.abs(cumplimiento - 100) < 0.01) return 'text-brand';
  return 'text-orange-500';
};

export const GoalComplianceTable = ({ rows = [], title = 'Cumplimiento comercial' }) => {
  const totals = rows.reduce((acc, row) => {
    acc.ventas += numeric(row.ventas_periodo);
    acc.meta += numeric(row.monto_meta);
    acc.falta += Math.max(numeric(row.monto_meta) - numeric(row.ventas_periodo), 0);
    acc.excedente += Math.max(numeric(row.ventas_periodo) - numeric(row.monto_meta), 0);
    return acc;
  }, { ventas: 0, meta: 0, falta: 0, excedente: 0 });

  const cumplimientoGlobal = totals.meta ? (totals.ventas / totals.meta) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-blue-100 bg-softBlue px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">{title}</h3>
        <div className="text-sm font-semibold text-brandDark">
          Meta global: {money(totals.meta)} | {percent(cumplimientoGlobal)}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand text-white">
              <th className="px-3 py-2 text-left font-bold">Almacén</th>
              <th className="px-3 py-2 text-right font-bold">Venta</th>
              <th className="px-3 py-2 text-right font-bold">Meta</th>
              <th className="px-3 py-2 text-right font-bold">% Cump</th>
              <th className="px-3 py-2 text-right font-bold">Falta</th>
              <th className="px-3 py-2 text-right font-bold">Sobrepaso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ventas = numeric(row.ventas_periodo);
              const meta = numeric(row.monto_meta);
              const falta = Math.max(meta - ventas, 0);
              const excedente = Math.max(ventas - meta, 0);
              const cumplimiento = numeric(row.cumplimiento);

              return (
                <tr key={row.almacen_id} className="border-b border-blue-100 odd:bg-white even:bg-slate-50">
                  <td className="px-3 py-2 font-bold text-brandDark">{row.nomenclatura || row.nombre}</td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">{money(ventas)}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{money(meta)}</td>
                  <td className={`px-3 py-2 text-right font-bold ${complianceClass(cumplimiento)}`}>{percent(cumplimiento)}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{money(falta)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-accent">{excedente > 0 ? money(excedente) : '-'}</td>
                </tr>
              );
            })}
            <tr className="bg-accent text-white">
              <td className="px-3 py-2 font-bold">Total</td>
              <td className="px-3 py-2 text-right font-bold">{money(totals.ventas)}</td>
              <td className="px-3 py-2 text-right font-bold">{money(totals.meta)}</td>
              <td className={`px-3 py-2 text-right font-bold ${cumplimientoGlobal >= 100 ? 'text-white' : 'text-orange-100'}`}>{percent(cumplimientoGlobal)}</td>
              <td className="px-3 py-2 text-right font-bold">{money(totals.falta)}</td>
              <td className="px-3 py-2 text-right font-bold">{totals.excedente > 0 ? money(totals.excedente) : '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
