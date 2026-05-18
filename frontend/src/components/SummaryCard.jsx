import React from 'react';

const tones = {
  default: {
    card: 'border-blue-100',
    label: 'text-slate-500',
    value: 'text-brandDark'
  },
  success: {
    card: 'border-emerald-200 bg-emerald-50/60',
    label: 'text-emerald-700',
    value: 'text-emerald-700'
  },
  brand: {
    card: 'border-blue-200 bg-softBlue',
    label: 'text-brandDark',
    value: 'text-brandDark'
  },
  warning: {
    card: 'border-orange-200 bg-orange-50/70',
    label: 'text-orange-700',
    value: 'text-orange-700'
  },
  danger: {
    card: 'border-red-200 bg-red-50/70',
    label: 'text-red-700',
    value: 'text-red-700'
  }
};

export const SummaryCard = ({ label, value, helper, tone = 'default' }) => {
  const styles = tones[tone] || tones.default;

  return (
    <div className={`rounded-lg border p-5 shadow-sm shadow-blue-950/5 ring-1 ring-white ${styles.card}`}>
      <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${styles.value}`}>{value}</p>
    {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
};
