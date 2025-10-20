import { useState, useEffect } from "react";
import { Notification } from "@/components/NotificationCenter";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock inicial - será substituído por chamada real ao banco
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        title: "Máquina Aprovada",
        message: "Sua máquina 'Lab5 - JWT Bypass' foi aprovada!",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: "2",
        type: "achievement",
        title: "Conquista Desbloqueada",
        message: "Você alcançou o Nível 5!",
        timestamp: new Date(Date.now() - 7200000),
        read: false,
      },
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // Aqui virá a chamada ao banco para atualizar
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Aqui virá a chamada ao banco para atualizar
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Aqui virá a chamada ao banco para deletar
  };

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    // Aqui virá a chamada ao banco para adicionar
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
};
