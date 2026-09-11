import mongoose from 'mongoose';

export const ORDER_STATUSES = Object.freeze(['placed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled']);
export const CLOSED_STATUSES = Object.freeze(['delivered', 'cancelled']);
export const PAYMENT_METHODS = Object.freeze(['cash', 'upi']);

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    // Name and price are copied so past orders stay correct after the menu changes
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: [true, 'House or flat number is required'], trim: true, maxlength: 120 },
    line2: { type: String, required: [true, 'Street or area is required'], trim: true, maxlength: 160 },
    landmark: { type: String, trim: true, maxlength: 120, default: '' },
    city: { type: String, required: [true, 'City is required'], trim: true, maxlength: 60 },
    state: { type: String, required: [true, 'State is required'], trim: true, maxlength: 60 },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be 6 digits'],
    },
    location: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    address: { type: addressSchema, required: [true, 'Delivery address is required'] },
    instructions: { type: String, trim: true, maxlength: 200, default: '' },
    paymentMethod: {
      type: String,
      required: [true, 'Choose a payment method'],
      enum: { values: PAYMENT_METHODS, message: 'Choose a payment method' },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'placed',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
