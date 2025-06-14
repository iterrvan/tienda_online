import { createContext, useContext, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, XCircle, Info } from "lucide-react";
import { NotificationProps } from "@/lib/types";

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationProps['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = useCallback((message: string, type: NotificationProps['type'] = 'success') => {
    const id = Date.now().toString();
    const notification: NotificationProps = {
      id,
      message,
      type,
      duration: type === 'error' ? 7000 : 5000
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

interface NotificationContainerProps {
  notifications: NotificationProps[];
  onRemove: (id: string) => void;
}

function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

interface NotificationToastProps {
  notification: NotificationProps;
  onRemove: (id: string) => void;
}

function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return "toast-success border-green-200";
      case 'error':
        return "toast-error border-red-200";
      case 'info':
        return "toast-info border-blue-200";
      default:
        return "toast-info border-blue-200";
    }
  };

  return (
    <div
      className={`${getStyles()} px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in-right`}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">
        {notification.message}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(notification.id)}
        className="text-white hover:bg-white/20 p-1 h-auto"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
