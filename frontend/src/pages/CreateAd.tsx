import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImagePlus, ArrowLeft, ArrowRight, Rocket, Loader2, Zap, AlertTriangle } from 'lucide-react';

import api from '../lib/api';
import { PLATFORMS, INDUSTRIES } from '../types';
import { hapticFeedback } from '../lib/telegram';
import { useCacheStore } from '../store/cache';
import { useAuthStore } from '../store/auth';

function calcBarterTokens(count: number): number {
  if (count < 1) return 0;
  return Math.ceil(count / 3);
}

const ios = {
  page: {
    minHeight: '100vh',
    background: '#F2F2F7',
    padding: '16px 16px 32px',
  } as React.CSSProperties,
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: '50px',
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#1B3B51',
    cursor: 'pointer',
    marginBottom: 16,
  } as React.CSSProperties,
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1B3B51',
    margin: 0,
  } as React.CSSProperties,
  pageSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    margin: '4px 0 0',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1B3B51',
    margin: '0 0 16px',
  } as React.CSSProperties,
  formGroup: {
    marginBottom: 16,
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#1B3B51',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    color: '#1B3B51',
    outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    color: '#1B3B51',
    outline: 'none',
    minHeight: 100,
    resize: 'vertical' as const,
    boxSizing: 'border-box',
  } as React.CSSProperties,
  select: {
    width: '100%',
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 15,
    color: '#1B3B51',
    outline: 'none',
    boxSizing: 'border-box',
    appearance: 'none' as const,
  } as React.CSSProperties,
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    background: '#1B3B51',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    background: '#F2F2F7',
    color: '#1B3B51',
    border: '1px solid #E5E5EA',
    borderRadius: 14,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSmPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    background: '#1B3B51',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnSmSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    background: '#F2F2F7',
    color: '#1B3B51',
    border: '1px solid #E5E5EA',
    borderRadius: 14,
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #E5E5EA',
    background: '#fff',
    color: '#1B3B51',
  } as React.CSSProperties,
  chipActive: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #1B3B51',
    background: '#1B3B51',
    color: '#fff',
  } as React.CSSProperties,
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 6,
  } as React.CSSProperties,
};

