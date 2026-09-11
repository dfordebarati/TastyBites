import MenuItem from '../models/MenuItem.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

export const getStats = async (_req, res) => {
  const [menuItems, users, orders, revenueResult] = await Promise.all([
    MenuItem.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: { menuItems, users, orders, revenue: revenueResult[0]?.total ?? 0 },
  });
};
