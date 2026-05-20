import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi.js';

export const GoogleStatusBadge = () => {
  const { data, loading, error } = useApi(() => api.get('/auth/google/status'), []);
  const connected = Boolean(data?.connected);

  if (loading) {
    return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Google revisando...</span>;
  }

  if (error || !connected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-accent">
        <XCircle size={14} />
        Google no conectado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      <CheckCircle2 size={14} />
      Google conectado
    </span>
  );
};
