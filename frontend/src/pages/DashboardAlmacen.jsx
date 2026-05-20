import React, { useState } from 'react';
import { api } from '../api/client';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PeriodFilter } from '../components/PeriodFilter.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { money, percent } from '../utils/format.js';

const currentPeriod = () => new Date().toISOString().slice(0, 7);
const withPeriod = (path, period) => `${path}?periodo=${encodeURIComponent(period)}`;
const complianceTone = (value) => {
  const cumplimiento = Number(value || 0);
  if (cumplimiento >= 100) return 'success';
  if (Math.abs(cumplimiento - 100) < 0.01) return 'brand';
  return 'danger';
};

const progressColor = (value) => {
  const cumplimiento = Number(value || 0);
  if (cumplimiento >= 100) return 'bg-emerald-600';
  if (Math.abs(cumplimiento - 100) < 0.01) return 'bg-brand';
  return 'bg-orange-500';
};

const loadData = async (period) => {
  const [resumen, cumplimiento, historial] = await Promise.all([
    api.get(withPeriod('/ventas/resumen', period)),
    api.get(withPeriod('/ventas/cumplimiento-metas', period)),
    api.get('/ventas/historial-mensual')
  ]);
  return { resumen, cumplimiento, historial };
};

export const DashboardAlmacen = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState(currentPeriod());
  const { data, loading, error } = useApi(() => loadData(period), [period]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  const goal = data.cumplimiento[0] || {};
  const tone = complianceTone(goal.cumplimiento);
  const ventasMes = Number(data.resumen.ventas_mes || 0);
  const metaMes = Number(goal.monto_meta || 0);
  const diferencia = ventasMes - metaMes;
  const statusLabel = diferencia >= 0 ? 'Sobrepaso' : 'Falta';
  const statusValue = money(Math.abs(diferencia));
  const statusTone = diferencia >= 0 ? 'success' : 'danger';
  const progress = Math.min(Number(goal.cumplimiento || 0), 150);

  return (
    <div className="space-y-6">
      <PeriodFilter value={period} onChange={setPeriod} />
      <div>
        <h3 className="text-2xl font-semibold text-brandDark">{user.almacen_nombre}</h3>
        <p className="text-sm font-medium text-slate-500">{user.almacen_nomenclatura}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Meta del mes" value={money(goal.monto_meta)} tone="brand" />
        <SummaryCard label="Ventas del mes" value={money(data.resumen.ventas_mes)} tone={tone} />
        <SummaryCard label="Cumplimiento" value={percent(goal.cumplimiento)} tone={tone} />
        <SummaryCard label={statusLabel} value={statusValue} tone={statusTone} />
      </div>
      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">Cumplimiento de meta</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">{period}</p>
          </div>
          <span className={`text-lg font-bold ${tone === 'success' ? 'text-emerald-600' : tone === 'brand' ? 'text-brand' : 'text-orange-500'}`}>
            {percent(goal.cumplimiento)}
          </span>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${progressColor(goal.cumplimiento)}`}
            style={{ width: `${progress / 1.5}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>0%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>
      <MonthlySalesChart data={data.historial} />
    </div>
  );
};
