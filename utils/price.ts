// Accepts "1,29,900" and "₹71,999.00"; the decimal part is dropped.
export const parsePrice = (text: string) => parseInt(text.split('.')[0].replace(/[^\d]/g, ''), 10);
