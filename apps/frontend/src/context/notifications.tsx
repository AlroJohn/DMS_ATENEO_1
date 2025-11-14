"use client";

import * as React from "react";
import { useSocket } from "@/components/providers/providers";

export type AppNotification = {
  id: string;
  type: "document" | "invitation" | "system" | "workflow";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  workflowEvent?: string; // Specific workflow event type (e.g., "document_shared", "document_released", "document_completed")
};

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationsContext = React.createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotifications = () => {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  return ctx;
};

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    []
  );

  const createNotificationFromPayload = (
    payload: any,
    type: AppNotification["type"]
  ): AppNotification => {
    const title =
      payload?.title ||
      payload?.event ||
      (type === "document"
        ? "New Document"
        : type === "invitation"
        ? "Invitation"
        : "System");
    const message =
      payload?.message ||
      payload?.description ||
      payload?.text ||
      JSON.stringify(payload || {});
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      timestamp: "just now",
      read: false,
    };
  };

  React.useEffect(() => {
    if (!socket) return;

    const onIncomingDocument = (data: any) => {
      setNotifications((prev) => [
        createNotificationFromPayload(data, "document"),
        ...prev,
      ]);
    };

    const onInvitation = (data: any) => {
      setNotifications((prev) => [
        createNotificationFromPayload(data, "invitation"),
        ...prev,
      ]);
    };

    const onSystem = (data: any) => {
      setNotifications((prev) => [
        createNotificationFromPayload(data, "system"),
        ...prev,
      ]);
    };

    // New workflow event handlers
    const onDocumentShared = (data: any) => {
      const notification: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "workflow",
        workflowEvent: "document_shared",
        title: "Document Shared",
        message: `A document has been shared with you: ${data.documentTitle || data.documentId || 'Untitled'}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    };

    const onDocumentReleased = (data: any) => {
      const notification: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "workflow",
        workflowEvent: "document_released",
        title: "Document Released",
        message: `A document has been released to ${data.toDepartment || data.toUser || 'another department'}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    };

    const onDocumentCompleted = (data: any) => {
      const notification: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "workflow",
        workflowEvent: "document_completed",
        title: "Document Completed",
        message: `A document has been marked as completed: ${data.documentTitle || data.documentId || 'Untitled'}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    };

    const onDocumentUpdated = (data: any) => {
      const notification: AppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "workflow",
        workflowEvent: "document_updated",
        title: "Document Updated",
        message: `A document has been updated: ${data.documentTitle || data.documentId || 'Untitled'}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("incoming_document", onIncomingDocument);
    socket.on("document-changed", onIncomingDocument);
    socket.on("invitation_received", onInvitation);
    socket.on("notification", onSystem);
    socket.on("system_message", onSystem);
    
    // Workflow event listeners
    socket.on("documentShared", onDocumentShared);
    socket.on("documentReleased", onDocumentReleased);
    socket.on("documentCompleted", onDocumentCompleted);
    socket.on("documentUpdated", onDocumentUpdated);

    return () => {
      socket.off("incoming_document", onIncomingDocument);
      socket.off("document-changed", onIncomingDocument);
      socket.off("invitation_received", onInvitation);
      socket.off("notification", onSystem);
      socket.off("system_message", onSystem);
      
      // Remove workflow event listeners
      socket.off("documentShared", onDocumentShared);
      socket.off("documentReleased", onDocumentReleased);
      socket.off("documentCompleted", onDocumentCompleted);
      socket.off("documentUpdated", onDocumentUpdated);
    };
  }, [socket]);

  const addNotification = (n: AppNotification) =>
    setNotifications((prev) => [n, ...prev]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (socket) socket.emit("notification_read", { notificationId: id });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (socket) socket.emit("notification_read_all");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (socket) socket.emit("notification_deleted", { notificationId: id });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
