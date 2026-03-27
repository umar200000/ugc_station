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
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Orqaga
        </button>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            background: 'var(--primary-bg)', border: 'none', borderRadius: 10,
            padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, color: 'var(--primary)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <CheckCheck size={15} /> Barchasini o'qish
          </button>
        )}
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Bildirishnomalar</h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        {unreadCount > 0 ? `${unreadCount} ta yangi xabar` : 'Barcha xabarlar o\'qilgan'}
      </p>

      {notifications.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <Bell size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontWeight: 600, fontSize: 16 }}>Bildirishnomalar yo'q</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Yangi xabarlar bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => {
            const t = TYPE_ICONS[n.type] || TYPE_ICONS.info;
            return (
              <div key={n.id} onClick={() => handleClick(n)} style={{
                display: 'flex', gap: 12, padding: '14px 12px',
                borderRadius: 14, cursor: 'pointer',
                background: n.read ? 'var(--bg-card)' : 'rgba(37,99,235,0.05)',
                border: `1px solid ${n.read ? 'var(--border)' : 'rgba(37,99,235,0.12)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: n.read ? 'var(--bg)' : `${t.color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: n.read ? 'var(--text-muted)' : t.color,
                }}>
                  {t.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: 'var(--text)' }}>{n.title}</span>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>{n.message}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{timeAgo(n.createdAt)}</span>
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
