export const money = (value) => new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD'
}).format(Number(value || 0));

export const percent = (value) => `${Number(value || 0).toFixed(2)}%`;

export const cutoffDateTime = (value) => {
  if (!value) return 'SIN FECHA DE CORTE';

  const date = new Date(value);
  const dateParts = new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Guayaquil'
  }).formatToParts(date);
  const day = dateParts.find((part) => part.type === 'day')?.value;
  const month = dateParts.find((part) => part.type === 'month')?.value;
  const year = dateParts.find((part) => part.type === 'year')?.value;
  const formattedDate = `${day} DE ${String(month || '').toUpperCase()} ${year}`;

  const formattedTime = new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Guayaquil'
  }).format(date);

  return `${formattedDate} - ${formattedTime}`;
};
