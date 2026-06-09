import React from 'react';
import { Clock3 } from 'lucide-react';
import { cutoffDateTime } from '../utils/format.js';

export const CutoffLegend = ({ cutoff }) => {
  const cutoffAt = cutoff?.cutoff_at || cutoff?.archivo_modificado_at || cutoff?.created_at;

  return (
    <div className="flex justify-end">
      <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-brandDark shadow-sm sm:text-sm">
        <Clock3 size={16} />
        <span>Fecha de corte: {cutoffDateTime(cutoffAt)}</span>
      </div>
    </div>
  );
};
