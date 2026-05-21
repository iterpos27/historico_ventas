export const currentPeriod = () => new Date().toISOString().slice(0, 7);
export const isValidPeriod = (period) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(period || ''));

export const periodToDateRange = (period = currentPeriod()) => {
  if (!isValidPeriod(period)) {
    const error = new Error('Periodo invalido. Usa formato YYYY-MM.');
    error.statusCode = 400;
    throw error;
  }

  const [year, month] = period.split('-').map(Number);
  const start = `${period}-01`;
  const endDate = new Date(Date.UTC(year, month, 1));
  const end = endDate.toISOString().slice(0, 10);
  return { start, end, period };
};
