import { prisma } from '../lib/prisma';

export interface DocumentStats {
  owned: number;
  inTransit: number;
  shared: number;
  archive: number;
  recycleBin: number;
  total: number;
}

export class DashboardService {
  async getDocumentStats(userId: string): Promise<DocumentStats> {
    try {
      // Get the user's information including department
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { 
          department_id: true,
          account_id: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Count owned documents (documents created by this user, not deleted)
      const owned = await prisma.document.count({
        where: {
          files: {
            some: {
              uploaded_by: user.account_id
            }
          },
          status: {
            notIn: ['deleted']
          }
        }
      });

      // Count in-transit documents (documents with status 'intransit')
      const inTransit = await prisma.document.count({
        where: {
          status: 'intransit',
          NOT: {
            files: {
              some: {
                uploaded_by: user.account_id
              }
            }
          }
        }
      });

      // Count shared documents (documents in received_by_departments containing user ID)
      const allDocumentDetails = await prisma.documentAdditionalDetails.findMany({
        where: {
          Document: {
            status: {
              not: 'deleted'
            }
          }
        },
        select: {
          received_by_departments: true,
          Document: {
            select: {
              files: {
                select: {
                  uploaded_by: true
                }
              }
            }
          }
        }
      });

      // Filter for documents shared to this user
      const shared = allDocumentDetails.filter((detail: any) => {
        // Skip if document was uploaded by user
        const isOwner = detail.Document?.files?.some((file: any) => file.uploaded_by === user.account_id);
        if (isOwner) return false;

        // Check if user ID is in received_by_departments
        let receivedByUsers: string[] = [];
        if (Array.isArray(detail.received_by_departments)) {
          receivedByUsers = detail.received_by_departments as string[];
        } else if (typeof detail.received_by_departments === 'string' && detail.received_by_departments) {
          try {
            const parsed = JSON.parse(detail.received_by_departments);
            if (Array.isArray(parsed)) {
              receivedByUsers = parsed;
            } else if (typeof parsed === 'object') {
              receivedByUsers = Object.values(parsed).filter((v): v is string => typeof v === 'string');
            }
          } catch {
            receivedByUsers = [];
          }
        }
        
        return receivedByUsers.includes(userId);
      }).length;

      // Count archived documents (status 'completed' or documents marked with deleted_at but status not 'deleted')
      const archive = await prisma.document.count({
        where: {
          files: {
            some: {
              uploaded_by: user.account_id
            }
          },
          status: 'completed'
        }
      });

      // Count recycle bin documents (status 'deleted')
      const recycleBin = await prisma.document.count({
        where: {
          files: {
            some: {
              uploaded_by: user.account_id
            }
          },
          status: 'deleted'
        }
      });

      // Total documents user has access to (excluding deleted)
      const total = owned + inTransit + shared;

      return {
        owned,
        inTransit,
        shared,
        archive,
        recycleBin,
        total
      };
    } catch (error) {
      console.error('Error fetching document stats:', error);
      throw new Error('Failed to fetch document statistics');
    }
  }
}
