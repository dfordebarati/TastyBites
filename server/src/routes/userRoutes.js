import { Router } from 'express';
import { listUsers, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));
router.get('/', listUsers);
router.delete('/:id', deleteUser);

export default router;
