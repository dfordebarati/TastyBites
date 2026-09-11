import { Router } from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';

const router = Router();

router.get('/stats', protect, authorize(ROLES.ADMIN), getStats);

export default router;
