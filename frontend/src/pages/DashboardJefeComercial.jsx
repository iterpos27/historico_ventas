import React, { useState } from 'react';
import { api } from '../api/client';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { GoalComplianceTable } from '../components/GoalComplianceTable.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PeriodFilter } from '../components/PeriodFilter.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { GoalProgressChart } from '../components/charts/GoalProgressChart.jsx';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart.jsx';
import { useApi } from '../hooks/useApi.js';
import { money, percent } from '../utils/format.js';

const currentPeriod = () => new Date().toISOString().slice(0, 7);
const withPeriod = (path, period) => `${path}?periodo=${encodeURIComponent(period)}`;

const loadDataByPeriod = async (period) => {
  const [total, cumplimiento, historial] = await Promise.all([
    api.get(withPeriod('/ventas/total', period)),
    api.get(withPeriod('/ventas/cumplimiento-metas', period)),
    api.get('/ventas/historial-mensual')
  ]);
  return { total, cumplimiento, historial };
};

export const DashboardJefeComercial = ({ activeSection = 'ventas' }) => {
  const [period, setPeriod] = useState(currentPeriod());
  const { data, loading, error } = useApi(() => loadDataByPeriod(period), [period]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  const metaGlobal = data.cumplimiento.reduce((sum, row) => sum + Number(row.monto_meta || 0), 0);
  const ventasGlobales = data.cumplimiento.reduce((sum, row) => sum + Number(row.ventas_periodo || 0), 0);
  const cumplimientoGlobal = metaGlobal ? (ventasGlobales / metaGlobal) * 100 : 0;

  const ventas = (
    <div className="space-y-6">
      <PeriodFilter value={period} onChange={setPeriod} />
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total global de ventas" value={money(data.total.total)} helper={period} />
        <SummaryCard label="Meta global" value={money(metaGlobal)} />
        <SummaryCard label="Cumplimiento global" value={percent(cumplimientoGlobal)} />
        <SummaryCard label="Almacenes con meta" value={data.cumplimiento.length} />
      </div>
      <MonthlySalesChart data={data.historial} />
      <GoalComplianceTable rows={data.cumplimiento} />
      <GoalProgressChart data={data.cumplimiento} />
    </div>
  );

  const sections = { ventas };
  return sections[activeSection] || ventas;
};
