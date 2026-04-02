import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import api from '../lib/api';
import { PLATFORMS, INDUSTRIES } from '../types';
import { hapticFeedback } from '../lib/telegram';
import { AdDetailShimmer } from '../components/Shimmer';
import { useCacheStore } from '../store/cache';
import { useAuthStore } from '../store/auth';

const ios = {
  page: {
    background: '#F2F2F7',
    minHeight: '100vh',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
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
    margin: '0 0 20px 0',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#8E8E93',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    margin: '24px 0 12px 0',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  } as React.CSSProperties,
  formGroup: {
    marginBottom: 16,
  } as React.CSSProperties,
  formLabel: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#1B3B51',
    marginBottom: 6,
  } as React.CSSProperties,
  formInput: {
    width: '100%',
    padding: '12px 14px',
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 12,
    fontSize: 15,
    color: '#1B3B51',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  formTextarea: {
    width: '100%',
    padding: '12px 14px',
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 12,
    fontSize: 15,
    color: '#1B3B51',
    outline: 'none',
    minHeight: 100,
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  formSelect: {
    width: '100%',
    padding: '12px 14px',
    background: '#fff',
    border: '1px solid #E5E5EA',
    borderRadius: 12,
    fontSize: 15,
    color: '#1B3B51',
    outline: 'none',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238E8E93' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
  } as React.CSSProperties,
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '14px 20px',
    background: '#1B3B51',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  } as React.CSSProperties,
  btnPrimaryDisabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '14px 20px',
    background: '#1B3B51',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'not-allowed',
    marginTop: 8,
    opacity: 0.5,
  } as React.CSSProperties,
  btnToggleActive: {
    flex: 1,
    padding: '10px 16px',
    background: '#1B3B51',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnToggleInactive: {
    flex: 1,
    padding: '10px 16px',
    background: '#F2F2F7',
    color: '#1B3B51',
    border: '1px solid #E5E5EA',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  chipActive: {
    display: 'inline-block',
    padding: '8px 16px',
    background: '#1B3B51',
    color: '#fff',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    userSelect: 'none' as const,
  } as React.CSSProperties,
  chipInactive: {
    display: 'inline-block',
    padding: '8px 16px',
    background: '#F2F2F7',
    color: '#1B3B51',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid #E5E5EA',
    userSelect: 'none' as const,
  } as React.CSSProperties,
  imageThumb: {
    width: 80,
    height: 80,
    objectFit: 'cover' as const,
    borderRadius: 10,
  } as React.CSSProperties,
  imageRemoveBtn: {
    position: 'absolute' as const,
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#FF3B30',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  uploadArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    border: '2px dashed #E5E5EA',
    borderRadius: 12,
    cursor: 'pointer',
    background: '#F2F2F7',
  } as React.CSSProperties,
};

export default function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', industry: '', videoFormat: 'ANY', faceType: 'ANY',
    platforms: [] as string[], influencerCount: 1,
  });
  const [adType, setAdType] = useState('PAID');
  const [extraInfluencers, setExtraInfluencers] = useState(0);
  const { user } = useAuthStore();
  const tokens = user?.company?.tokens ?? 0;
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState(false);

  useEffect(() => {
    api.get(`/ads/${id}`)
      .then((res) => {
        const ad = res.data;
        setForm({
          title: ad.title || '',
          description: ad.description || '',
          industry: ad.industry || '',
          videoFormat: ad.videoFormat || 'ANY',
          faceType: ad.faceType || 'ANY',
          platforms: ad.platforms || [],
          influencerCount: ad.influencerCount || 3,
        });
        setExistingImages(ad.images || []);
        setAdType(ad.adType || 'PAID');
        if (ad.industry && !INDUSTRIES.includes(ad.industry)) setCustomIndustry(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    setNewImages((prev) => {
      const totalAllowed = 5 - existingImages.length;
      const combined = [...prev, ...incoming].slice(0, totalAllowed);
      setNewPreviews(combined.map((f) => URL.createObjectURL(f)));
      return combined;
    });
    e.target.value = '';
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
      return updated;
    });
  };

  const togglePlatform = (p: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    hapticFeedback('medium');
    try {
      let imageUrls = [...existingImages];
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => formData.append('images', img));
        const uploadRes = await api.post('/upload/images', formData);
        imageUrls = [...imageUrls, ...uploadRes.data.urls];
      }
      await api.put(`/ads/${id}`, {
        ...form,
        images: imageUrls,
        extraInfluencers: extraInfluencers > 0 ? extraInfluencers : undefined,
      });
      useCacheStore.getState().invalidateMyAds();
      useCacheStore.getState().invalidateFeed();
      useAuthStore.getState().refreshUser();
      navigate(`/ad/${id}`, { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdDetailShimmer />;

  const extraTokenCost = extraInfluencers > 0
    ? (adType === 'BARTER'
      ? Math.ceil((form.influencerCount + extraInfluencers) / 3) - Math.ceil(form.influencerCount / 3)
      : extraInfluencers)
    : 0;
  const isDisabled = saving || !form.title.trim() || !form.description.trim() || extraTokenCost > tokens;

  return (
    <div style={ios.page}>
      <button style={ios.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <h1 style={ios.pageTitle}>E'lonni tahrirlash</h1>

      <div>
        <p style={{ ...ios.sectionTitle, marginTop: 0 }}>Kontent ma'lumotlari</p>

        <div style={ios.card}>
          <div style={ios.formGroup}>
            <label style={ios.formLabel}>Sarlavha</label>
            <input style={ios.formInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={ios.formGroup}>
            <label style={ios.formLabel}>Tavsif</label>
            <textarea style={ios.formTextarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={ios.formGroup}>
            <label style={ios.formLabel}>Kategoriya</label>
            <select style={ios.formSelect} value={customIndustry ? '__custom__' : form.industry} onChange={(e) => {
              if (e.target.value === '__custom__') {
                setCustomIndustry(true);
                setForm({ ...form, industry: '' });
              } else {
                setCustomIndustry(false);
                setForm({ ...form, industry: e.target.value });
              }
            }}>
              <option value="">Kategoriya tanlang</option>
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              <option value="__custom__">Boshqa (o'zim yozaman)</option>
            </select>
            {customIndustry && (
              <input style={{ ...ios.formInput, marginTop: 8 }} placeholder="Kategoriya nomini yozing..." value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            )}
          </div>

          <div style={{ ...ios.formGroup, marginBottom: 0 }}>
            <label style={ios.formLabel}>Rasmlar ({existingImages.length + newImages.length}/5)</label>
            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <div key={`ex-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={img} alt="" style={ios.imageThumb} />
                    <button onClick={() => removeExistingImage(i)} style={ios.imageRemoveBtn}>×</button>
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={src} alt="" style={ios.imageThumb} />
                    <button onClick={() => removeNewImage(i)} style={ios.imageRemoveBtn}>×</button>
                  </div>
                ))}
              </div>
            )}
            {(existingImages.length + newImages.length) < 5 && (
              <label style={ios.uploadArea}>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                <ImagePlus size={20} style={{ color: '#8E8E93' }} />
                <span style={{ color: '#8E8E93', fontSize: 14 }}>Rasm qo'shish</span>
              </label>
            )}
          </div>
        </div>

        <p style={ios.sectionTitle}>Influenserdan talablar</p>

        <div style={ios.card}>
          <div style={ios.formGroup}>
            <label style={ios.formLabel}>Video formati</label>
            <select style={ios.formSelect} value={form.videoFormat} onChange={(e) => setForm({ ...form, videoFormat: e.target.value })}>
              <option value="ANY">Farqi yo'q</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          <div style={ios.formGroup}>
            <label style={ios.formLabel}>Yuz ko'rinishi</label>
            <select style={ios.formSelect} value={form.faceType} onChange={(e) => setForm({ ...form, faceType: e.target.value })}>
              <option value="ANY">Farqi yo'q</option>
              <option value="FACE">Face</option>
              <option value="FACELESS">Faceless</option>
            </select>
          </div>

          <div style={ios.formGroup}>
            <label style={ios.formLabel}>Platformalar</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLATFORMS.map((p) => (
                <span key={p} style={form.platforms.includes(p) ? ios.chipActive : ios.chipInactive} onClick={() => togglePlatform(p)}>{p}</span>
              ))}
            </div>
          </div>

          <div style={{ ...ios.formGroup, marginBottom: 0 }}>
            <label style={ios.formLabel}>Hozirgi influenser soni</label>
            <input style={{ ...ios.formInput, background: '#F2F2F7', color: '#8E8E93' }} type="number" value={form.influencerCount} disabled />
          </div>

          <div style={{ ...ios.formGroup, marginTop: 14, marginBottom: 0 }}>
            <label style={ios.formLabel}>Qo'shimcha influenser qo'shish</label>
            <input style={ios.formInput} type="number" min={0} placeholder="0" value={extraInfluencers || ''}
              onChange={(e) => setExtraInfluencers(Math.max(0, Number(e.target.value) || 0))} />
            {extraInfluencers > 0 && (() => {
              const isBarter = adType === 'BARTER';
              const oldTotal = form.influencerCount;
              const newTotal = oldTotal + extraInfluencers;
              let tokenCost: number;
              if (isBarter) {
                tokenCost = Math.ceil(newTotal / 3) - Math.ceil(oldTotal / 3);
              } else {
                tokenCost = extraInfluencers;
              }
              const notEnough = tokenCost > tokens;
              return (
                <div style={{
                  marginTop: 8, padding: '10px 14px', borderRadius: 12,
                  background: notEnough ? 'rgba(255,149,0,0.08)' : 'rgba(27,59,81,0.04)',
                  fontSize: 13, fontWeight: 600, color: notEnough ? '#FF9500' : '#1B3B51',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>{oldTotal} → {newTotal} influenser</span>
                  <span style={{ color: notEnough ? '#FF3B30' : '#10B981' }}>-{tokenCost} token</span>
                </div>
              );
            })()}
          </div>
        </div>

        <button style={isDisabled ? ios.btnPrimaryDisabled : ios.btnPrimary} disabled={isDisabled} onClick={handleSave}>
          {saving ? 'Saqlanmoqda...' : <><Save size={18} /> Saqlash</>}
        </button>
      </div>

    </div>
  );
}
