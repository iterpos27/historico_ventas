import React from 'react';
import { money, percent } from '../utils/format.js';

export const MonthlyHistoryTable = ({ rows = [] }) => (
  <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
    <div className="border-b border-blue-100 bg-softBlue px-4 py-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">Historial por periodo</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-brandDark text-white">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Periodo</th>
            <th className="px-4 py-3 text-right font-semibold">Ventas</th>
            <th className="px-4 py-3 text-right font-semibold">Meta</th>
            <th className="px-4 py-3 text-right font-semibold">Cumplimiento</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.periodo} className="border-b border-blue-100 odd:bg-white even:bg-slate-50">
              <td className="px-4 py-3 font-bold text-brandDark">{row.periodo}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">{money(row.ventas)}</td>
              <td className="px-4 py-3 text-right text-slate-700">{money(row.meta)}</td>
              <td className={`px-4 py-3 text-right font-bold ${Number(row.cumplimiento) >= 100 ? 'text-emerald-600' : 'text-brand'}`}>
                {percent(row.cumplimiento)}
              </td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan="4">Sin historial disponible</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);
