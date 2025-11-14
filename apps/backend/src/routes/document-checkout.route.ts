import express from 'express';
import { DocumentCheckoutController } from '../controllers/document-checkout.controller';
import { authMiddleware, requirePermission } from '../middleware/auth-middleware';

const router = express.Router();
const checkoutController = new DocumentCheckoutController();

// All routes in this file will be under /api/documents/:id
// and should have auth middleware applied.
router.use(authMiddleware);

// POST /api/documents/:id/checkout - Check out a document for editing
router.post('/:id/checkout',
  requirePermission('document_edit'),
  checkoutController.checkoutDocument
);

// POST /api/documents/:id/checkin - Check in a document to release the lock
router.post('/:id/checkin',
  requirePermission('document_edit'),
  checkoutController.checkinDocument
);

// POST /api/documents/:id/override-checkout - Forcefully override a document checkout
router.post('/:id/override-checkout',
  requirePermission('document_edit'), // Consider a more specific 'document_override_lock' permission
  checkoutController.overrideCheckout
);

export default router;
