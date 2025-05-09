export const formatDateArabic = (date: Date): string => {
  return date.toLocaleDateString('ar-JO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTimeArabic = (date: Date): string => {
  return date.toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)} د.أ`;
};