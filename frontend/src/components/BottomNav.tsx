import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useCacheStore } from '../store/cache';
import { Home, Play, ClipboardList, Send, User, RefreshCw } from 'lucide-react';

export default function BottomNav() {
  const { user, refreshUser } = useAuthStore();
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      useCacheStore.getState().invalidateAll();
      await refreshUser();
      window.dispatchEvent(new CustomEvent('app-refresh'));
    } catch {}
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="bottom-nav-wrap">
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={22} strokeWidth={1.8} />
          <span>Bosh sahifa</span>
        </NavLink>

        <NavLink to="/videos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Play size={22} strokeWidth={1.8} />
          <span>Videolar</span>
        </NavLink>

        {/* Refresh button */}
        <button onClick={handleRefresh} className="nav-refresh-btn" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          width: 48, height: 48, borderRadius: '50%', border: 'none',
          color: '#fff', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
          marginTop: -18, transition: 'transform 0.2s',
        }}>
          <RefreshCw size={22} strokeWidth={2.2} style={{
            transition: 'transform 0.6s ease',
            transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
          }} />
        </button>

        {user?.role === 'COMPANY' ? (
          <NavLink to="/my-ads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ClipboardList size={22} strokeWidth={1.8} />
            <span>E'lonlarim</span>
          </NavLink>
        ) : (
          <NavLink to="/my-applications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Send size={22} strokeWidth={1.8} />
            <span>Arizalarim</span>
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={22} strokeWidth={1.8} />
          <span>Profil</span>
        </NavLink>
      </nav>
    </div>
  );
}
