import React from 'react';
import { Bell, CheckCircle2, MessageSquare, Paperclip, RefreshCw, AlertCircle } from 'lucide-react';

export default function ToastManager({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'PROJECT_CREATED':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={18} color="#38bdf8" />;
      case 'ATTACHMENT_ADDED':
        return <Paperclip size={18} color="#fbbf24" />;
      case 'TASK_STATUS_CHANGED':
        return <RefreshCw size={18} color="#818cf8" />;
      default:
        return <Bell size={18} color="#c084fc" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" onClick={() => onDismiss(toast.id)}>
          <div className="toast-icon">
            {getIcon(toast.type)}
          </div>
          <div style={{ flex: 1 }}>
            <div className="toast-title">{toast.title || 'Live Update'}</div>
            <div className="toast-msg">{toast.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
