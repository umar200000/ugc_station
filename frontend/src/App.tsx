import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from './store/auth';
import { useCacheStore } from './store/cache';

// Pages
import SelectRole from './pages/SelectRole';
import OnboardingCompany from './pages/OnboardingCompany';
import OnboardingInfluencer from './pages/OnboardingInfluencer';
import Feed from './pages/Feed';
import AdDetail from './pages/AdDetail';
import CreateAd from './pages/CreateAd';
import MyAds from './pages/MyAds';
import MyApplications from './pages/MyApplications';
import Influencers from './pages/Influencers';
import Videos from './pages/Videos';
import InfluencerProfile from './pages/InfluencerProfile';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import EditAd from './pages/EditAd';
import VideoPlayer from './pages/VideoPlayer';
import NotificationsPage from './pages/Notifications';
import MyVideos from './pages/MyVideos';
import ImageViewer from './pages/ImageViewer';
import Tariffs from './pages/Tariffs';
import TariffDetail from './pages/TariffDetail';
import SelectAdType from './pages/SelectAdType';
import TokenHistory from './pages/TokenHistory';

// Tab sahifalarini mount qilib, display bilan boshqarish
function TabPage({ path, children }: { path: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === path;
  const [visited, setVisited] = useState(isActive);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && !visited) setVisited(true);
  }, [isActive]);

  if (!visited) return null;

  return (
    <div ref={ref} style={{ display: isActive ? 'block' : 'none' }}>
      {children}
    </div>
  );
}

function App() {
  const { user, isLoading, contactRequired, phoneLoading, login, sharePhone } = useAuthStore();

  useEffect(() => {
    login();
    useCacheStore.getState().fetchLevelPrices();
  }, [login]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  // Telefon raqam bermagan — mini app ichida so'rash
  if (contactRequired) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
        textAlign: 'center', maxWidth: 420, margin: '0 auto',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 32,
        }}>
          📞
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Telefon raqam kerak</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
          Davom etish uchun telefon raqamingizni ulashing.
          Pastdagi tugmani bosing 👇
        </p>
        <button
          onClick={sharePhone}
          disabled={phoneLoading}
          style={{
            width: '100%', maxWidth: 320, padding: '16px 24px',
            borderRadius: 16, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff', fontSize: 16, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: phoneLoading ? 0.7 : 1,
          }}
        >
          {phoneLoading ? (
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : (
            <>📞 Telefon raqamni ulashish</>
          )}
        </button>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16 }}>
          Sizning raqamingiz faqat xizmat ko'rsatish uchun ishlatiladi
        </p>
      </div>
    );
  }

  // Yangi foydalanuvchi — rol tanlash
  if (user && !user.role) {
    return (
      <Routes>
        <Route path="*" element={<SelectRole />} />
      </Routes>
    );
  }

  // Ro'yxatdan o'tmagan
  if (user && !user.onboarded) {
    return (
      <Routes>
        {user.role === 'COMPANY' && (
          <Route path="*" element={<OnboardingCompany />} />
        )}
        {user.role === 'INFLUENCER' && (
          <Route path="*" element={<OnboardingInfluencer />} />
        )}
      </Routes>
    );
  }

  return (
    <MainApp />
  );
}

function MainApp() {
  const { user } = useAuthStore();
  const location = useLocation();
  const TAB_PATHS = ['/', '/videos', '/influencers', '/my-ads', '/my-applications', '/profile', '/tariffs'];
  const isTabPage = TAB_PATHS.includes(location.pathname);

  return (
    <>
      {/* Tab sahifalari — doim mount, display bilan boshqariladi */}
      <div style={{ display: isTabPage ? 'block' : 'none' }}>
        <TabPage path="/"><Feed /></TabPage>
        <TabPage path="/videos"><Videos /></TabPage>
        <TabPage path="/influencers"><Influencers /></TabPage>
        {user?.role === 'COMPANY' && <TabPage path="/my-ads"><MyAds /></TabPage>}
        {user?.role === 'COMPANY' && <TabPage path="/tariffs"><Tariffs /></TabPage>}
        {user?.role === 'INFLUENCER' && <TabPage path="/tariffs"><Tariffs /></TabPage>}
        {user?.role === 'INFLUENCER' && <TabPage path="/my-applications"><MyApplications /></TabPage>}
        <TabPage path="/profile"><Profile /></TabPage>
        {/* Admin panel moved to separate /admin folder */}
      </div>

      {/* Boshqa sahifalar — oddiy routing */}
      {!isTabPage && (
        <Routes>
          <Route path="/ad/:id" element={<AdDetail />} />
          <Route path="/influencer/:id" element={<InfluencerProfile />} />
          <Route path="/select-ad-type" element={<SelectAdType />} />
          <Route path="/create-ad" element={<CreateAd />} />
          <Route path="/ad/:id/edit" element={<EditAd />} />
          <Route path="/ad/:id/applications" element={<Applications />} />
          <Route path="/video" element={<VideoPlayer />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/my-videos" element={<MyVideos />} />
          <Route path="/image-viewer" element={<ImageViewer />} />
          <Route path="/tariffs/:id" element={<TariffDetail />} />
          <Route path="/token-history" element={<TokenHistory />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </>
  );
}

export default App;
