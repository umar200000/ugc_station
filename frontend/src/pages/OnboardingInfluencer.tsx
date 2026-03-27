import { useState } from 'react';
import { Megaphone, Plus, Trash2, X, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { hapticFeedback } from '../lib/telegram';

const SUGGESTED_CATEGORIES = [
  'Oziq-ovqat va restoranlar',
  "Go'zallik va kosmetologiya",
  'Fitness va sog\'lom turmush',
  'Texnologiya va gadjetlar',
  'Moda va kiyim-kechak',
  'Uy xizmatlari va ustalar',
  'Sayohat va joylar',
];

export default function OnboardingInfluencer() {
  const { onboardInfluencer, goBackToRoleSelect } = useAuthStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [linkInputs, setLinkInputs] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    const val = customInput.trim();
    if (val && !categories.includes(val)) {
      setCategories(prev => [...prev, val]);
      setCustomInput('');
    }
  };

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
    const finalCategory = categories.join(', ');
    if (!name.trim() || categories.length === 0) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      const filteredLinks: Record<string, string> = {};
      for (const url of linkInputs) {
        if (!url.trim()) continue;
        const lower = url.toLowerCase();
        let key = `link_${Object.keys(filteredLinks).length}`;
        if (lower.includes('instagram')) key = 'instagram';
        else if (lower.includes('youtube') || lower.includes('youtu.be')) key = 'youtube';
        else if (lower.includes('tiktok')) key = 'tiktok';
        else if (lower.includes('t.me') || lower.includes('telegram')) key = 'telegram';
        else if (lower.includes('facebook') || lower.includes('fb.com')) key = 'facebook';
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
        {/* Orqaga tugma */}
        <button
          onClick={goBackToRoleSelect}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', padding: 0, marginBottom: 24,
          }}
        >
          <ArrowLeft size={18} /> Orqaga
        </button>

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
              <label className="form-label">Yo'nalishlar <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({categories.length} tanlandi)</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {SUGGESTED_CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat);
                  return (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '8px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-strong)'}`,
                        background: selected ? 'var(--primary)' : 'var(--bg-card)',
                        color: selected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                      {selected && <Check size={14} />}
                      {cat}
                    </button>
                  );
                })}
              </div>
              {/* Tanlangan custom yo'nalishlar */}
              {categories.filter(c => !SUGGESTED_CATEGORIES.includes(c)).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {categories.filter(c => !SUGGESTED_CATEGORIES.includes(c)).map(cat => (
                    <span key={cat} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                      background: 'var(--primary)', color: '#fff',
                    }}>
                      {cat}
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => setCategories(prev => prev.filter(c => c !== cat))} />
                    </span>
                  ))}
                </div>
              )}
              {/* Custom qo'shish */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" style={{ flex: 1 }}
                  placeholder="Boshqa yo'nalish qo'shing..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                />
                <button type="button" onClick={addCustomCategory}
                  disabled={!customInput.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
                    background: customInput.trim() ? 'var(--primary)' : 'var(--border)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: customInput.trim() ? 'pointer' : 'not-allowed',
                  }}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
            <button className="btn btn-primary" disabled={!name.trim() || categories.length === 0} onClick={() => setStep(2)}>
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
                return (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        className="form-input"
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
