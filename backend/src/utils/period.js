export const currentPeriod = () => new Date().toISOString().slice(0, 7);

export const periodToDateRange = (period = currentPeriod()) => {
  if (!/^\d{4}-\d{2}$/.test(period)) {
    throw new Error('Periodo inválido. Usa formato YYYY-MM.');
  }

  const [year, month] = period.split('-').map(Number);
  const start = `${period}-01`;
  const endDate = new Date(Date.UTC(year, month, 1));
  const end = endDate.toISOString().slice(0, 10);
  return { start, end, period };
};
