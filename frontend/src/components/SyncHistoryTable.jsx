import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { money } from '../utils/format.js';

const formatDate = (value) => value ? new Date(value).toLocaleString('es-EC') : '-';

export const SyncHistoryTable = ({ rows = [] }) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(Math.ceil(rows.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage]);

  return (
    <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 border-b border-blue-100 bg-softBlue px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">Ultimas sincronizaciones</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {rows.length ? `${rows.length} registros disponibles` : 'Sin registros disponibles'}
          </p>
        </div>
        <ChevronDown className={`shrink-0 text-brandDark transition ${open ? 'rotate-180' : ''}`} size={20} />
      </button>

      {open ? (
        <div>
          <div className="divide-y divide-blue-100 sm:hidden">
            {visibleRows.map((row) => (
              <article key={row.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-brandDark">{row.tipo}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{formatDate(row.created_at)}</p>
                  </div>
                  <span className={`text-xs font-bold ${row.estado === 'ok' ? 'text-emerald-600' : 'text-accent'}`}>{row.estado}</span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-1.5">
                  <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Periodo</dt>
                    <dd className="mt-1 text-xs font-semibold text-slate-700">{row.periodo || '-'}</dd>
                  </div>
                  <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total</dt>
                    <dd className="mt-1 text-xs font-semibold text-slate-900">{money(row.total_calculado)}</dd>
                  </div>
                  <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Insertadas</dt>
                    <dd className="mt-1 text-xs font-semibold text-slate-700">{row.insertadas}</dd>
                  </div>
                  <div className="rounded-md bg-slate-50 px-2.5 py-1.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Duplicadas</dt>
                    <dd className="mt-1 text-xs font-semibold text-slate-700">{row.duplicadas}</dd>
                  </div>
                </dl>
                <p className="mt-2 truncate text-xs text-slate-500">{row.archivo_nombre || '-'}</p>
              </article>
            ))}
            {!visibleRows.length ? (
              <div className="p-6 text-center text-sm text-slate-500">Todavia no hay sincronizaciones registradas</div>
            ) : null}
          </div>

          <div className="hidden overflow-x-auto sm:block">
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
                {visibleRows.map((row) => (
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
                {!visibleRows.length ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan="8">Todavia no hay sincronizaciones registradas</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {rows.length > pageSize ? (
            <div className="flex flex-col gap-3 border-t border-blue-100 bg-white px-4 py-3 text-center sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Página {currentPage} de {totalPages}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(value - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brandDark disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  Anterior
                </button>
              <button
                type="button"
                  onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                  Siguiente
              </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
