import { useState } from 'react';
import { Building2, Megaphone } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { hapticFeedback } from '../lib/telegram';

export default function SelectRole() {
  const { selectRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = async (role: 'COMPANY' | 'INFLUENCER') => {
    setSelected(role);
    setLoading(true);
    hapticFeedback('medium');
    try {
      await selectRole(role);
    } catch (err) {
      console.error(err);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 20px', maxWidth: 420, margin: '0 auto' }}>
      <div className="slide-up" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 30px rgba(37,99,235,0.25)' }}>
          <Megaphone size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>UGC Marketplace</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Kompaniyalar va influenserlarni bog'lovchi platforma
        </p>
      </div>

      <div className="slide-up" style={{ animationDelay: '0.1s' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 16 }}>
          Siz kim sifatida davom etasiz?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            disabled={loading}
            onClick={() => handleSelect('COMPANY')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px', borderRadius: 'var(--radius)', border: `2px solid ${selected === 'COMPANY' ? 'var(--secondary)' : 'var(--border-strong)'}`,
              background: selected === 'COMPANY' ? 'var(--secondary-bg)' : 'var(--bg-card)',
              cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
              <Building2 size={24} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, display: 'block', color: 'var(--text)' }}>Kompaniya</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>Reklama e'loni joylang, influenserlarni toping</span>
            </div>
          </button>

          <button
            disabled={loading}
            onClick={() => handleSelect('INFLUENCER')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px', borderRadius: 'var(--radius)', border: `2px solid ${selected === 'INFLUENCER' ? 'var(--primary)' : 'var(--border-strong)'}`,
              background: selected === 'INFLUENCER' ? 'var(--primary-bg)' : 'var(--bg-card)',
              cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
              <Megaphone size={24} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, display: 'block', color: 'var(--text)' }}>Influenser</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>E'lonlarni ko'ring, hamkorlik qiling, daromad oling</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
