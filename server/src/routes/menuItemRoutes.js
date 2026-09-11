import { Router } from 'express';
import {
  listMenuItems,
  getMenuItem,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuItemController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { ROLES } from '../models/User.js';

const router = Router();

router.get('/', listMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItem);

router.post('/', protect, authorize(ROLES.ADMIN), uploadImage, createMenuItem);
router.put('/:id', protect, authorize(ROLES.ADMIN), uploadImage, updateMenuItem);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteMenuItem);

export default router;
