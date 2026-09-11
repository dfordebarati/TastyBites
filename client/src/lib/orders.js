export const ORDER_STEPS = ['placed', 'preparing', 'out-for-delivery', 'delivered'];
export const ORDER_STATUSES = [...ORDER_STEPS, 'cancelled'];

export const STATUS_LABELS = {
  placed: 'Order placed',
  preparing: 'Being prepared',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_HEADLINES = {
  placed: "We've got your order",
  preparing: 'Your food is being prepared',
  'out-for-delivery': 'Your order is on its way',
  delivered: 'Delivered. Enjoy your meal!',
  cancelled: 'This order was cancelled',
};

export const STATUS_DESCRIPTIONS = {
  placed: 'The kitchen has your order and will start on it shortly.',
  preparing: 'Our chefs are cooking your food right now.',
  'out-for-delivery': 'A rider has picked up your order and is heading your way.',
  delivered: 'Your order has been delivered. We hope you enjoyed it.',
  cancelled: 'This order was cancelled and will not be delivered.',
};

export const PAYMENT_LABELS = {
  cash: 'Cash on delivery',
  upi: 'UPI on delivery',
};

export const PAYMENT_HINTS = {
  cash: 'Pay the rider in cash when your food arrives.',
  upi: "Scan the rider's QR code with any UPI app.",
};

export const isClosed = (status) => status === 'delivered' || status === 'cancelled';

export const itemSummary = (items) => items.map((item) => `${item.quantity} × ${item.name}`).join(', ');
