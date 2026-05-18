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

  return (
    <div className="space-y-6">
      <PeriodFilter value={period} onChange={setPeriod} />
      <div>
        <h3 className="text-2xl font-semibold text-brandDark">{user.almacen_nombre}</h3>
        <p className="text-sm font-medium text-slate-500">{user.almacen_nomenclatura}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Meta del mes" value={money(goal.monto_meta)} tone="brand" />
        <SummaryCard label="Ventas del mes" value={money(data.resumen.ventas_mes)} tone={tone} />
        <SummaryCard label="Cumplimiento" value={percent(goal.cumplimiento)} tone={tone} />
        <SummaryCard label={statusLabel} value={statusValue} tone={statusTone} />
      </div>
      <MonthlySalesChart data={data.historial} />
    </div>
  );
};
