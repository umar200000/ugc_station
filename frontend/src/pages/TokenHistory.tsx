import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Plus, Minus, Gift, FileText } from 'lucide-react';
import api from '../lib/api';

interface HistoryItem {
  id: string;
  type: string;
  tokens: number;
  note: string;
  createdAt: string;
}

function fmtPrice(n: number) {
  return Math.abs(n).toLocaleString('uz-UZ').replace(/,/g, ' ');
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days} kun oldin`;
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  TARIFF: { label: 'Tarif', icon: Zap, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  BONUS: { label: 'Bonus', icon: Gift, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  AD_CREATE: { label: 'E\'lon yaratish', icon: FileText, color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
  APPLICATION: { label: 'Ariza', icon: FileText, color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
  REVOKE: { label: 'Yechib olindi', icon: Minus, color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
};

export default function TokenHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-token-history')
      .then(res => setHistory(res.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7' }}>
      <div style={{
        background: '#fff', padding: '16px 16px 20px',
        borderBottom: '1px solid #E5E5EA',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1B3B51', fontSize: 15, fontWeight: 600,
            fontFamily: 'inherit', padding: 0, marginBottom: 16,
          }}
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B3B51', letterSpacing: -0.3 }}>
          Token tarixi
        </h1>
      </div>

      <div style={{ padding: '16px 16px 40px', maxWidth: 480, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E5EA', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="shimmer" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="shimmer" style={{ width: '50%', height: 14, borderRadius: 6, marginBottom: 6 }} />
                  <div className="shimmer" style={{ width: '70%', height: 11, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 40,
            textAlign: 'center', border: '1px solid #E5E5EA',
          }}>
            <Zap size={32} style={{ color: '#C7C7CC', marginBottom: 12 }} />
            <p style={{ color: '#8E8E93', fontSize: 14 }}>Hali tarix yo'q</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map(h => {
              const isPlus = h.tokens > 0;
              const cfg = TYPE_CONFIG[h.type] || TYPE_CONFIG.BONUS;
              const Icon = cfg.icon;
              return (
                <div key={h.id} style={{
                  background: '#fff', borderRadius: 14, padding: '12px 14px',
                  border: '1px solid #E5E5EA',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: cfg.bg, color: cfg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1B3B51' }}>{cfg.label}</div>
                    <div style={{
                      fontSize: 12, color: '#8E8E93', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {h.note || '—'} · {timeAgo(h.createdAt)}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 800, flexShrink: 0,
                    color: isPlus ? '#10B981' : '#FF3B30',
                  }}>
                    {isPlus ? '+' : ''}{h.tokens}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
