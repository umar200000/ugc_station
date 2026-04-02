import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Camera, Zap, CreditCard, User, Banknote, Clock } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth';

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

const CARD_NUMBER = '5614 6828 1317 8912';
const CARD_HOLDER = 'Otaboyev Azizbek';
const CARD_TYPE = 'UzCard';
const ADMIN_USERNAME = 'umar9334';

function DetailShimmer() {
  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7' }}>
      <div style={{ background: '#fff', padding: '16px 16px 20px', borderBottom: '1px solid #E5E5EA' }}>
        <div className="shimmer" style={{ width: 80, height: 20, borderRadius: 8, marginBottom: 16 }} />
        <div className="shimmer" style={{ width: 200, height: 24, borderRadius: 8 }} />
      </div>
      <div style={{ padding: '20px 16px' }}>
        <div className="shimmer" style={{ width: '100%', height: 88, borderRadius: 16, marginBottom: 16 }} />
        <div className="shimmer" style={{ width: '100%', height: 90, borderRadius: 16, marginBottom: 10 }} />
        <div className="shimmer" style={{ width: '100%', height: 90, borderRadius: 16, marginBottom: 10 }} />
        <div className="shimmer" style={{ width: '100%', height: 90, borderRadius: 16, marginBottom: 10 }} />
        <div className="shimmer" style={{ width: '100%', height: 52, borderRadius: 16, marginTop: 20 }} />
      </div>
    </div>
  );
}

export default function TariffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isInfluencer = user?.role === 'INFLUENCER';
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const endpoint = isInfluencer ? '/influencer-tariffs' : '/tariffs';
    api.get(endpoint)
      .then(res => {
        const t = (res.data.tariffs || []).find((x: Tariff) => x.id === id);
        setTariff(t || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ''));
    } catch {
      const el = document.createElement('textarea');
      el.value = CARD_NUMBER.replace(/\s/g, '');
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendScreenshot = () => {
    window.open(`https://t.me/${ADMIN_USERNAME}`, '_blank');
  };

  if (loading) return <DetailShimmer />;

  if (!tariff) {
    return (
      <div style={{ minHeight: '100vh', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8E8E93' }}>Tarif topilmadi</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F2F7' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        padding: '16px 16px 20px',
        borderBottom: '1px solid #E5E5EA',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1B3B51', fontSize: 15, fontWeight: 600,
            fontFamily: 'inherit', padding: 0, marginBottom: 16,
          }}
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B3B51', letterSpacing: -0.3 }}>
          To'lov ma'lumotlari
        </h1>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>

        {/* Tariff info card */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3B51, #2A5570)',
          borderRadius: 16, padding: '16px 18px', marginBottom: 16,
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>{tariff.name} tarifi</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>
              {fmtPrice(tariff.price)} <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>so'm</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.15)', borderRadius: 100,
              padding: '5px 12px', fontSize: 13, fontWeight: 700,
            }}>
              <Zap size={14} /> {tariff.dailyTokens ? `${tariff.dailyTokens} token/kuniga` : `${tariff.tokens} token`}
            </div>
            {tariff.durationDays && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.8, fontWeight: 600 }}>
                <Clock size={12} /> {tariff.durationDays} kun
              </div>
            )}
          </div>
        </div>

        {/* Payment details card */}
        <div style={{
          background: '#fff', borderRadius: 16,
          border: '1px solid #E5E5EA', overflow: 'hidden',
          marginBottom: 16,
        }}>
          {/* Card Number */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F2F2F7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <CreditCard size={14} style={{ color: '#8E8E93' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>Karta raqami</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#1B3B51',
                background: 'rgba(27,59,81,0.08)', padding: '2px 8px', borderRadius: 100,
              }}>{CARD_TYPE}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#F2F2F7', borderRadius: 10, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1B3B51', letterSpacing: 1.5 }}>
                {CARD_NUMBER}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(27,59,81,0.08)',
                  border: 'none', cursor: 'pointer',
                  color: copied ? '#10B981' : '#1B3B51',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  padding: '5px 10px', borderRadius: 8,
                  transition: 'all 0.2s', flexShrink: 0, marginLeft: 8,
                }}
              >
                {copied ? <><Check size={13} /> Nusxa</> : <><Copy size={13} /> Nusxa</>}
              </button>
            </div>
          </div>

          {/* Card Holder */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F2F2F7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <User size={14} style={{ color: '#8E8E93' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>Karta egasi</span>
            </div>
            <div style={{
              background: '#F2F2F7', borderRadius: 10, padding: '10px 14px',
              fontSize: 15, fontWeight: 600, color: '#1B3B51',
            }}>
              {CARD_HOLDER}
            </div>
          </div>

          {/* Amount */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Banknote size={14} style={{ color: '#8E8E93' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>To'lov summasi</span>
            </div>
            <div style={{
              background: '#F2F2F7', borderRadius: 10, padding: '10px 14px',
              fontSize: 16, fontWeight: 700, color: '#1B3B51',
            }}>
              {fmtPrice(tariff.price)} so'm
            </div>
          </div>
        </div>

        {/* Send Screenshot button */}
        <button
          onClick={handleSendScreenshot}
          style={{
            width: '100%', padding: '15px 24px',
            borderRadius: 14, border: 'none', cursor: 'pointer',
            background: '#1B3B51',
            color: '#fff', fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(27,59,81,0.25)',
          }}
        >
          <Camera size={18} /> Skrinshot yuborish
        </button>

        <p style={{
          textAlign: 'center', fontSize: 12, color: '#8E8E93',
          lineHeight: 1.6, marginTop: 12, padding: '0 10px',
        }}>
          To'lov qilganingizdan so'ng, skrinshot olib admin ga yuboring.
          Tokenlar admin tasdiqlangandan keyin qo'shiladi.
        </p>
      </div>
    </div>
  );
}
