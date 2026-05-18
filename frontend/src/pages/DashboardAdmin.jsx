import React, { useState } from 'react';
import { Link, RefreshCw } from 'lucide-react';
import { api } from '../api/client';
import { AdminPanel } from '../components/AdminPanel.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { GoalComplianceTable } from '../components/GoalComplianceTable.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { Modal } from '../components/Modal.jsx';
import { PeriodFilter } from '../components/PeriodFilter.jsx';
import { SummaryCard } from '../components/SummaryCard.jsx';
import { SyncHistoryTable } from '../components/SyncHistoryTable.jsx';
import { GoalProgressChart } from '../components/charts/GoalProgressChart.jsx';
import { MonthlySalesChart } from '../components/charts/MonthlySalesChart.jsx';
import { useApi } from '../hooks/useApi.js';
import { money, percent } from '../utils/format.js';

const currentPeriod = () => new Date().toISOString().slice(0, 7);
const withPeriod = (path, period) => `${path}?periodo=${encodeURIComponent(period)}`;
const previousPeriod = (period) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  return date.toISOString().slice(0, 7);
};

const loadAdminData = async (period) => {
  const [total, ventasPorAlmacen, cumplimiento, branches, goals, users, historial, syncHistory] = await Promise.all([
    api.get(withPeriod('/ventas/total', period)),
    api.get(withPeriod('/ventas/por-almacen', period)),
    api.get(withPeriod('/ventas/cumplimiento-metas', period)),
    api.get('/almacenes'),
    api.get(withPeriod('/metas', period)),
    api.get('/usuarios'),
    api.get('/ventas/historial-mensual'),
    api.get('/sync/historial')
  ]);
  return { total, ventasPorAlmacen, cumplimiento, branches, goals, users, historial, syncHistory };
};

