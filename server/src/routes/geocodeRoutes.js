import { Router } from 'express';
import { reverseGeocode } from '../controllers/geocodeController.js';
import { protect } from '../middleware/auth.js';
import { geocodeLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/reverse', protect, geocodeLimiter, reverseGeocode);

export default router;
