import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { hapticFeedback } from '../lib/telegram';

const TOP_INDUSTRIES = [
  'Oziq-ovqat va restoran',
  'Kiyim va moda',
  "Go'zallik va kosmetika",
  'Elektronika va telefonlar',
  "Ta'lim / O'quv markazlar",
  'Boshqa',
];

export default function OnboardingCompany() {
  const { onboardCompany } = useAuthStore();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const finalIndustry = industry === 'Boshqa' ? customIndustry.trim() : industry;

  const handleSubmit = async () => {
    if (!name.trim() || !finalIndustry) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      await onboardCompany({ name: name.trim(), industry: finalIndustry });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 20px', maxWidth: 420, margin: '0 auto' }}>
      <div className="slide-up">
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 100, background: 'var(--primary)' }} />
          <div style={{ flex: 1, height: 4, borderRadius: 100, background: name.trim() ? 'var(--primary)' : 'var(--border)' }} />
          <div style={{ flex: 1, height: 4, borderRadius: 100, background: finalIndustry ? 'var(--primary)' : 'var(--border)' }} />
        </div>

        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
          <Building2 size={24} color="#fff" />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Kompaniya profili</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
          Ma'lumotlaringizni kiriting — influenserlar sizni shu ma'lumotlar orqali ko'radi
        </p>

        <div className="form-group">
          <label className="form-label">Kompaniya nomi</label>
          <input className="form-input" placeholder="Masalan: TechUz LLC" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Soha</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TOP_INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => { setIndustry(ind); if (ind !== 'Boshqa') setCustomIndustry(''); }}
                style={{
                  padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${industry === ind ? 'var(--primary)' : 'var(--border)'}`,
                  background: industry === ind ? 'var(--primary-bg)' : 'var(--bg-card)',
                  color: industry === ind ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>
        {industry === 'Boshqa' && (
          <div className="form-group">
            <label className="form-label">Soha nomini kiriting</label>
            <input className="form-input" placeholder="Masalan: Avtomobil, Sport..." value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} />
          </div>
        )}

        <button className="btn btn-primary" disabled={!name.trim() || !finalIndustry || loading} onClick={handleSubmit} style={{ marginTop: 8 }}>
          {loading ? 'Saqlanmoqda...' : 'Davom etish'}
        </button>
      </div>
    </div>
  );
}
