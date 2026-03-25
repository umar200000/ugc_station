import { useState } from 'react';
import { Building2, Megaphone, LogOut, Pencil } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import BottomNav from '../components/BottomNav';
import api from '../lib/api';
import { hapticFeedback } from '../lib/telegram';

export default function Profile() {
  const { user, refreshUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});

  const startEdit = () => {
    if (user?.role === 'COMPANY' && user.company) {
      setForm({ name: user.company.name, industry: user.company.industry, description: user.company.description || '' });
    } else if (user?.role === 'INFLUENCER' && user.influencer) {
      setForm({ name: user.influencer.name, bio: user.influencer.bio || '', category: user.influencer.category || '' });
    }
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    hapticFeedback('medium');
    try {
      await api.put('/users/profile', form);
      await refreshUser();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const profile = user?.role === 'COMPANY' ? user?.company : user?.influencer;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profil</h1>
      </div>

      <div className="fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="avatar avatar-lg" style={{ margin: '0 auto 14px' }}>
          {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : profile?.name?.[0] || user?.firstName?.[0] || '?'}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile?.name || user?.firstName}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>@{user?.username}</p>
        <span className={`badge ${user?.role === 'COMPANY' ? 'badge-active' : 'badge-barter'}`} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {user?.role === 'COMPANY' ? <><Building2 size={12} /> Kompaniya</> : <><Megaphone size={12} /> Influenser</>}
        </span>
      </div>

      {!editing ? (
        <div className="fade-in">
          <div className="card">
            {user?.role === 'COMPANY' && user.company && (
              <>
                <div className="info-row">
                  <span className="info-label">Kompaniya nomi</span>
                  <span className="info-value">{user.company.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Soha</span>
                  <span className="info-value">{user.company.industry}</span>
                </div>
                {user.company.description && (
                  <div style={{ paddingTop: 12 }}>
                    <span className="info-label">Tavsif</span>
                    <p style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6 }}>{user.company.description}</p>
                  </div>
                )}
              </>
            )}
            {user?.role === 'INFLUENCER' && user.influencer && (
              <>
                <div className="info-row">
                  <span className="info-label">Ism</span>
                  <span className="info-value">{user.influencer.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Yo'nalish</span>
                  <span className="info-value">{user.influencer.category}</span>
                </div>
                {user.influencer.bio && (
                  <div style={{ paddingTop: 12 }}>
                    <span className="info-label">Bio</span>
                    <p style={{ fontSize: 14, marginTop: 4, lineHeight: 1.6 }}>{user.influencer.bio}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <button className="btn btn-secondary" onClick={startEdit}>
            <Pencil size={16} /> Tahrirlash
          </button>

          <div className="divider" style={{ margin: '20px 0' }} />

          <button className="btn btn-danger" onClick={async () => { await logout(); window.location.reload(); }}>
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      ) : (
        <div className="fade-in">
          {user?.role === 'COMPANY' && (
            <>
              <div className="form-group">
                <label className="form-label">Kompaniya nomi</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tavsif</label>
                <textarea className="form-textarea" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </>
          )}
          {user?.role === 'INFLUENCER' && (
            <>
              <div className="form-group">
                <label className="form-label">Ism</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
            </>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditing(false)}>Bekor qilish</button>
            <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading} onClick={handleSave}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
