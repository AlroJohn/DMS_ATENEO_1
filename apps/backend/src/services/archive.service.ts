import { prisma } from '../lib/prisma';
import { DocumentService } from './document.service';

export class ArchiveService {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  /**
   * Archive a document by setting its deleted_at timestamp
   */
  async archiveDocument(documentId: string, archivedBy: string) {
    try {
      // Check if the document exists and is not already archived
      const document = await prisma.document.findUnique({
        where: { 
          document_id: documentId,
          deleted_at: null // Only archive documents that are not already archived
        }
      });

      if (!document) {
        throw new Error('Document not found or already archived');
      }

      // Update the document to mark it as archived
      const archivedDoc = await prisma.document.update({
        where: { document_id: documentId },
        data: {
          deleted_at: new Date(),
          restored_at: null,
          status: 'deleted' // Using 'deleted' status to represent archived (matches existing schema)
        }
      });

      // Create a document action log to track the archive action
      await prisma.documentAction.create({
        data: {
          action_name: 'archived',
          description: `Document ${document.title} was archived`,
          action_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return archivedDoc;
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  /**
   * Restore an archived document by clearing its deleted_at timestamp
   */
  async restoreDocument(documentId: string, restoredByUserId: string) {
    try {
      // Check if the document exists and is archived
      const document = await prisma.document.findUnique({
        where: {
          document_id: documentId,
          deleted_at: { not: null } // Only restore documents that are archived
        }
      });

      if (!document) {
        throw new Error('Document not found or not archived');
      }

      // Get the user's account information to get the account_id
      // First, we need to find the user to get their account_id
      const user = await prisma.user.findUnique({
        where: { user_id: restoredByUserId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Update the document to mark it as restored
      const restoredDoc = await prisma.document.update({
        where: { document_id: documentId },
        data: {
          deleted_at: null,
          restored_at: new Date(),
          restored_by: user.account_id, // Use account_id instead of user_id
          status: 'dispatch' // Reset to initial status after restoration
        }
      });

      // Create a document action log to track the restore action
      await prisma.documentAction.create({
        data: {
          action_name: 'restored',
          description: `Document ${document.title} was restored from archive`,
          action_date: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return restoredDoc;
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  /**
   * Get all archived documents
   */
  async getArchivedDocuments() {
    try {
      const archivedDocs = await prisma.document.findMany({
        where: { 
          deleted_at: { not: null } // Only documents with a deleted_at timestamp are archived
        },
        include: {
          DocumentAdditionalDetails: true,
          files: {
            include: {
              DocumentMetadata: true
            }
          }
        },
        orderBy: [
          { deleted_at: 'desc' }, // Order by archived date, newest first
          { created_at: 'desc' }  // Then by creation date
        ]
      });

      return archivedDocs;
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  }

  /**
   * Get a specific archived document
   */
  async getArchivedDocument(documentId: string) {
    try {
      const document = await prisma.document.findFirst({
        where: { 
          document_id: documentId,
          deleted_at: { not: null } // Only archived documents
        },
        include: {
          DocumentAdditionalDetails: true,
          files: {
            include: {
              DocumentMetadata: true
            }
          }
        }
      });

      return document;
    } catch (error) {
      console.error('Error fetching archived document:', error);
      throw error;
    }
  }
}