export const DashboardAdmin = ({ activeSection = 'ventas' }) => {
  const [period, setPeriod] = useState(currentPeriod());
  const { data, loading, error, reload } = useApi(() => loadAdminData(period), [period]);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [excelPath, setExcelPath] = useState('C:/Users/Essart Sistemas/OneDrive/Documentos/DATA_PRUEBA.xlsx');
  const [importResult, setImportResult] = useState(null);
  const [replacePeriod, setReplacePeriod] = useState(false);
  const [copyGoalsModalOpen, setCopyGoalsModalOpen] = useState(false);
  const [copyGoalsForm, setCopyGoalsForm] = useState({ from_period: currentPeriod(), to_period: currentPeriod(), overwrite: false });

  const syncDrive = async () => {
    setSyncMessage('');
    setSyncError('');
    try {
      const result = await api.post('/sync/google-drive', { replace_period: replacePeriod });
      const replacement = result.replaced ? ` ${result.replaced} ventas anteriores respaldadas y reemplazadas.` : '';
      setSyncMessage(`Drive sincronizado: ${result.inserted} insertadas, ${result.skipped} duplicadas.${replacement} Total calculado: ${money(result.calculatedTotal)}`);
      setImportResult(result);
      await reload();
    } catch (err) {
      setSyncError(err.message);
    }
  };

  const connectGoogle = () => {
    window.open('http://localhost:4000/api/auth/google', '_blank', 'noopener,noreferrer');
  };

  const importExcel = async (event) => {
    event.preventDefault();
    setSyncMessage('');
    setSyncError('');
    setImportResult(null);
    try {
      const result = await api.post('/sync/excel', { file_path: excelPath, replace_period: replacePeriod });
      setImportResult(result);
      const replacement = result.replaced ? ` ${result.replaced} ventas anteriores respaldadas y reemplazadas.` : '';
      setSyncMessage(`Excel importado: ${result.inserted} insertadas, ${result.skipped} duplicadas.${replacement}`);
      await reload();
    } catch (err) {
      setSyncError(err.message);
    }
  };

  const copyGoals = async (event) => {
    event.preventDefault();
    setSyncMessage('');
    setSyncError('');
    try {
      const result = await api.post('/metas/copiar', copyGoalsForm);
      setSyncMessage(`Metas copiadas: ${result.copied} desde ${result.from_period} hacia ${result.to_period}`);
      setCopyGoalsModalOpen(false);
      setPeriod(copyGoalsForm.to_period);
      await reload();
    } catch (err) {
      setSyncError(err.message);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  const metaGlobal = data.cumplimiento.reduce((sum, row) => sum + Number(row.monto_meta || 0), 0);
  const ventasGlobales = data.cumplimiento.reduce((sum, row) => sum + Number(row.ventas_periodo || 0), 0);
  const cumplimientoGlobal = metaGlobal ? (ventasGlobales / metaGlobal) * 100 : 0;

  const sales = (
    <div className="space-y-5">
      <PeriodFilter value={period} onChange={setPeriod} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brandDark">Ventas por almacén</h3>
          <p className="text-sm text-slate-500">Consulta ventas consolidadas y sincroniza información desde Google Drive.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={connectGoogle} className="flex items-center justify-center gap-2 rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brandDark">
            <Link size={18} />
            Conectar Google
          </button>
          <button onClick={() => setImportModalOpen(true)} className="flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
            Importar Excel
          </button>
          <button onClick={syncDrive} className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">
            <RefreshCw size={18} />
            Sincronizar Drive
          </button>
        </div>
      </div>
      <label className="flex items-start gap-2 rounded-md border border-blue-100 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        <input
          type="checkbox"
          checked={replacePeriod}
          onChange={(event) => setReplacePeriod(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-blue-300 text-brand focus:ring-brand"
        />
        <span>
          <span className="block font-semibold text-brandDark">Reemplazar ventas del periodo importado</span>
          <span className="text-slate-500">Úsalo cuando subas un archivo corregido. El sistema respalda las ventas anteriores de ese periodo antes de borrarlas.</span>
        </span>
      </label>
      {syncMessage ? <div className="rounded-md border border-blue-200 bg-softBlue px-4 py-3 text-sm text-brandDark">{syncMessage}</div> : null}
      <ErrorMessage message={syncError} />
      {importResult?.errors?.length ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-accent shadow-sm">
          {importResult.errors.length} filas no se importaron porque el almacén no existe o el dato es inválido.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total general de ventas" value={money(data.total.total)} helper={period} />
        <SummaryCard label="Meta global" value={money(metaGlobal)} helper="Suma de metas activas" />
        <SummaryCard label="Cumplimiento global" value={percent(cumplimientoGlobal)} />
        <SummaryCard label="Almacenes activos" value={data.branches.filter((branch) => branch.estado).length} />
      </div>
      <GoalProgressChart data={data.cumplimiento} />
      <GoalComplianceTable rows={data.cumplimiento} title="Ventas vs meta por almacén" />
      <MonthlySalesChart data={data.historial} />
      <SyncHistoryTable rows={data.syncHistory} />
      {importModalOpen ? (
        <Modal title="Importar Excel de ventas" onClose={() => setImportModalOpen(false)}>
          <form onSubmit={importExcel} className="space-y-4">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Ruta del archivo en este equipo
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={excelPath}
                onChange={(event) => setExcelPath(event.target.value)}
                required
              />
            </label>
            <div className="rounded-md bg-softBlue px-4 py-3 text-sm text-brandDark">
              Para matriz de ventas se usarán Establecimiento y Total. Si el archivo trae Mes y Año, se registrará como venta mensual del primer día del periodo.
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setImportModalOpen(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cancelar
              </button>
              <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
                Importar
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );

  const goals = (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brandDark">Metas comerciales</h3>
            <p className="text-sm text-slate-500">Administra metas mensuales por almacén para el periodo seleccionado.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-md border border-blue-200 bg-softBlue px-3 py-2 text-sm font-semibold text-brandDark outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="button"
              onClick={() => {
                setCopyGoalsForm({ from_period: previousPeriod(period), to_period: period, overwrite: false });
                setCopyGoalsModalOpen(true);
              }}
              className="rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brandDark"
            >
              Copiar metas de otro mes
            </button>
          </div>
        </div>
      </div>
      {syncMessage ? <div className="rounded-md border border-blue-200 bg-softBlue px-4 py-3 text-sm text-brandDark">{syncMessage}</div> : null}
      <ErrorMessage message={syncError} />
      <AdminPanel section="metas" branches={data.branches} goals={data.goals} users={data.users} onRefresh={reload} defaultPeriod={period} />
      {copyGoalsModalOpen ? (
        <Modal title="Copiar metas por periodo" onClose={() => setCopyGoalsModalOpen(false)}>
          <form onSubmit={copyGoals} className="space-y-4">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Periodo origen
              <input
                type="month"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={copyGoalsForm.from_period}
                onChange={(event) => setCopyGoalsForm({ ...copyGoalsForm, from_period: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Periodo destino
              <input
                type="month"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={copyGoalsForm.to_period}
                onChange={(event) => setCopyGoalsForm({ ...copyGoalsForm, to_period: event.target.value })}
                required
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={copyGoalsForm.overwrite}
                onChange={(event) => setCopyGoalsForm({ ...copyGoalsForm, overwrite: event.target.checked })}
                className="mt-1 h-4 w-4 rounded border-blue-300 text-brand focus:ring-brand"
              />
              <span>
                <span className="block font-semibold text-brandDark">Sobrescribir metas existentes</span>
                <span className="text-slate-500">Actívalo solo si quieres reemplazar metas ya creadas en el periodo destino.</span>
              </span>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setCopyGoalsModalOpen(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cancelar
              </button>
              <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
                Copiar
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );

  const sections = {
    ventas: sales,
    usuarios: <AdminPanel section="usuarios" branches={data.branches} goals={data.goals} users={data.users} onRefresh={reload} />,
    almacenes: <AdminPanel section="almacenes" branches={data.branches} goals={data.goals} users={data.users} onRefresh={reload} />,
    metas: goals
  };

  return sections[activeSection] || sales;
};
