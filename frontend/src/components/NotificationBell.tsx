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
      position: 'relative', background: 'none', border: 'none',
      cursor: 'pointer', padding: 4,
    }}>
      <Bell size={22} style={{ color: 'var(--text-muted)' }} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: -2, right: -4,
          background: '#EF4444', color: '#fff',
          fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
          borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 4px', border: '2px solid var(--bg, #F8FAFC)',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
