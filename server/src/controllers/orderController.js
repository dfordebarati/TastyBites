import crypto from 'node:crypto';
import Order, { ORDER_STATUSES, CLOSED_STATUSES } from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { ROLES } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { calculateTotals, MAX_QUANTITY } from '../utils/pricing.js';

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  return `TB-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const normalizePhone = (value) =>
  String(value ?? '')
    .replace(/\D/g, '')
    .replace(/^(91|0)(?=\d{10}$)/, '');

// Prices always come from the database, never from the browser
const buildOrderItems = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  const quantities = new Map();
  for (const entry of cartItems) {
    const quantity = Number(entry?.quantity);
    if (typeof entry?.menuItem !== 'string' || !Number.isInteger(quantity) || quantity < 1) {
      throw ApiError.badRequest('Every cart item needs a dish and a whole-number quantity');
    }
    quantities.set(entry.menuItem, (quantities.get(entry.menuItem) ?? 0) + quantity);
  }

  const dishes = await MenuItem.find({ _id: { $in: [...quantities.keys()] } });
  const byId = new Map(dishes.map((dish) => [dish._id.toString(), dish]));

  const unavailable = [...quantities.keys()].filter((id) => !byId.get(id)?.availability);
  if (unavailable.length) {
    const names = unavailable.map((id) => byId.get(id)?.name).filter(Boolean);
    throw ApiError.conflict(
      names.length
        ? `Sorry, ${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} not available right now. Please update your cart.`
        : 'Some dishes in your cart are no longer on the menu. Please update your cart.'
    );
  }

  return [...quantities].map(([id, quantity]) => {
    if (quantity > MAX_QUANTITY) {
      throw ApiError.badRequest(`You can order up to ${MAX_QUANTITY} of each dish`);
    }
    const dish = byId.get(id);
    return { menuItem: dish._id, name: dish.name, price: dish.price, quantity };
  });
};

const findVisibleOrder = async (req) => {
  const order = await Order.findById(req.params.id);
  const canSee = order && (req.user.role === ROLES.ADMIN || order.user.equals(req.user._id));
  if (!canSee) throw ApiError.notFound('Order not found');
  return order;
};

export const createOrder = async (req, res) => {
  const { items, customerName, phone, address, instructions, paymentMethod } = req.body ?? {};
  const orderItems = await buildOrderItems(items);

  const cleanAddress =
    address && typeof address === 'object'
      ? { ...address, pincode: String(address.pincode ?? '').replace(/\s/g, '') }
      : address;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    customerName,
    phone: normalizePhone(phone),
    address: cleanAddress,
    instructions,
    paymentMethod,
    items: orderItems,
    ...calculateTotals(orderItems),
  });

  res.status(201).json({ success: true, order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
};

export const getOrder = async (req, res) => {
  const order = await findVisibleOrder(req);
  res.json({ success: true, order });
};

export const cancelOrder = async (req, res) => {
  const order = await findVisibleOrder(req);

  if (order.status !== 'placed') {
    throw ApiError.badRequest('The kitchen has already started on this order, so it can no longer be cancelled');
  }

  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, order });
};

export const listOrders = async (req, res) => {
  const { status } = req.query;
  const filter = typeof status === 'string' && ORDER_STATUSES.includes(status) ? { status } : {};

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body ?? {};
  if (!ORDER_STATUSES.includes(status)) {
    throw ApiError.badRequest(`Status must be one of: ${ORDER_STATUSES.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  if (CLOSED_STATUSES.includes(order.status)) {
    throw ApiError.badRequest(`This order is already ${order.status} and can't be changed`);
  }

  order.status = status;
  await order.save();
  res.json({ success: true, order });
};
