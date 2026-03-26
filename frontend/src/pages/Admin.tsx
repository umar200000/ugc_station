import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, Megaphone, Trash2, AlertTriangle, ChevronRight, X, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth';

type Tab = 'companies' | 'influencers' | 'ads';

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('companies');
  const [companies, setCompanies] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: string; name: string } | null>(null);

  // Admin emasligini tekshirish
  if (user?.role !== 'ADMIN') {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Shield size={48} style={{ color: 'var(--danger)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Ruxsat yo'q</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Bu sahifa faqat admin uchun</p>
      </div>
    );
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, infRes, adRes] = await Promise.all([
        api.get('/admin/companies'),
        api.get('/admin/influencers'),
        api.get('/admin/ads'),
      ]);
      setCompanies(compRes.data.companies);
      setInfluencers(infRes.data.influencers);
      setAds(adRes.data.ads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      await api.delete(`/admin/${confirmDelete.type}/${confirmDelete.id}`);
      setConfirmDelete(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xatolik');
    } finally {
      setDeleting(null);
    }
  };

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: 'companies', label: 'Kompaniyalar', icon: Building2, count: companies.length },
    { key: 'influencers', label: 'Influenserlar', icon: Users, count: influencers.length },
    { key: 'ads', label: "E'lonlar", icon: Megaphone, count: ads.length },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="admin-header slide-up">
        <div className="admin-header-bg" />
        <div className="admin-header-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="admin-header-icon">
                <Shield size={22} />
              </div>
              <div>
                <h1 className="admin-header-title">Admin Panel</h1>
                <p className="admin-header-sub">Boshqaruv paneli</p>
              </div>
            </div>
            <button onClick={fetchData} className="admin-refresh">
              <RefreshCw size={18} className={loading ? 'admin-spin' : ''} />
            </button>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            {tabs.map((t) => (
              <div key={t.key} className="admin-stats-item">
                <span className="admin-stats-value">{t.count}</span>
                <span className="admin-stats-label">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              className={`admin-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <Icon size={16} />
              <span>{t.label}</span>
              <span className="admin-tab-count">{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 14 }}>Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="admin-list fade-in">
          {/* Companies */}
          {tab === 'companies' && (
            companies.length === 0 ? (
              <div className="admin-empty">Kompaniyalar yo'q</div>
            ) : companies.map((c) => (
              <div key={c.id} className="admin-item">
                <div className="admin-item-info">
                  <div className="admin-item-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                    {c.name?.[0] || '?'}
                  </div>
                  <div className="admin-item-details">
                    <span className="admin-item-name">{c.name}</span>
                    <span className="admin-item-meta">{c.industry} · @{c.user?.username || '—'}</span>
                    <span className="admin-item-meta">{c.user?.phone || 'Tel yo\'q'} · {c._count?.ads || 0} e'lon</span>
                  </div>
                </div>
                <button
                  className="admin-delete-btn"
                  onClick={() => setConfirmDelete({ id: c.id, type: 'company', name: c.name })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          {/* Influencers */}
          {tab === 'influencers' && (
            influencers.length === 0 ? (
              <div className="admin-empty">Influenserlar yo'q</div>
            ) : influencers.map((inf) => (
              <div key={inf.id} className="admin-item">
                <div className="admin-item-info">
                  <div className="admin-item-avatar" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                    {inf.name?.[0] || '?'}
                  </div>
                  <div className="admin-item-details">
                    <span className="admin-item-name">{inf.name}</span>
                    <span className="admin-item-meta">{inf.category} · @{inf.user?.username || '—'}</span>
                    <span className="admin-item-meta">{inf.user?.phone || 'Tel yo\'q'} · {inf._count?.applications || 0} ariza</span>
                  </div>
                </div>
                <button
                  className="admin-delete-btn"
                  onClick={() => setConfirmDelete({ id: inf.id, type: 'influencer', name: inf.name })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          {/* Ads */}
          {tab === 'ads' && (
            ads.length === 0 ? (
              <div className="admin-empty">E'lonlar yo'q</div>
            ) : ads.map((ad) => (
              <div key={ad.id} className="admin-item">
                <div className="admin-item-info">
                  <div className="admin-item-avatar" style={{
                    background: ad.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'var(--danger-bg)',
                    color: ad.status === 'ACTIVE' ? 'var(--secondary)' : 'var(--danger)',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {ad.status === 'ACTIVE' ? 'ON' : 'OFF'}
                  </div>
                  <div className="admin-item-details">
                    <span className="admin-item-name">{ad.title}</span>
                    <span className="admin-item-meta">
                      {ad.company?.name} · {ad.adType === 'PAID' ? `${ad.payment?.toLocaleString()} so'm` : 'Barter'}
                    </span>
                    <span className="admin-item-meta">{ad._count?.applications || 0} ariza · {ad.industry}</span>
                  </div>
                </div>
                <button
                  className="admin-delete-btn"
                  onClick={() => setConfirmDelete({ id: ad.id, type: 'ad', name: ad.title })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3 className="admin-modal-title">O'chirishni tasdiqlang</h3>
            <p className="admin-modal-text">
              <strong>"{confirmDelete.name}"</strong> ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setConfirmDelete(null)}>
                <X size={16} /> Bekor
              </button>
              <button
                className="admin-modal-delete"
                onClick={handleDelete}
                disabled={!!deleting}
              >
                <Trash2 size={16} /> {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
