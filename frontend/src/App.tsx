import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';

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
import InfluencerProfile from './pages/InfluencerProfile';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import EditAd from './pages/EditAd';

function App() {
  const { user, isLoading, login } = useAuthStore();

  useEffect(() => {
    login();
  }, [login]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Yuklanmoqda...</p>
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
    <Routes>
      {/* Umumiy */}
      <Route path="/" element={<Feed />} />
      <Route path="/ad/:id" element={<AdDetail />} />
      <Route path="/influencers" element={<Influencers />} />
      <Route path="/influencer/:id" element={<InfluencerProfile />} />
      <Route path="/profile" element={<Profile />} />

      {/* Kompaniya */}
      <Route path="/create-ad" element={<CreateAd />} />
      <Route path="/my-ads" element={<MyAds />} />
      <Route path="/ad/:id/edit" element={<EditAd />} />
      <Route path="/ad/:id/applications" element={<Applications />} />

      {/* Influenser */}
      <Route path="/my-applications" element={<MyApplications />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
