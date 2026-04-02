import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Repeat2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export default function SelectAdType() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tokens = user?.company?.tokens ?? 0;

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
          E'lon yaratish
        </h1>
        <p style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
          E'lon turini tanlang
        </p>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* Token balance */}
        <div style={{
          background: 'rgba(27,59,81,0.06)', borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          fontSize: 13, fontWeight: 600, color: '#1B3B51',
        }}>
          <Zap size={16} style={{ color: '#1B3B51' }} />
          Joriy balans: <b>{tokens}</b> token
        </div>

        {/* Depozit */}
        <div
          onClick={() => navigate('/create-ad', { state: { adType: 'DEPOSIT' } })}
          style={{
            background: '#fff', borderRadius: 16, padding: 20,
            border: '1px solid #E5E5EA', marginBottom: 12,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(27,59,81,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1B3B51', flexShrink: 0,
            }}>
              <Zap size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3B51' }}>Depozit orqali</div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 3, lineHeight: 1.5 }}>
                Influenserlar soni bo'yicha token sarflanadi
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#C7C7CC', flexShrink: 0 }} />
          </div>
          <div style={{
            marginTop: 14, background: 'rgba(27,59,81,0.04)', borderRadius: 10,
            padding: '10px 14px', fontSize: 12, color: '#8E8E93', fontWeight: 600,
          }}>
            1 ta influenserga = 1 ta token ketadi
          </div>
        </div>

        {/* Barter */}
        <div
          onClick={() => navigate('/create-ad', { state: { adType: 'BARTER' } })}
          style={{
            background: '#fff', borderRadius: 16, padding: 20,
            border: '1px solid #E5E5EA',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10B981', flexShrink: 0,
            }}>
              <Repeat2 size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3B51' }}>Barter orqali</div>
              <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 3, lineHeight: 1.5 }}>
                Mahsulot/xizmat almashish orqali hamkorlik
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#C7C7CC', flexShrink: 0 }} />
          </div>
          <div style={{
            marginTop: 14, background: 'rgba(16,185,129,0.06)', borderRadius: 10,
            padding: '10px 14px', fontSize: 12, color: '#8E8E93', fontWeight: 600,
          }}>
            Har 3 ta influenserga = 1 ta token ketadi
          </div>
        </div>
      </div>
    </div>
  );
}
