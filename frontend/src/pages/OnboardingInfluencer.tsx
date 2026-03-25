import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { INFLUENCER_CATEGORIES, PLATFORMS } from '../types';
import { hapticFeedback } from '../lib/telegram';

export default function OnboardingInfluencer() {
  const { onboardInfluencer } = useAuthStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !category) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      const filteredLinks: Record<string, string> = {};
      for (const [key, val] of Object.entries(socialLinks)) {
        if (val.trim()) filteredLinks[key] = val.trim();
      }
      await onboardInfluencer({ name: name.trim(), bio, category, socialLinks: filteredLinks });
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
          <div style={{ flex: 1, height: 4, borderRadius: 100, background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />
        </div>

        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
          <Megaphone size={24} color="#fff" />
        </div>

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Profilingiz</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
              Kompaniyalar sizni shu ma'lumotlar orqali ko'radi
            </p>
            <div className="form-group">
              <label className="form-label">Ismingiz</label>
              <input className="form-input" placeholder="To'liq ismingiz" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" placeholder="O'zingiz haqingizda qisqacha..." value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Yo'nalish</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tanlang...</option>
                {INFLUENCER_CATEGORIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" disabled={!name.trim() || !category} onClick={() => setStep(2)}>
              Davom etish
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>Ijtimoiy tarmoqlar</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
              Profilingiz va kanalingizga havolalar qo'shing
            </p>
            {PLATFORMS.map((platform) => (
              <div className="form-group" key={platform}>
                <label className="form-label">{platform}</label>
                <input className="form-input" placeholder={`${platform} havolangiz`} value={socialLinks[platform] || ''} onChange={(e) => handleLinkChange(platform, e.target.value)} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Orqaga</button>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading} onClick={handleSubmit}>
                {loading ? 'Saqlanmoqda...' : 'Boshlash'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
