import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import api from '../lib/api';
import { PLATFORMS } from '../types';
import { hapticFeedback } from '../lib/telegram';
import { useCacheStore } from '../store/cache';

export default function CreateAd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', videoFormat: 'ANY', faceType: 'ANY',
    platforms: [] as string[], influencerCount: 3, adType: 'BARTER', barterItem: '', payment: 0,
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
      await api.post('/ads', { ...form, images: imageUrls });
      useCacheStore.getState().invalidateMyAds();
      useCacheStore.getState().invalidateFeed();
      navigate('/my-ads');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Yangi e'lon</h1>
        <p className="page-subtitle">E'loningizni yarating va influenserlarni toping</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 100, background: 'var(--primary)' }} />
        <div style={{ flex: 1, height: 4, borderRadius: 100, background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />
      </div>

      {step === 1 && (
        <div className="fade-in">
          <p className="section-title" style={{ marginTop: 0 }}>Kontent ma'lumotlari</p>

          <div className="form-group">
            <label className="form-label">Sarlavha</label>
            <input className="form-input" placeholder="E'lon nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea className="form-textarea" placeholder="Reklama haqida batafsil yozing..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Rasmlar ({images.length}/5)</label>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-xs)' }} />
                    <button onClick={() => removeImage(i)} style={{
                      position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--danger)', color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 5 && (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--bg)' }}>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                <ImagePlus size={20} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Rasm qo'shish</span>
              </label>
            )}
          </div>

          {images.length === 0 && form.title.trim() && form.description.trim() && (
            <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>Kamida 1 ta rasm qo'shing</p>
          )}
          <button className="btn btn-primary" disabled={!form.title.trim() || !form.description.trim() || images.length === 0} onClick={() => setStep(2)}>
            Davom etish <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <p className="section-title" style={{ marginTop: 0 }}>Influenserdan talablar</p>

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
            <p className="form-hint">Minimum 3 ta influenser</p>
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
              <input className="form-input" placeholder="Nima berasiz?" value={form.barterItem} onChange={(e) => setForm({ ...form, barterItem: e.target.value })} />
            </div>
          )}
          {form.adType === 'PAID' && (
            <div className="form-group">
              <label className="form-label">To'lov (so'm)</label>
              <input className="form-input" type="number" placeholder="100 000" value={form.payment || ''} onChange={(e) => setForm({ ...form, payment: Number(e.target.value) })} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
              <ArrowLeft size={18} /> Orqaga
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading} onClick={handleSubmit}>
              {loading ? 'Yaratilmoqda...' : <><Rocket size={18} /> E'lon yaratish</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
