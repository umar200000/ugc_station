import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, FileVideo, Handshake, XCircle, CheckCircle2 } from 'lucide-react';
import { useNotifStore } from '../store/notifications';

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  application: { icon: <Handshake size={16} />, color: 'var(--p, #2563EB)' },
  accepted: { icon: <CheckCircle2 size={16} />, color: '#10B981' },
  rejected: { icon: <XCircle size={16} />, color: '#EF4444' },
  video: { icon: <FileVideo size={16} />, color: '#8B5CF6' },
  approved: { icon: <CheckCircle2 size={16} />, color: '#10B981' },
  info: { icon: <Bell size={16} />, color: '#2563EB' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daq`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} soat`;
  return `${Math.floor(hours / 24)} kun`;
}

export default function NotificationBell() {
  const { unreadCount, notifications, showPanel, fetchUnreadCount, togglePanel, closePanel, markAsRead, markAllRead } = useNotifStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (n: typeof notifications[0]) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) { closePanel(); navigate(n.link); }
  };

  return (
    <>
      {/* Bell button */}
      <button onClick={togglePanel} style={{
        position: 'relative', background: 'none', border: 'none',
        cursor: 'pointer', padding: 4,
      }}>
        <Bell size={22} style={{ color: showPanel ? 'var(--primary)' : 'var(--text-muted)' }} />
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

      {/* Panel overlay */}
      {showPanel && (
        <div onClick={closePanel} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: '100%', maxWidth: 380,
            background: 'var(--bg, #F8FAFC)',
            boxShadow: '-8px 0 30px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px', borderBottom: '1px solid var(--border, #e2e8f0)',
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Bildirishnomalar</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: 'var(--primary, #2563EB)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <CheckCheck size={14} /> Barchasini o'qish
                  </button>
                )}
                <button onClick={closePanel} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}>
                  <X size={20} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted, #94A3B8)' }}>
                  <Bell size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontSize: 14 }}>Bildirishnomalar yo'q</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const t = TYPE_ICONS[n.type] || TYPE_ICONS.info;
                  return (
                    <div key={n.id} onClick={() => handleClick(n)} style={{
                      display: 'flex', gap: 12, padding: '12px 10px',
                      borderRadius: 12, cursor: 'pointer', marginBottom: 4,
                      background: n.read ? 'transparent' : 'rgba(37,99,235,0.04)',
                      transition: 'background 0.2s',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: n.read ? 'var(--border, #e2e8f0)' : `${t.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: n.read ? 'var(--text-muted)' : t.color,
                      }}>
                        {t.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: n.read ? 500 : 700,
                          color: 'var(--text, #0F172A)',
                        }}>{n.title}</div>
                        <div style={{
                          fontSize: 12, color: 'var(--text-muted, #94A3B8)',
                          marginTop: 2, lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                        }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--primary, #2563EB)', flexShrink: 0, marginTop: 6,
                        }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
