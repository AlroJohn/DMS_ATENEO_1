import { prisma } from '../lib/prisma';
import { getSocketInstance } from '../socket';

export class DocumentCheckoutService {

  /**
   * Checks out a document for the given user.
   */
  async checkoutDocument(documentId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { account_id: true }
    });

    if (!user || !user.account_id) {
      return { success: false, error: 'User not found.', statusCode: 404 };
    }

    const document = await prisma.document.findUnique({
      where: { document_id: documentId },
    });

    if (!document) {
      return { success: false, error: 'Document not found.', statusCode: 404 };
    }

    if (document.checked_out_by) {
      if (document.checked_out_by === user.account_id) {
        return { success: false, error: 'You have already checked out this document.', statusCode: 409 };
      }
      const checkedOutByUser = await prisma.account.findUnique({ where: { account_id: document.checked_out_by }, include: { user: true } });
      const userName = checkedOutByUser?.user ? `${checkedOutByUser.user.first_name} ${checkedOutByUser.user.last_name}` : 'another user';
      return { success: false, error: `Document is already checked out by ${userName}.`, statusCode: 409 };
    }

    const updatedDocument = await prisma.document.update({
      where: { document_id: documentId },
      data: {
        status: 'checked_out',
        checked_out_at: new Date(),
        checked_out_by: user.account_id,
      },
    });

    const io = getSocketInstance();
    io.emit('documentUpdated', { documentId, status: 'checked_out', checked_out_by: user.account_id });
    io.emit('checkout', { documentId, checkedOutBy: user.account_id });

    return { success: true, data: updatedDocument };
  }

  /**
   * Checks in a document, releasing the lock.
   */
  async checkinDocument(documentId: string, userId: string) {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { account_id: true }
    });

    if (!user || !user.account_id) {
        return { success: false, error: 'User not found.', statusCode: 404 };
    }

    const document = await prisma.document.findUnique({
      where: { document_id: documentId },
    });

    if (!document) {
      return { success: false, error: 'Document not found.', statusCode: 404 };
    }

    if (!document.checked_out_by) {
      return { success: false, error: 'Document is not checked out.', statusCode: 400 };
    }

    if (document.checked_out_by !== user.account_id) {
      return { success: false, error: 'You cannot check in a document checked out by another user.', statusCode: 403 };
    }

    const updatedDocument = await prisma.document.update({
      where: { document_id: documentId },
      data: {
        status: 'dispatch', // Or whatever the default status should be
        checked_out_at: null,
        checked_out_by: null,
      },
    });

    const io = getSocketInstance();
    io.emit('documentUpdated', { documentId, status: 'dispatch', checked_out_by: null });
    io.emit('checkin', { documentId });

    return { success: true, data: updatedDocument };
  }

  /**
   * Allows a user with appropriate permissions to override a checkout.
   */
  async overrideCheckout(documentId: string, userId: string) {
    // Here you might want to add an additional permission check for overriding locks
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { account_id: true }
    });

    if (!user || !user.account_id) {
        return { success: false, error: 'User not found.', statusCode: 404 };
    }

    const document = await prisma.document.findUnique({
      where: { document_id: documentId },
    });

    if (!document) {
      return { success: false, error: 'Document not found.', statusCode: 404 };
    }

    if (!document.checked_out_by) {
      return { success: false, error: 'Document is not checked out.', statusCode: 400 };
    }

    const originalCheckoutUser = document.checked_out_by;

    const updatedDocument = await prisma.document.update({
      where: { document_id: documentId },
      data: {
        status: 'dispatch', // Or whatever the default status should be
        checked_out_at: null,
        checked_out_by: null,
      },
    });

    const io = getSocketInstance();
    io.emit('documentUpdated', { documentId, status: 'dispatch', checked_out_by: null });
    
    // Notify the original user that their lock was overridden
    if (originalCheckoutUser) {
        io.to(`account-${originalCheckoutUser}`).emit('checkoutOverridden', { documentId, overriddenBy: userId });
    }

    return { success: true, data: updatedDocument };
  }
}
