import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  listOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', authorize(ROLES.ADMIN), listOrders);
router.get('/mine', getMyOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorize(ROLES.ADMIN), updateOrderStatus);

export default router;
