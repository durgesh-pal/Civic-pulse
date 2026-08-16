import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, NotificationItem } from '../types';
import { DEMO_USERS } from '../lib/constants';

interface AuthContextType {
  user: User | null;
  role: Role;
  loginAsRole: (role: Role) => void;
  loginWithEmail: (email: string, password?: string) => boolean;
  logout: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => void;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize with Citizen by default
  useEffect(() => {
    loginAsRole('CITIZEN');
  }, []);

  const loginAsRole = async (targetRole: Role) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        showToast(`Switched persona to ${data.user.name} (${data.user.role})`, 'info');
        fetchNotifications(data.user.id);
      }
    } catch (err) {
      // Fallback
      const demo = DEMO_USERS.find((u) => u.role === targetRole);
      if (demo) {
        const fallbackUser: User = {
          id: `user-${targetRole.toLowerCase()}-1`,
          name: demo.name,
          email: demo.email,
          role: targetRole,
          phone: demo.phone,
          avatar: demo.avatar,
          civicScore: demo.civicScore || 100,
          badge: demo.badge || 'Civic Member',
          departmentName: demo.departmentName,
          assignedArea: demo.location || demo.assignedArea,
          reportsSubmitted: 5,
          reportsResolved: 4,
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
      }
    }
  };

  const loginWithEmail = (email: string) => {
    const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      loginAsRole(found.role as Role);
      return true;
    }
    // Default create custom user
    setUser({
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'CITIZEN',
      civicScore: 50,
      badge: 'New Citizen',
      reportsSubmitted: 0,
      reportsResolved: 0,
      createdAt: new Date().toISOString(),
    });
    showToast(`Logged in as ${email}`, 'success');
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const fetchNotifications = async (userId?: string) => {
    try {
      const res = await fetch(`/api/notifications${userId ? `?userId=${userId}` : ''}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications');
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (e) {}
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4000);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'CITIZEN',
        loginAsRole,
        loginWithEmail,
        logout,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshNotifications: () => fetchNotifications(user?.id),
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
