import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import api from '../lib/api';
import { PLATFORMS, INDUSTRIES } from '../types';
import { hapticFeedback } from '../lib/telegram';
import { AdDetailShimmer } from '../components/Shimmer';
import { useCacheStore } from '../store/cache';

export default function EditAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', industry: '', videoFormat: 'ANY', faceType: 'ANY',
    platforms: [] as string[], influencerCount: 3, adType: 'BARTER', barterItem: '', payment: 0,
  });
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
          adType: ad.adType || 'BARTER',
          barterItem: ad.barterItem || '',
          payment: ad.payment || 0,
        });
        setExistingImages(ad.images || []);
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
      await api.put(`/ads/${id}`, { ...form, images: imageUrls });
      useCacheStore.getState().invalidateMyAds();
      useCacheStore.getState().invalidateFeed();
      navigate(`/ad/${id}`, { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdDetailShimmer />;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Orqaga
      </button>

      <div className="page-header">
        <h1 className="page-title">E'lonni tahrirlash</h1>
      </div>

      <div className="fade-in">
        <p className="section-title" style={{ marginTop: 0 }}>Kontent ma'lumotlari</p>

        <div className="form-group">
          <label className="form-label">Sarlavha</label>
          <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Tavsif</label>
          <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="form-group">
          <label className="form-label">Kategoriya</label>
          <select className="form-select" value={customIndustry ? '__custom__' : form.industry} onChange={(e) => {
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
            <input className="form-input" style={{ marginTop: 8 }} placeholder="Kategoriya nomini yozing..." value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Rasmlar ({existingImages.length + newImages.length}/5)</label>
          {(existingImages.length > 0 || newPreviews.length > 0) && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {existingImages.map((img, i) => (
                <div key={`ex-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={img} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }} />
                  <button onClick={() => removeExistingImage(i)} style={{
                    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`new-${i}`} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }} />
                  <button onClick={() => removeNewImage(i)} style={{
                    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
          {(existingImages.length + newImages.length) < 5 && (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--bg)' }}>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} style={{ display: 'none' }} />
              <ImagePlus size={20} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Rasm qo'shish</span>
            </label>
          )}
        </div>

        <p className="section-title">Influenserdan talablar</p>

        <div className="form-group">
          <label className="form-label">Video formati</label>
          <select className="form-select" value={form.videoFormat} onChange={(e) => setForm({ ...form, videoFormat: e.target.value })}>
            <option value="ANY">Farqi yo'q</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Yuz ko'rinishi</label>
          <select className="form-select" value={form.faceType} onChange={(e) => setForm({ ...form, faceType: e.target.value })}>
            <option value="ANY">Farqi yo'q</option>
            <option value="FACE">Face</option>
            <option value="FACELESS">Faceless</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Platformalar</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATFORMS.map((p) => (
              <span key={p} className={`chip ${form.platforms.includes(p) ? 'active' : ''}`} onClick={() => togglePlatform(p)}>{p}</span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Influenser soni</label>
          <input className="form-input" type="number" min={3} value={form.influencerCount}
            onChange={(e) => setForm({ ...form, influencerCount: Math.max(3, Number(e.target.value)) })} />
        </div>

        <div className="form-group">
          <label className="form-label">To'lov turi</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={`btn btn-sm ${form.adType === 'BARTER' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }} onClick={() => setForm({ ...form, adType: 'BARTER' })}>Barter</button>
            <button className={`btn btn-sm ${form.adType === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }} onClick={() => setForm({ ...form, adType: 'PAID' })}>Pullik</button>
          </div>
        </div>

        {form.adType === 'BARTER' && (
          <div className="form-group">
            <label className="form-label">Barter narsasi</label>
            <input className="form-input" value={form.barterItem} onChange={(e) => setForm({ ...form, barterItem: e.target.value })} />
          </div>
        )}
        {form.adType === 'PAID' && (
          <div className="form-group">
            <label className="form-label">To'lov (so'm)</label>
            <input className="form-input" type="text" inputMode="numeric" placeholder="100 000" value={form.payment ? String(form.payment).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''} onChange={(e) => { const num = Number(e.target.value.replace(/\s/g, '')); if (!isNaN(num)) setForm({ ...form, payment: num }); }} />
          </div>
        )}

        <button className="btn btn-primary" disabled={saving || !form.title.trim() || !form.description.trim()} onClick={handleSave}>
          {saving ? 'Saqlanmoqda...' : <><Save size={18} /> Saqlash</>}
        </button>
      </div>

    </div>
  );
}
