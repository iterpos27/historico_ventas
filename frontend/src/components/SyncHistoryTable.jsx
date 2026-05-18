import React from 'react';
import { money } from '../utils/format.js';

const formatDate = (value) => value ? new Date(value).toLocaleString('es-EC') : '-';

export const SyncHistoryTable = ({ rows = [] }) => (
  <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
    <div className="border-b border-blue-100 bg-softBlue px-4 py-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">Últimas sincronizaciones</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-brandDark text-white">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold">Tipo</th>
            <th className="px-4 py-3 text-left font-semibold">Archivo</th>
            <th className="px-4 py-3 text-left font-semibold">Periodo</th>
            <th className="px-4 py-3 text-right font-semibold">Insertadas</th>
            <th className="px-4 py-3 text-right font-semibold">Duplicadas</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
            <th className="px-4 py-3 text-left font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-blue-100 odd:bg-white even:bg-slate-50">
              <td className="px-4 py-3 text-slate-700">{formatDate(row.created_at)}</td>
              <td className="px-4 py-3 font-semibold text-brandDark">{row.tipo}</td>
              <td className="max-w-64 truncate px-4 py-3 text-slate-700">{row.archivo_nombre || '-'}</td>
              <td className="px-4 py-3 text-slate-700">{row.periodo || '-'}</td>
              <td className="px-4 py-3 text-right text-slate-700">{row.insertadas}</td>
              <td className="px-4 py-3 text-right text-slate-700">{row.duplicadas}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">{money(row.total_calculado)}</td>
              <td className={`px-4 py-3 font-bold ${row.estado === 'ok' ? 'text-emerald-600' : 'text-accent'}`}>{row.estado}</td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan="8">Todavía no hay sincronizaciones registradas</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);
