export const MAX_QUANTITY = 20;
export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_FROM = 499;
export const GST_RATE = 0.05;

const roundMoney = (value) => Math.round(value * 100) / 100;

// Same rules as server/src/utils/pricing.js, so the cart shows the total before the order is placed
export const calculateTotals = (items) => {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const tax = Math.round(subtotal * GST_RATE);

  return { subtotal, deliveryFee, tax, totalAmount: roundMoney(subtotal + deliveryFee + tax) };
};
