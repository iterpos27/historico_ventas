export const money = (value) => new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD'
}).format(Number(value || 0));

export const percent = (value) => `${Number(value || 0).toFixed(2)}%`;
