import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, Handshake, CheckCircle2, XCircle, FileVideo } from 'lucide-react';
import { useNotifStore } from '../store/notifications';
import BottomNav from '../components/BottomNav';

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  application: { icon: <Handshake size={18} />, color: '#2563EB' },
  accepted: { icon: <CheckCircle2 size={18} />, color: '#10B981' },
  rejected: { icon: <XCircle size={18} />, color: '#EF4444' },
  video: { icon: <FileVideo size={18} />, color: '#8B5CF6' },
  approved: { icon: <CheckCircle2 size={18} />, color: '#10B981' },
  info: { icon: <Bell size={18} />, color: '#2563EB' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} soat oldin`;
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead } = useNotifStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = (n: typeof notifications[0]) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F2F2F7',
      padding: '16px 16px 100px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 15, fontWeight: 500, color: '#1B3B51',
          fontFamily: 'inherit', padding: 0,
        }}>
          <ArrowLeft size={18} /> Orqaga
        </button>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            background: '#EDF1F4', border: 'none', borderRadius: 14,
            padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, color: '#1B3B51',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <CheckCheck size={15} /> Barchasini o'qish
          </button>
        )}
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: '#1B3B51' }}>Bildirishnomalar</h1>
      <p style={{ fontSize: 14, color: '#8E8E93', marginBottom: 20 }}>
        {unreadCount > 0 ? `${unreadCount} ta yangi xabar` : 'Barcha xabarlar o\'qilgan'}
      </p>

      {notifications.length === 0 ? (
        <div style={{
          marginTop: 40, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <Bell size={40} style={{ color: '#8E8E93', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontWeight: 600, fontSize: 16, color: '#1B3B51', margin: 0 }}>Bildirishnomalar yo'q</p>
          <p style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>Yangi xabarlar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          border: '1px solid #E5E5EA',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {notifications.map((n, idx) => {
            const t = TYPE_ICONS[n.type] || TYPE_ICONS.info;
            return (
              <div key={n.id} onClick={() => handleClick(n)} style={{
                display: 'flex', gap: 12, padding: '14px 16px',
                cursor: 'pointer',
                background: n.read ? '#fff' : 'rgba(27,59,81,0.04)',
                borderBottom: idx < notifications.length - 1 ? '1px solid #E5E5EA' : 'none',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: n.read ? '#F2F2F7' : `${t.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.read ? '#8E8E93' : t.color,
                }}>
                  {t.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: '#1B3B51' }}>{n.title}</span>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B3B51', flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: '#636366', marginTop: 3, lineHeight: 1.4, margin: '3px 0 0 0' }}>{n.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: '#8E8E93' }}>{timeAgo(n.createdAt)}</span>
                    {n.link && <span style={{ fontSize: 12, fontWeight: 600, color: '#1B3B51' }}>Ko'rish →</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
