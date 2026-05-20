import React from 'react';

const renderCell = (column, row) => (column.render ? column.render(row) : row[column.key]);

export const DataTable = ({ columns, rows, empty = 'Sin datos' }) => (
  <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="divide-y divide-slate-100 sm:hidden">
      {rows?.length ? rows.map((row, index) => {
        const actionColumn = columns.find((column) => !column.label);
        const detailColumns = columns.filter((column) => column.label);
        const titleColumn = detailColumns[0];

        return (
          <article key={row.id || row.almacen_id || index} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-xs font-bold text-brandDark">
                  {titleColumn ? renderCell(titleColumn, row) : `Registro ${index + 1}`}
                </p>
                {detailColumns[1] ? (
                  <p className="mt-1 break-words text-[11px] font-semibold text-slate-500">
                    {renderCell(detailColumns[1], row)}
                  </p>
                ) : null}
              </div>
              {actionColumn ? <div className="shrink-0">{renderCell(actionColumn, row)}</div> : null}
            </div>
            <dl className="mt-2 grid gap-1.5">
              {detailColumns.slice(2).map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-1.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{column.label}</dt>
                  <dd className="break-words text-right text-xs font-medium text-slate-700">{renderCell(column, row)}</dd>
                </div>
              ))}
            </dl>
          </article>
        );
      }) : (
        <div className="p-6 text-center text-sm text-slate-500">{empty}</div>
      )}
    </div>

    <div className="hidden overflow-x-auto sm:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => <th key={column.key} className="table-head">{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows?.length ? rows.map((row, index) => (
            <tr key={row.id || row.almacen_id || index}>
              {columns.map((column) => (
                <td key={column.key} className="table-cell">
                  {renderCell(column, row)}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td className="table-cell text-center" colSpan={columns.length}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
