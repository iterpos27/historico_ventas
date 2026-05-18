import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Power } from 'lucide-react';
import { api } from '../api/client';
import { money } from '../utils/format.js';
import { DataTable } from './DataTable.jsx';
import { ErrorMessage } from './ErrorMessage.jsx';
import { Modal } from './Modal.jsx';

const inputClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

const emptyForms = {
  usuarios: { nombre: '', username: '', email: '', password: '', rol: 'almacen', almacen_id: '', estado: true },
  almacenes: { nombre: '', nomenclatura: '', estado: true },
  metas: { almacen_id: '', periodo: new Date().toISOString().slice(0, 7), monto_meta: '', estado: true }
};

const titles = {
  usuarios: 'usuario',
  almacenes: 'almacén',
  metas: 'meta'
};

export const AdminPanel = ({ section, branches = [], goals = [], users = [], onRefresh, defaultPeriod }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForms[section] || {});

  const currentTitle = titles[section] || 'registro';
  const branchOptions = useMemo(() => branches.filter((branch) => branch.estado), [branches]);

  useEffect(() => {
    setError('');
    setMessage('');
    setModal(null);
  }, [section]);

  const openCreate = () => {
    const base = { ...(emptyForms[section] || {}) };
    if (section === 'metas' && defaultPeriod) {
      base.periodo = defaultPeriod;
    }
    if ((section === 'usuarios' || section === 'metas') && !base.almacen_id) {
      base.almacen_id = branchOptions[0]?.id || '';
    }
    setForm(base);
    setModal({ mode: 'create', id: null });
  };

  const openEdit = (row) => {
    if (section === 'usuarios') {
      setForm({
        nombre: row.nombre,
        username: row.username || '',
        email: row.email,
        password: '',
        rol: row.rol,
        almacen_id: row.almacen_id || branchOptions[0]?.id || '',
        estado: row.estado
      });
    }

    if (section === 'almacenes') {
      setForm({
        nombre: row.nombre,
        nomenclatura: row.nomenclatura,
        estado: row.estado
      });
    }

    if (section === 'metas') {
      setForm({
        almacen_id: row.almacen_id,
        periodo: row.periodo,
        monto_meta: row.monto_meta,
        estado: row.estado
      });
    }

    setModal({ mode: 'edit', id: row.id });
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const payload = { ...form };
    if (section === 'usuarios' && payload.rol !== 'almacen') payload.almacen_id = null;
    if (section === 'usuarios' && modal.mode === 'edit' && !payload.password) delete payload.password;

    try {
      if (modal.mode === 'edit') {
        await api.put(`/${section}/${modal.id}`, payload);
      } else {
        await api.post(`/${section}`, payload);
      }
      setMessage(`${currentTitle.charAt(0).toUpperCase()}${currentTitle.slice(1)} guardado correctamente`);
      setModal(null);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const deactivate = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.patch(`/${section}/${id}/desactivar`);
      setMessage(`${currentTitle.charAt(0).toUpperCase()}${currentTitle.slice(1)} desactivado`);
      await onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderForm = () => (
    <form onSubmit={save} className="grid gap-4">
      {section === 'usuarios' ? (
        <>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Nombre
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Nombre de usuario
            <input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ej. admin" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Email
            <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            {modal?.mode === 'edit' ? 'Nueva contraseña opcional' : 'Contraseña'}
            <input className={inputClass} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={modal?.mode === 'create'} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Rol
            <select className={inputClass} value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option value="almacen">Almacén</option>
              <option value="jefe_comercial">Jefe comercial</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {form.rol === 'almacen' ? (
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Almacén
              <select className={inputClass} value={form.almacen_id} onChange={(e) => setForm({ ...form, almacen_id: e.target.value })} required>
                {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}
              </select>
            </label>
          ) : null}
        </>
      ) : null}

      {section === 'almacenes' ? (
        <>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Nombre
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Nomenclatura
            <input className={inputClass} value={form.nomenclatura} onChange={(e) => setForm({ ...form, nomenclatura: e.target.value })} required />
          </label>
        </>
      ) : null}

      {section === 'metas' ? (
        <>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Almacén
            <select className={inputClass} value={form.almacen_id} onChange={(e) => setForm({ ...form, almacen_id: e.target.value })} required>
              {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Periodo
            <input className={inputClass} type="month" value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Monto meta
            <input className={inputClass} type="number" min="0" step="0.01" value={form.monto_meta} onChange={(e) => setForm({ ...form, monto_meta: e.target.value })} required />
          </label>
        </>
      ) : null}

      {modal?.mode === 'edit' ? (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={Boolean(form.estado)} onChange={(e) => setForm({ ...form, estado: e.target.checked })} />
          Activo
        </label>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => setModal(null)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          Cancelar
        </button>
        <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
          Guardar
        </button>
      </div>
    </form>
  );

  const actionColumn = {
    key: 'acciones',
    label: '',
    render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="grid h-8 w-8 place-items-center rounded-md bg-softBlue text-brandDark" title="Editar">
          <Edit size={16} />
        </button>
        {row.estado ? (
          <button onClick={() => deactivate(row.id)} className="grid h-8 w-8 place-items-center rounded-md bg-red-50 text-accent" title="Desactivar">
            <Power size={16} />
          </button>
        ) : (
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">Inactivo</span>
        )}
      </div>
    )
  };

  const tables = {
    usuarios: {
      rows: users,
      columns: [
        { key: 'nombre', label: 'Usuario' },
        { key: 'username', label: 'Login', render: (row) => row.username || '-' },
        { key: 'email', label: 'Email' },
        { key: 'rol', label: 'Rol' },
        { key: 'almacen_nombre', label: 'Almacén', render: (row) => row.almacen_nombre || '-' },
        actionColumn
      ]
    },
    almacenes: {
      rows: branches,
      columns: [
        { key: 'nombre', label: 'Almacén' },
        { key: 'nomenclatura', label: 'Código' },
        { key: 'estado', label: 'Estado', render: (row) => row.estado ? 'Activo' : 'Inactivo' },
        actionColumn
      ]
    },
    metas: {
      rows: goals,
      columns: [
        { key: 'almacen_nombre', label: 'Almacén' },
        { key: 'periodo', label: 'Periodo' },
        { key: 'monto_meta', label: 'Meta', render: (row) => money(row.monto_meta) },
        { key: 'estado', label: 'Estado', render: (row) => row.estado ? 'Activa' : 'Inactiva' },
        actionColumn
      ]
    }
  };

  const table = tables[section];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3">
        {message ? <div className="rounded-md border border-blue-200 bg-softBlue px-4 py-3 text-sm text-brandDark">{message}</div> : null}
        <ErrorMessage message={error} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brandDark">Gestión de {section}</h3>
          <p className="text-sm text-slate-500">Crea, edita y desactiva registros desde una ventana modal.</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">
          <Plus size={18} />
          Nuevo {currentTitle}
        </button>
      </div>

      <DataTable columns={table.columns} rows={table.rows} />

      {modal ? (
        <Modal title={`${modal.mode === 'edit' ? 'Editar' : 'Crear'} ${currentTitle}`} onClose={() => setModal(null)}>
          {renderForm()}
        </Modal>
      ) : null}
    </section>
  );
};
