import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, Megaphone, LogOut, Pencil, Star, MapPin, Calendar, Briefcase, ChevronRight, Shield, Globe, X, Save, Camera, Send, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z" />
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
import BottomNav from '../components/BottomNav';
import api from '../lib/api';
import { hapticFeedback } from '../lib/telegram';
import { INDUSTRIES } from '../types';

export default function Profile() {
  const { user, refreshUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ ads: 0, applications: 0, accepted: 0, reviews: 0, avgRating: 0 });
  const [form, setForm] = useState<any>({});

  const profile = user?.role === 'COMPANY' ? user?.company : user?.influencer;
  const isCompany = user?.role === 'COMPANY';

  const location = useLocation();
  const isActive = location.pathname === '/profile';

  useEffect(() => {
    if (!isActive) return;
    const fetchStats = async () => {
      try {
        if (isCompany) {
          const res = await api.get('/ads/my/list');
          const ads = res.data || [];
          const totalApps = ads.reduce((sum: number, ad: any) => sum + (ad._count?.applications || 0), 0);
          setStats(prev => ({ ...prev, ads: ads.length, applications: totalApps }));
        } else {
          const res = await api.get('/applications/my');
          const apps = res.data || [];
          const accepted = apps.filter((a: any) => a.status === 'ACCEPTED').length;
          setStats(prev => ({ ...prev, applications: apps.length, accepted }));
        }
      } catch {}
    };
    fetchStats();
  }, [isActive]);

  let socialLinks: Record<string, string> = {};
  if (user?.influencer?.socialLinks) {
    try {
      socialLinks = typeof user.influencer.socialLinks === 'string' ? JSON.parse(user.influencer.socialLinks) : user.influencer.socialLinks;
    } catch { socialLinks = {}; }
  }

  const fileRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const startEdit = () => {
    if (isCompany && user?.company) {
      setForm({
        name: user.company.name,
        industry: user.company.industry,
        description: user.company.description || '',
        logo: user.company.logo || '',
      });
      setLogoPreview(user.company.logo || null);
    } else if (user?.influencer) {
      const links = typeof user.influencer.socialLinks === 'string'
        ? JSON.parse(user.influencer.socialLinks || '{}')
        : (user.influencer.socialLinks || {});
      const linkList = Object.values(links).filter((v: any) => v.trim()) as string[];
      setForm({
        name: user.influencer.name,
        bio: user.influencer.bio || '',
        category: user.influencer.category || '',
        socialLinks: linkList.length > 0 ? linkList : [''],
      });
    }
    setEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    // Upload image
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url || res.data.path;
      setForm((prev: any) => ({ ...prev, logo: url }));
      setLogoPreview(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    hapticFeedback('medium');
    try {
      const data: any = { ...form };
      // Influencer: socialLinks ni object ga convert
      if (!isCompany && data.socialLinks) {
        const linksObj: Record<string, string> = {};
        (data.socialLinks as string[]).forEach((url: string, i: number) => {
          if (url.trim()) {
            const lower = url.toLowerCase();
            let key = `link_${i}`;
            if (lower.includes('instagram')) key = 'instagram';
            else if (lower.includes('youtube') || lower.includes('youtu.be')) key = 'youtube';
            else if (lower.includes('tiktok')) key = 'tiktok';
            else if (lower.includes('t.me') || lower.includes('telegram')) key = 'telegram';
            else if (lower.includes('facebook') || lower.includes('fb.com')) key = 'facebook';
            linksObj[key] = url.trim();
          }
        });
        data.socialLinks = linksObj;
      }
      await api.put('/users/profile', data);
      await refreshUser();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <InstagramIcon />;
    if (p.includes('youtube')) return <YouTubeIcon />;
    if (p.includes('telegram')) return <Send size={18} />;
    if (p.includes('tiktok')) return <TikTokIcon />;
    if (p.includes('facebook')) return <FacebookIcon />;
    return <Globe size={18} />;
  };

  const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return 'linear-gradient(135deg, #E1306C, #F77737)';
    if (p.includes('youtube')) return 'linear-gradient(135deg, #FF0000, #CC0000)';
    if (p.includes('telegram')) return 'linear-gradient(135deg, #0088CC, #0066AA)';
    if (p.includes('tiktok')) return 'linear-gradient(135deg, #000000, #333333)';
    return 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
    : '';

  if (editing) {
    return (
      <div className="page">
        {/* Edit header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={() => setEditing(false)} style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
            padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <X size={16} /> Bekor
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Profilni tahrirlash</h2>
          <button onClick={handleSave} disabled={loading} style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '10px 16px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
            color: '#fff', display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.6 : 1,
          }}>
            <Save size={16} /> {loading ? '...' : 'Saqlash'}
          </button>
        </div>

        {/* Avatar / Logo upload */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block' }} onClick={() => fileRef.current?.click()}>
            <div className="avatar" style={{ width: 90, height: 90, fontSize: 36, margin: '0 auto', cursor: 'pointer' }}>
              {logoPreview
                ? <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.photoUrl
                  ? <img src={user.photoUrl} alt="" />
                  : profile?.name?.[0] || '?'}
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid var(--bg)', cursor: 'pointer',
            }}>
              <Camera size={14} color="#fff" />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Rasmni o'zgartirish uchun bosing</p>
        </div>

        <div className="fade-in">
          {isCompany ? (
            <>
              <div className="form-group">
                <label className="form-label">Kompaniya nomi</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Soha</label>
                <select className="form-select" value={form.industry || ''} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
                  <option value="">Soha tanlang</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tavsif</label>
                <textarea className="form-textarea" rows={4} placeholder="Kompaniya haqida..." value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Ism</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Yo'nalish</label>
                <select className="form-select" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Yo'nalish tanlang</option>
                  {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" rows={3} placeholder="O'zingiz haqingizda..." value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              {/* Social links */}
              <div className="form-group">
                <label className="form-label">Ijtimoiy tarmoqlar</label>
                {(form.socialLinks || ['']).map((link: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="https://instagram.com/username"
                      value={link}
                      onChange={(e) => {
                        const updated = [...(form.socialLinks || [''])];
                        updated[i] = e.target.value;
                        setForm({ ...form, socialLinks: updated });
                      }}
                    />
                    {(form.socialLinks || ['']).length > 1 && (
                      <button onClick={() => {
                        const updated = (form.socialLinks || []).filter((_: any, idx: number) => idx !== i);
                        setForm({ ...form, socialLinks: updated });
                      }} style={{
                        width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)',
                        background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', flexShrink: 0,
                      }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm({ ...form, socialLinks: [...(form.socialLinks || ['']), ''] })}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '10px 0', borderRadius: 12,
                    border: '1.5px dashed var(--border-strong)', background: 'transparent',
                    color: 'var(--primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>
                  <Plus size={18} /> Havola qo'shish
                </button>
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 0 }}>

      {/* Hero banner */}
      <div className="slide-up" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, #1E3A8A 100%)',
        borderRadius: '0 0 28px 28px',
        padding: '40px 20px 52px',
        marginLeft: -16, marginRight: -16,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: 20, left: 30, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Profil</h1>
            <button onClick={startEdit} style={{
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12,
              padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Pencil size={14} /> Tahrirlash
            </button>
          </div>

          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 76, height: 76, borderRadius: 22, overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0,
              background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 700, color: '#fff',
            }}>
              {user?.photoUrl ? <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile?.name?.[0] || user?.firstName?.[0] || '?'}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.3 }}>{profile?.name || user?.firstName}</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>@{user?.username || 'user'}</p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
                background: 'rgba(255,255,255,0.18)', borderRadius: 100,
                padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#fff',
                backdropFilter: 'blur(10px)',
              }}>
                {isCompany ? <Building2 size={13} /> : <Megaphone size={13} />}
                {isCompany ? 'Kompaniya' : 'Influenser'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards - overlapping banner */}
      <div className="slide-up" style={{ marginTop: -28, padding: '0 4px', marginBottom: 20 }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 16,
          boxShadow: '0 8px 30px rgba(15,23,42,0.1)', border: '1px solid var(--border)',
          display: 'flex', gap: 8,
        }}>
          {isCompany ? (
            <>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.ads}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>E'lonlar</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.applications}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>Arizalar</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{stats.ads > 0 ? 'Faol' : '—'}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>Holat</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{stats.applications}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>Arizalar</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{stats.accepted}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>Qabul</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>
                  {user?.influencer?.avgRating ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <Star size={16} fill="var(--warning)" stroke="var(--warning)" />
                      {Number(user.influencer.avgRating).toFixed(1)}
                    </span>
                  ) : '—'}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>Reyting</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* About section */}
      <div className="fade-in" style={{ marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 18,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--primary-bg)', color: 'var(--primary)',
            }}>
              <Briefcase size={14} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Ma'lumotlar</span>
          </div>

          {isCompany && user?.company && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Kompaniya</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user.company.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Soha</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user.company.industry}</span>
              </div>
              {user.company.description && (
                <div style={{ paddingTop: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tavsif</span>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 6 }}>{user.company.description}</p>
                </div>
              )}
            </>
          )}

          {!isCompany && user?.influencer && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Ism</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user.influencer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Yo'nalish</span>
                <span className="tag" style={{ fontSize: 12 }}>{user.influencer.category}</span>
              </div>
              {user.influencer.bio && (
                <div style={{ paddingTop: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bio</span>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 6 }}>{user.influencer.bio}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Social links (influencer only) */}
      {!isCompany && Object.keys(socialLinks).length > 0 && (
        <div className="fade-in" style={{ marginBottom: 16 }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 18,
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--primary-bg)', color: 'var(--primary)',
              }}>
                <Globe size={14} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Ijtimoiy tarmoqlar</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(socialLinks).map(([platform, link]) => (
                <a
                  key={platform}
                  href={String(link).startsWith('http') ? link : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none', transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: getPlatformColor(platform), color: '#fff', flexShrink: 0,
                  }}>
                    {getPlatformIcon(platform)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block' }}>{platform}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{link}</span>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account info */}
      <div className="fade-in" style={{ marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 18,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--primary-bg)', color: 'var(--primary)',
            }}>
              <Shield size={14} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Hisob ma'lumotlari</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Telegram</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>@{user?.username || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Ism</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.firstName} {user?.lastName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Rol</span>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
            }}>
              {isCompany ? 'Kompaniya' : 'Influenser'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> A'zo bo'lgan
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{memberSince || "2024"}</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="fade-in" style={{ marginBottom: 24 }}>
        <button
          onClick={async () => { hapticFeedback('heavy'); await logout(); window.location.reload(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px', borderRadius: 'var(--radius)',
            background: 'var(--danger-bg)', border: '1.5px solid transparent',
            color: 'var(--danger)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
          }}
        >
          <LogOut size={18} /> Hisobdan chiqish
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
