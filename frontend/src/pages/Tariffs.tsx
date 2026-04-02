import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, Crown, Clock } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth';
import BottomNav from '../components/BottomNav';

interface Tariff {
  id: string;
  name: string;
  price: number;
  tokens?: number;
  dailyTokens?: number;
  durationDays?: number;
}

function fmtPrice(n: number) {
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

export default function Tariffs() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const isCompany = user?.role === 'COMPANY';
  const isInfluencer = user?.role === 'INFLUENCER';

  useEffect(() => {
    const endpoint = isInfluencer ? '/influencer-tariffs' : '/tariffs';
    api.get(endpoint)
      .then(res => setTariffs(res.data.tariffs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tokenBalance = isCompany
    ? (user?.company?.tokens ?? 0)
    : (user?.influencer?.tokens ?? 0);

  const activeTariff = isInfluencer && user?.influencer?.influencerTariff;
  const tariffEndDate = user?.influencer?.tariffEndDate;
  const daysLeft = tariffEndDate ? Math.max(0, Math.ceil((new Date(tariffEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="page" style={{ paddingTop: 0, background: '#F2F2F7' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: '0 0 24px 24px',
        padding: '44px 20px 28px',
        marginLeft: -16, marginRight: -16,
        borderBottom: '1px solid #E5E5EA',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B3B51', letterSpacing: -0.3 }}>Tariflar</h1>
        <p style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
          {isInfluencer ? 'Token sotib oling va e\'lonlarga ariza bering' : 'Token sotib oling va influenserlar bilan ishlang'}
        </p>

        {/* Token balance */}
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, #1B3B51, #2A5570)',
          borderRadius: 16, padding: '16px 20px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>Joriy balans</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>
                {tokenBalance} <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>token</span>
              </div>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={22} />
            </div>
          </div>
          {isInfluencer && activeTariff && (
            <div style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px',
            }}>
              <Clock size={14} style={{ opacity: 0.8 }} />
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>
                {(activeTariff as any).name} — {daysLeft} kun qoldi · {(activeTariff as any).dailyTokens} token/kuniga
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tariff list */}
      <div style={{ padding: '20px 0 100px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#8E8E93', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Mavjud tariflar
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid #E5E5EA', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="shimmer" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="shimmer" style={{ width: '60%', height: 16, borderRadius: 6, marginBottom: 8 }} />
                  <div className="shimmer" style={{ width: '80%', height: 12, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : tariffs.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            textAlign: 'center', border: '1px solid #E5E5EA',
          }}>
            <p style={{ color: '#8E8E93', fontSize: 14 }}>Hozircha tariflar yo'q</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tariffs.map((t, i) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tariffs/${t.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '18px 16px',
                  border: '1px solid #E5E5EA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: i === 0 ? 'rgba(16,185,129,0.12)' : i === 1 ? 'rgba(37,99,235,0.1)' : 'rgba(245,158,11,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 0 ? '#10B981' : i === 1 ? '#2563EB' : '#F59E0B',
                  flexShrink: 0,
                }}>
                  <Crown size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1B3B51' }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#8E8E93' }}>
                      <b style={{ color: '#1B3B51' }}>{fmtPrice(t.price)}</b> so'm
                    </span>
                    {isInfluencer && t.dailyTokens ? (
                      <>
                        <span style={{ fontSize: 13, color: '#8E8E93' }}>
                          <b style={{ color: '#1B3B51' }}>{t.dailyTokens}</b> token/kuniga
                        </span>
                        <span style={{ fontSize: 13, color: '#8E8E93' }}>
                          <b style={{ color: '#1B3B51' }}>{t.durationDays}</b> kun
                        </span>
                      </>
                    ) : t.tokens ? (
                      <span style={{ fontSize: 13, color: '#8E8E93' }}>
                        <b style={{ color: '#1B3B51' }}>{t.tokens}</b> token
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: '#C7C7CC', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