export default function CreateAd() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const tokens = user?.company?.tokens ?? 0;
  const adType = (location.state as any)?.adType || 'DEPOSIT';
  const isBarter = adType === 'BARTER';
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', industry: '', videoFormat: 'ANY', faceType: 'ANY',
    platforms: [] as string[], influencerCount: isBarter ? 3 : 1,
    barterItem: '', barterPrice: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setImages((prev) => {
      const combined = [...prev, ...newFiles].slice(0, 5);
      setPreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setPreviews(updated.map((f) => URL.createObjectURL(f)));
      return updated;
    });
  };

  const togglePlatform = (p: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setLoading(true);
    hapticFeedback('medium');
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img));
        const uploadRes = await api.post('/upload/images', formData);
        imageUrls = uploadRes.data.urls;
      }
      await api.post('/ads', {
        ...form,
        images: imageUrls,
        adType: isBarter ? 'BARTER' : 'DEPOSIT',
        barterItem: isBarter ? form.barterItem.trim() : '',
        payment: isBarter ? Number(form.barterPrice) || 0 : 0,
      });
      useCacheStore.getState().invalidateMyAds();
      useCacheStore.getState().invalidateFeed();
      useAuthStore.getState().refreshUser();
      navigate('/my-ads');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = form.title.trim() && form.description.trim() && form.industry && images.length > 0;

  return (
    <div style={ios.page}>
      <button style={ios.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div style={{ marginBottom: 20 }}>
        <h1 style={ios.pageTitle}>Yangi e'lon</h1>
        <p style={ios.pageSubtitle}>E'loningizni yarating va influenserlarni toping</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 100, background: '#1B3B51' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 100, background: step >= 2 ? '#1B3B51' : '#E5E5EA' }} />
      </div>

      {step === 1 && (
        <div style={ios.card}>
          <p style={ios.sectionTitle}>Kontent ma'lumotlari</p>

          <div style={ios.formGroup}>
            <label style={ios.label}>Sarlavha</label>
            <input style={ios.input} placeholder="E'lon nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'} />
          </div>

          <div style={ios.formGroup}>
            <label style={ios.label}>Tavsif</label>
            <textarea style={ios.textarea} placeholder="Reklama haqida batafsil yozing..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'} />
          </div>

          <div style={ios.formGroup}>
            <label style={ios.label}>Kategoriya</label>
            <select style={ios.select} value={customIndustry ? '__custom__' : form.industry} onChange={(e) => {
              if (e.target.value === '__custom__') {
                setCustomIndustry(true);
                setForm({ ...form, industry: '' });
              } else {
                setCustomIndustry(false);
                setForm({ ...form, industry: e.target.value });
              }
            }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'}>
              <option value="">Kategoriya tanlang</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              <option value="__custom__">Boshqa (o'zim yozaman)</option>
            </select>
            {customIndustry && (
              <input style={{ ...ios.input, marginTop: 8 }} placeholder="Kategoriya nomini yozing..." value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'} />
            )}
          </div>

          <div style={ios.formGroup}>
            <label style={ios.label}>Rasmlar ({images.length}/5)</label>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
                    <button onClick={() => removeImage(i)} style={{
                      position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                      background: '#FF3B30', color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 5 && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed #E5E5EA', borderRadius: 12, cursor: 'pointer', background: '#F2F2F7' }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                <ImagePlus size={20} style={{ color: '#8E8E93' }} />
                <span style={{ color: '#8E8E93', fontSize: 14 }}>Rasm qo'shish</span>
              </label>
            )}
          </div>

          {images.length === 0 && form.title.trim() && form.description.trim() && (
            <p style={{ fontSize: 13, color: '#FF3B30', marginBottom: 8 }}>Kamida 1 ta rasm qo'shing</p>
          )}
          <button style={{ ...ios.btnPrimary, opacity: isStep1Valid ? 1 : 0.5 }} disabled={!isStep1Valid} onClick={() => setStep(2)}>
            Davom etish <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={ios.card}>
          <p style={ios.sectionTitle}>Influenserdan talablar</p>

          <div style={ios.formGroup}>
            <label style={ios.label}>Video formati</label>
            <select style={ios.select} value={form.videoFormat} onChange={(e) => setForm({ ...form, videoFormat: e.target.value })}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'}>
              <option value="ANY">Farqi yo'q</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          <div style={ios.formGroup}>
            <label style={ios.label}>Yuz ko'rinishi</label>
            <select style={ios.select} value={form.faceType} onChange={(e) => setForm({ ...form, faceType: e.target.value })}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'}>
              <option value="ANY">Farqi yo'q</option>
              <option value="FACE">Face</option>
              <option value="FACELESS">Faceless</option>
            </select>
          </div>

          <div style={ios.formGroup}>
            <label style={ios.label}>Platformalar</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLATFORMS.map((p) => (
                <span key={p} style={form.platforms.includes(p) ? ios.chipActive : ios.chip} onClick={() => togglePlatform(p)}>{p}</span>
              ))}
            </div>
          </div>

          {/* Barter fields */}
          {isBarter && (
            <>
              <div style={ios.formGroup}>
                <label style={ios.label}>Barter narsasi *</label>
                <input style={ios.input} placeholder="Masalan: iPhone 15 Pro" value={form.barterItem}
                  onChange={(e) => setForm({ ...form, barterItem: e.target.value })}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'} />
                <p style={ios.hint}>Barter qilayotgan narsangizni yozing</p>
              </div>
              <div style={ios.formGroup}>
                <label style={ios.label}>Taxminiy narxi (so'm) *</label>
                <input style={ios.input} type="text" inputMode="numeric" placeholder="500 000"
                  value={form.barterPrice ? String(form.barterPrice).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
                  onChange={(e) => { const num = e.target.value.replace(/\s/g, ''); if (!isNaN(Number(num))) setForm({ ...form, barterPrice: num }); }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E5EA'} />
                <p style={ios.hint}>Barter narsangizning taxminiy narxini kiriting</p>
              </div>
            </>
          )}

          <div style={ios.formGroup}>
            <label style={ios.label}>Influenser soni</label>
            <input style={{ ...ios.input, borderColor: form.influencerCount < 1 ? '#FF3B30' : '#E5E5EA' }} type="number" min={1} value={form.influencerCount || ''}
              onChange={(e) => setForm({ ...form, influencerCount: Number(e.target.value) || 0 })}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1B3B51'}
              onBlur={(e) => e.currentTarget.style.borderColor = form.influencerCount < 1 ? '#FF3B30' : '#E5E5EA'} />
            {/* Token balans */}
            {(() => {
              const tokenCost = isBarter ? calcBarterTokens(form.influencerCount) : form.influencerCount;
              const notEnough = tokenCost > tokens;
              return (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
                    fontSize: 13, fontWeight: 600, color: '#8E8E93',
                  }}>
                    <Zap size={14} style={{ color: tokens > 0 ? '#10B981' : '#FF3B30' }} />
                    <span>Tokenlaringiz: <b style={{ color: '#1B3B51' }}>{tokens}</b></span>
                    {form.influencerCount > 0 && (
                      <span style={{ marginLeft: 'auto', color: notEnough ? '#FF3B30' : '#10B981', fontWeight: 700 }}>
                        -{tokenCost} token
                      </span>
                    )}
                  </div>
                  {form.influencerCount < 1 ? (
                    <p style={{ fontSize: 12, color: '#FF3B30', fontWeight: 600, marginTop: 6 }}>Kamida 1 ta influenser</p>
                  ) : notEnough ? (
                    <div style={{
                      marginTop: 8, padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.2)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <AlertTriangle size={16} style={{ color: '#FF9500', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, color: '#FF9500', fontWeight: 700, margin: 0 }}>Tokenlar yetarli emas!</p>
                      </div>
                      <button onClick={() => navigate('/tariffs')} style={{
                        background: '#FF9500', color: '#fff', border: 'none', borderRadius: 8,
                        padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit', whiteSpace: 'nowrap',
                      }}>Token olish</button>
                    </div>
                  ) : isBarter ? (
                    <p style={ios.hint}>Har 3 ta influenserga 1 ta token</p>
                  ) : (
                    <p style={ios.hint}>1 ta influenser = 1 ta token</p>
                  )}
                </>
              );
            })()}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button style={{ ...ios.btnSecondary, flex: 1 }} onClick={() => setStep(1)}>
              <ArrowLeft size={18} /> Orqaga
            </button>
            <button style={{ ...ios.btnPrimary, flex: 2, opacity: loading || form.influencerCount < 1 || (isBarter ? calcBarterTokens(form.influencerCount) : form.influencerCount) > tokens || (isBarter && (!form.barterItem.trim() || !form.barterPrice)) ? 0.5 : 1 }} disabled={loading || form.influencerCount < 1 || (isBarter ? calcBarterTokens(form.influencerCount) : form.influencerCount) > tokens || (isBarter && (!form.barterItem.trim() || !form.barterPrice))} onClick={handleSubmit}>
              {loading ? <><Loader2 size={18} className="spin" /> Yaratilmoqda...</> : <><Rocket size={18} /> E'lon yaratish</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
