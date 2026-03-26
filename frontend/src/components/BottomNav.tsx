import { NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import { Home, Users, ClipboardList, Send, User } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuthStore();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keyboard ochilganda nav bar ni yashirish
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      if (!wrapRef.current) return;
      const keyboardOpen = vv.height < window.innerHeight * 0.8;
      wrapRef.current.style.display = keyboardOpen ? 'none' : '';
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="bottom-nav-wrap" ref={wrapRef}>
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={22} strokeWidth={1.8} />
          <span>Bosh sahifa</span>
        </NavLink>

        <NavLink to="/influencers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={22} strokeWidth={1.8} />
          <span>Influenserlar</span>
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
