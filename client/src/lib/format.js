export const CATEGORY_LABELS = {
  Starter: 'Starters',
  'Main Course': 'Mains',
  Dessert: 'Desserts',
  Beverage: 'Drinks',
};

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPrice = (price) => rupees.format(Number(price));

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
