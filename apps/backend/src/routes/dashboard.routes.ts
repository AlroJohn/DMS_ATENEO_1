import { Router } from 'express';
import { authMiddleware } from '../middleware/auth-middleware';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', authMiddleware, dashboardController.getDocumentStats.bind(dashboardController));

export default router;
