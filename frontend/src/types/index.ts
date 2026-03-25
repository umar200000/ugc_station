export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  photoUrl: string;
  role: 'COMPANY' | 'INFLUENCER' | 'ADMIN' | null;
  onboarded: boolean;
  company?: Company;
  influencer?: Influencer;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  industry: string;
  logo: string;
  description: string;
}

export interface Influencer {
  id: string;
  userId: string;
  name: string;
  bio: string;
  category: string;
  socialLinks: Record<string, string>;
  avgRating?: number;
  completedCollabs?: number;
}

export interface Ad {
  id: string;
  companyId: string;
  title: string;
  description: string;
  images: string[];
  industry: string;
  videoFormat: 'ONLINE' | 'OFFLINE' | 'ANY';
  faceType: 'FACE' | 'FACELESS' | 'ANY';
  platforms: string[];
  influencerCount: number;
  adType: 'BARTER' | 'PAID';
  barterItem: string;
  payment: number;
  status: 'ACTIVE' | 'CLOSED' | 'MODERATION';
  createdAt: string;
  company: Company & { user?: { photoUrl: string } };
  acceptedCount: number;
  slotsLeft: number;
}

export interface Application {
  id: string;
  adId: string;
  influencerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  ad?: Ad;
  influencer?: Influencer & { user?: { username: string; photoUrl: string }; reviews?: { rating: number }[] };
}

export interface Review {
  id: string;
  applicationId: string;
  companyId: string;
  influencerId: string;
  type: 'COMPANY_TO_INFLUENCER' | 'INFLUENCER_TO_COMPANY';
  rating: number;
  comment: string;
  createdAt: string;
}

export const INDUSTRIES = [
  "Ta'lim / O'quv markazlar",
  'Kiyim va moda',
  'Elektronika va telefonlar',
  'Mebel',
  'Avtomobil ta\'miri',
  'Oziq-ovqat va restoran',
  'Go\'zallik va kosmetika',
  'Sport va fitness',
  'Ko\'chmas mulk',
  'Boshqa',
];

export const INFLUENCER_CATEGORIES = [
  'Barchasi',
  ...INDUSTRIES,
];

export const PLATFORMS = [
  'Instagram',
  'YouTube',
  'TikTok',
  'Telegram',
  'Facebook',
  'Twitter',
];
