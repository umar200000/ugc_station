import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { INDUSTRIES } from '../types';
import { hapticFeedback } from '../lib/telegram';

export default function OnboardingCompany() {
  const { onboardCompany } = useAuthStore();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !industry) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      await onboardCompany({ name: name.trim(), industry });
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
          <div style={{ flex: 1, height: 4, borderRadius: 100, background: industry ? 'var(--primary)' : 'var(--border)' }} />
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
          <label className="form-label">Soha (Industry)</label>
          <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">Sohangizni tanlang...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" disabled={!name.trim() || !industry || loading} onClick={handleSubmit} style={{ marginTop: 8 }}>
          {loading ? 'Saqlanmoqda...' : 'Davom etish'}
        </button>
      </div>
    </div>
  );
}
