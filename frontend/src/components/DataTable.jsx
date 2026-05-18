import React from 'react';

export const DataTable = ({ columns, rows, empty = 'Sin datos' }) => (
  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
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
                  {column.render ? column.render(row) : row[column.key]}
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
