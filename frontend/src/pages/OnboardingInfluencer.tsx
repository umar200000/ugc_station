import { useState } from 'react';
import { Megaphone, Plus, Trash2, Link, Globe } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { INDUSTRIES } from '../types';
import { hapticFeedback } from '../lib/telegram';

const SOCIAL_ICONS: Record<string, { icon: string; color: string }> = {
  instagram: { icon: '📷', color: '#E4405F' },
  youtube: { icon: '▶️', color: '#FF0000' },
  tiktok: { icon: '🎵', color: '#000000' },
  telegram: { icon: '✈️', color: '#26A5E4' },
  facebook: { icon: '📘', color: '#1877F2' },
  twitter: { icon: '𝕏', color: '#1DA1F2' },
};

function detectPlatform(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagram')) return 'instagram';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('tiktok.com') || lower.includes('tiktok')) return 'tiktok';
  if (lower.includes('t.me') || lower.includes('telegram')) return 'telegram';
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  return null;
}

export default function OnboardingInfluencer() {
  const { onboardInfluencer } = useAuthStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [linkInputs, setLinkInputs] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleLinkChange = (index: number, value: string) => {
    setLinkInputs(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addLinkInput = () => {
    setLinkInputs(prev => [...prev, '']);
  };

  const removeLinkInput = (index: number) => {
    setLinkInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const finalCategory = category === 'Boshqa' ? customCategory.trim() : category;
    if (!name.trim() || !finalCategory) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      const filteredLinks: Record<string, string> = {};
      for (const url of linkInputs) {
        if (!url.trim()) continue;
        const platform = detectPlatform(url);
        const key = platform || `link_${Object.keys(filteredLinks).length}`;
        filteredLinks[key] = url.trim();
      }
      await onboardInfluencer({ name: name.trim(), bio, category: finalCategory, socialLinks: filteredLinks });
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
              <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); if (e.target.value !== 'Boshqa') setCustomCategory(''); }}>
                <option value="">Tanlang...</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            {category === 'Boshqa' && (
              <div className="form-group">
                <label className="form-label">Yo'nalishingizni kiriting</label>
                <input className="form-input" placeholder="Masalan: Sayohat, Texnologiya..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
              </div>
            )}
            <button className="btn btn-primary" disabled={!name.trim() || !category || (category === 'Boshqa' && !customCategory.trim())} onClick={() => setStep(2)}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {linkInputs.map((link, index) => {
                const platform = detectPlatform(link);
                const social = platform ? SOCIAL_ICONS[platform] : null;
                return (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      {social && (
                        <div style={{
                          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 24, height: 24, borderRadius: 6,
                          background: social.color + '15',
                          fontSize: 14, zIndex: 1,
                        }}>
                          <span>{social.icon}</span>
                        </div>
                      )}
                      <input
                        className="form-input"
                        style={{ paddingLeft: social ? 44 : 14 }}
                        placeholder="https://instagram.com/username"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                      />
                    </div>
                    {linkInputs.length > 1 && (
                      <button
                        onClick={() => removeLinkInput(index)}
                        style={{
                          width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)',
                          background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)',
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={addLinkInput}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '10px 0', marginTop: 12, borderRadius: 12,
                border: '1.5px dashed var(--border-strong)', background: 'transparent',
                color: 'var(--primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={18} /> Havola qo'shish
            </button>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
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
