import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Home, Play, ClipboardList, Send, User } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuthStore();

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
