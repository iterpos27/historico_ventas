import React from 'react';
import { Activity, CheckCircle2, Database, FileSpreadsheet, Wifi, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi.js';
import { money } from '../utils/format.js';
import { ErrorMessage } from './ErrorMessage.jsx';
import { LoadingState } from './LoadingState.jsx';

const formatDate = (value) => value ? new Date(value).toLocaleString('es-EC') : '-';

const StatusPill = ({ ok, label }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
    ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-accent'
  }`}
  >
    {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
    {label}
  </span>
);

const StatusCard = ({ icon: Icon, title, children, ok }) => (
  <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-softBlue text-brandDark">
          <Icon size={18} />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">{title}</h3>
      </div>
      <StatusPill ok={ok} label={ok ? 'OK' : 'Revisar'} />
    </div>
    {children}
  </div>
);

export const SystemStatusPanel = () => {
  const { data, loading, error } = useApi(() => api.get('/status'), []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorMessage message={error} />;

  const latest = data.latest_sync;

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-brandDark">Estado del sistema</h3>
        <p className="text-sm text-slate-500">Revisa conexión Google, base de datos y última sincronización.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatusCard icon={Wifi} title="Google Drive" ok={data.google.connected}>
          <p className="text-sm text-slate-600">
            {data.google.connected
              ? 'Google está conectado y listo para sincronizar.'
              : 'Google no está conectado. Usa Conectar Google desde Ventas.'}
          </p>
        </StatusCard>

        <StatusCard icon={Database} title="Base de datos" ok={data.database.ok}>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Latencia</dt>
              <dd className="font-semibold text-brandDark">{data.database.latency_ms} ms</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Última revisión</dt>
              <dd className="text-right font-semibold text-brandDark">{formatDate(data.database.checked_at)}</dd>
            </div>
          </dl>
        </StatusCard>

        <StatusCard icon={Activity} title="Sincronización" ok={Boolean(latest) && latest.estado === 'ok'}>
          <p className="text-sm text-slate-600">
            {latest ? `Último estado: ${latest.estado}` : 'Todavía no hay sincronizaciones registradas.'}
          </p>
        </StatusCard>
      </div>

      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-softBlue text-brandDark">
            <FileSpreadsheet size={18} />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-brandDark">Último archivo leído</h3>
        </div>
        {latest ? (
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</dt>
              <dd className="mt-1 font-semibold text-brandDark">{formatDate(latest.created_at)}</dd>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Archivo</dt>
              <dd className="mt-1 break-words font-semibold text-brandDark">{latest.archivo_nombre || '-'}</dd>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Periodo</dt>
              <dd className="mt-1 font-semibold text-brandDark">{latest.periodo || '-'}</dd>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total calculado</dt>
              <dd className="mt-1 font-semibold text-brandDark">{money(latest.total_calculado)}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-500">No hay archivos sincronizados todavía.</p>
        )}
      </div>
    </section>
  );
};
