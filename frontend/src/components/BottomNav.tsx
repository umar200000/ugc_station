import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Home, Users, ClipboardList, Send, User, Shield } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="bottom-nav-wrap">
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={22} strokeWidth={1.8} />
          <span>Bosh sahifa</span>
        </NavLink>

        <NavLink to="/influencers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={22} strokeWidth={1.8} />
          <span>Influenserlar</span>
        </NavLink>

        {isAdmin ? (
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Shield size={22} strokeWidth={1.8} />
            <span>Admin</span>
          </NavLink>
        ) : user?.role === 'COMPANY' ? (
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
