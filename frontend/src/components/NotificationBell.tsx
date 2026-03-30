import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifStore } from '../store/notifications';

export default function NotificationBell() {
  const { unreadCount, fetchUnreadCount } = useNotifStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <button onClick={() => navigate('/notifications')} style={{
      position: 'relative', border: 'none', cursor: 'pointer',
      width: 40, height: 40, borderRadius: 12,
      background: unreadCount > 0 ? 'rgba(239,68,68,0.1)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.3s ease',
    }}>
      <Bell
        size={22}
        fill={unreadCount > 0 ? '#EF4444' : 'none'}
        style={{
          color: unreadCount > 0 ? '#EF4444' : 'var(--text-muted)',
          transition: 'all 0.3s ease',
          animation: unreadCount > 0 ? 'bellShake 2s ease-in-out infinite' : 'none',
        }}
      />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 0,
          background: '#EF4444', color: '#fff',
          fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
          borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 4px', border: '2px solid var(--bg, #F8FAFC)',
          boxShadow: '0 0 8px rgba(239,68,68,0.5)',
          animation: 'bellPulse 2s ease-in-out infinite',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
