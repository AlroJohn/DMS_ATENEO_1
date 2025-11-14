import { Request, Response } from 'express';
import { DocumentCheckoutService } from '../services/document-checkout.service';
import { AuthRequest } from '../middleware/auth-middleware';
import { asyncHandler } from '../middleware/error-handler';
import { sendSuccess, sendError } from '../utils/response';

export class DocumentCheckoutController {
  private checkoutService: DocumentCheckoutService;

  constructor() {
    this.checkoutService = new DocumentCheckoutService();
  }

  /**
   * POST /api/documents/:id/checkout
   */
  checkoutDocument = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const result = await this.checkoutService.checkoutDocument(id, authReq.user.id);

    if (!result.success) {
      return sendError(res, result.error || 'Failed to check out document', result.statusCode || 400);
    }

    return sendSuccess(res, result.data);
  });

  /**
   * POST /api/documents/:id/checkin
   */
  checkinDocument = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const result = await this.checkoutService.checkinDocument(id, authReq.user.id);

    if (!result.success) {
      return sendError(res, result.error || 'Failed to check in document', result.statusCode || 400);
    }

    return sendSuccess(res, result.data);
  });

  /**
   * POST /api/documents/:id/override-checkout
   */
  overrideCheckout = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const result = await this.checkoutService.overrideCheckout(id, authReq.user.id);

    if (!result.success) {
      return sendError(res, result.error || 'Failed to override checkout', result.statusCode || 400);
    }

    return sendSuccess(res, result.data);
  });
}
