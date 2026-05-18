import React from 'react';
import { CalendarDays } from 'lucide-react';

const currentPeriod = () => new Date().toISOString().slice(0, 7);

export const PeriodFilter = ({ value = currentPeriod(), onChange }) => (
  <div className="flex flex-col gap-2 rounded-lg border border-blue-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2 text-sm font-semibold text-brandDark">
      <CalendarDays size={18} />
      Periodo de consulta
    </div>
    <input
      type="month"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-md border border-blue-200 bg-softBlue px-3 py-2 text-sm font-semibold text-brandDark outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
    />
  </div>
);
