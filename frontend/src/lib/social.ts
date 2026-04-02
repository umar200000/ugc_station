/**
 * Ijtimoiy tarmoq nik nomi yoki linkidan to'liq URL yasaydi.
 * Kiritish: "username", "@username", "t.me/username", "https://t.me/username" — barchasi ishlaydi
 */
export function getSocialUrl(platform: string, value: string): string {
  const val = String(value).trim();
  if (!val) return '#';

  // To'liq URL bo'lsa — qaytarish
  if (val.startsWith('http://') || val.startsWith('https://')) return val;

  // Domen bilan yozilgan bo'lsa (masalan: instagram.com/user, t.me/user)
  if (val.includes('.') && val.includes('/')) return `https://${val}`;

  const p = platform.toLowerCase();
  // @ belgisini va ortiqcha bo'shliqlarni olib tashlash
  const clean = val.replace(/^@/, '').trim();

  if (p.includes('instagram')) return `https://instagram.com/${clean}`;
  if (p.includes('telegram')) return `https://t.me/${clean}`;
  if (p.includes('tiktok')) return `https://tiktok.com/@${clean}`;
  if (p.includes('youtube')) return `https://youtube.com/@${clean}`;
  if (p.includes('facebook')) return `https://facebook.com/${clean}`;
  if (p.includes('twitter') || p.includes('x')) return `https://x.com/${clean}`;

  // link_ prefixli qo'shimcha linklar
  if (val.includes('.')) return `https://${val}`;
  return val;
}
