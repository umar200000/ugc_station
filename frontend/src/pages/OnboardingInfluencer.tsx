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
  'Ta\'lim va kurslar',
  'Avtomobillar va transport',
  'Bolalar va onalik',
  'Tibbiyot va sog\'liq',
  'Ko\'chmas mulk',
  'Moliya va investitsiya',
  'Sport va ommaviy tadbirlar',
  'O\'yinlar va kibersport',
  'Musiqa va san\'at',
  'Kitoblar va adabiyot',
  'Uy-joy va dizayn',
  'Hayvonlar va tabiat',
  'Biznes va tadbirkorlik',
];

export default function OnboardingInfluencer() {
  const { onboardInfluencer, goBackToRoleSelect } = useAuthStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [socialLinks, setSocialLinks] = useState({ instagram: '', telegram: '', youtube: '', tiktok: '' });
  const [extraLinks, setExtraLinks] = useState<string[]>([]);
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

  const handleSubmit = async () => {
    const finalCategory = categories.join(', ');
    if (!name.trim() || categories.length === 0) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      const filteredLinks: Record<string, string> = {};
      if (socialLinks.instagram.trim()) filteredLinks.instagram = socialLinks.instagram.trim();
      if (socialLinks.telegram.trim()) filteredLinks.telegram = socialLinks.telegram.trim();
      if (socialLinks.youtube.trim()) filteredLinks.youtube = socialLinks.youtube.trim();
      if (socialLinks.tiktok.trim()) filteredLinks.tiktok = socialLinks.tiktok.trim();
      extraLinks.forEach((url, i) => {
        if (url.trim()) filteredLinks[`link_${i}`] = url.trim();
      });
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
              <div style={{ maxHeight: 200, overflowY: 'auto', padding: '2px 0', marginBottom: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10 }}>
                  {SUGGESTED_CATEGORIES.map((cat) => {
                    const selected = categories.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                        style={{
                          padding: '7px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 600,
                          border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border-strong)'}`,
                          background: selected ? 'var(--primary)' : 'var(--bg-card)',
                          color: selected ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                        {selected && <Check size={13} />}
                        {cat}
                      </button>
                    );
                  })}
                </div>
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
              {/* Instagram */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
                <input className="form-input" style={{ flex: 1 }} placeholder="instagram.com/username" value={socialLinks.instagram} onChange={(e) => setSocialLinks(p => ({ ...p, instagram: e.target.value }))} />
              </div>
              {/* Telegram */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#2AABEE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <input className="form-input" style={{ flex: 1 }} placeholder="t.me/username" value={socialLinks.telegram} onChange={(e) => setSocialLinks(p => ({ ...p, telegram: e.target.value }))} />
              </div>
              {/* YouTube */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </div>
                <input className="form-input" style={{ flex: 1 }} placeholder="youtube.com/@channel" value={socialLinks.youtube} onChange={(e) => setSocialLinks(p => ({ ...p, youtube: e.target.value }))} />
              </div>
              {/* TikTok */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#010101', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.82a8.21 8.21 0 0 0 4.76 1.52V6.89a4.85 4.85 0 0 1-1-.2z"/></svg>
                </div>
                <input className="form-input" style={{ flex: 1 }} placeholder="tiktok.com/@username" value={socialLinks.tiktok} onChange={(e) => setSocialLinks(p => ({ ...p, tiktok: e.target.value }))} />
              </div>
              {/* Extra links */}
              {extraLinks.map((link, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="form-input" style={{ flex: 1 }} placeholder="https://example.com" value={link} onChange={(e) => setExtraLinks(prev => { const u = [...prev]; u[index] = e.target.value; return u; })} />
                  <button onClick={() => setExtraLinks(prev => prev.filter((_, i) => i !== index))} style={{
                    width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)',
                    background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0,
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setExtraLinks(prev => [...prev, ''])}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '10px 0', marginTop: 12, borderRadius: 12,
                border: '1.5px dashed var(--border-strong)', background: 'transparent',
                color: 'var(--primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={18} /> Yana
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
