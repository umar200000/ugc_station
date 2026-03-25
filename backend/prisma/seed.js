const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Test kompaniya user
  const companyUser = await prisma.user.create({
    data: {
      telegramId: '12345',
      firstName: 'Test',
      lastName: 'Kompaniya',
      username: 'testcompany',
      role: 'COMPANY',
      onboarded: true,
    },
  });

  const company = await prisma.company.create({
    data: {
      userId: companyUser.id,
      name: 'TechUz LLC',
      industry: "Ta'lim / O'quv markazlar",
    },
  });

  // Test influenser users
  const infUser1 = await prisma.user.create({
    data: {
      telegramId: '11111',
      firstName: 'Ali',
      lastName: 'Valiyev',
      username: 'ali_content',
      role: 'INFLUENCER',
      onboarded: true,
    },
  });

  await prisma.influencer.create({
    data: {
      userId: infUser1.id,
      name: 'Ali Valiyev',
      bio: 'Texnologiya va ta\'lim kontenti yaratuvchiman. 50K+ auditoriya.',
      category: "Ta'lim / O'quv markazlar",
      socialLinks: JSON.stringify({
        Instagram: 'https://instagram.com/ali_content',
        YouTube: 'https://youtube.com/@ali_content',
        TikTok: 'https://tiktok.com/@ali_content',
      }),
    },
  });

  const infUser2 = await prisma.user.create({
    data: {
      telegramId: '22222',
      firstName: 'Nilufar',
      lastName: 'Karimova',
      username: 'nilufar_beauty',
      role: 'INFLUENCER',
      onboarded: true,
    },
  });

  await prisma.influencer.create({
    data: {
      userId: infUser2.id,
      name: 'Nilufar Karimova',
      bio: "Go'zallik va kosmetika bo'yicha kontent yaratuvchi. 120K Instagram.",
      category: "Go'zallik va kosmetika",
      socialLinks: JSON.stringify({
        Instagram: 'https://instagram.com/nilufar_beauty',
        TikTok: 'https://tiktok.com/@nilufar_beauty',
        Telegram: 'https://t.me/nilufar_beauty',
      }),
    },
  });

  const infUser3 = await prisma.user.create({
    data: {
      telegramId: '33333',
      firstName: 'Jasur',
      lastName: 'Toshmatov',
      username: 'jasur_fit',
      role: 'INFLUENCER',
      onboarded: true,
    },
  });

  await prisma.influencer.create({
    data: {
      userId: infUser3.id,
      name: 'Jasur Toshmatov',
      bio: 'Fitness va sport motivatsiya. Personal trainer.',
      category: 'Sport va fitness',
      socialLinks: JSON.stringify({
        Instagram: 'https://instagram.com/jasur_fit',
        YouTube: 'https://youtube.com/@jasur_fit',
      }),
    },
  });

  // Test e'lonlar
  await prisma.ad.create({
    data: {
      companyId: company.id,
      title: "Ingliz tili kursi uchun UGC video kerak",
      description: "Bizning ingliz tili kursimiz uchun qiziqarli va ijodiy video kontent kerak. Kursning afzalliklari, o'quvchilar tajribasi va natijalarni ko'rsatadigan video. Video 30-60 soniya davom etishi kerak.",
      images: JSON.stringify(['/uploads/sample1.jpg']),
      industry: "Ta'lim / O'quv markazlar",
      videoFormat: 'ONLINE',
      faceType: 'FACE',
      platforms: JSON.stringify(['Instagram', 'TikTok', 'YouTube']),
      influencerCount: 5,
      adType: 'BARTER',
      barterItem: '3 oylik bepul ingliz tili kursi',
    },
  });

  // 2-kompaniya
  const companyUser2 = await prisma.user.create({
    data: {
      telegramId: '44444',
      firstName: 'Moda',
      lastName: 'Brand',
      username: 'modabrand',
      role: 'COMPANY',
      onboarded: true,
    },
  });

  const company2 = await prisma.company.create({
    data: {
      userId: companyUser2.id,
      name: 'ModaBrand UZ',
      industry: 'Kiyim va moda',
    },
  });

  await prisma.ad.create({
    data: {
      companyId: company2.id,
      title: "Yangi kiyim kolleksiyasi uchun review video",
      description: "Yangi yozgi kolleksiyamiz uchun review video kerak. Kiyimlarni kiyib ko'rsatish, sifati va dizayni haqida gapirish. Tabiiiy va samimiy kontent.",
      images: JSON.stringify(['/uploads/sample1.jpg']),
      industry: 'Kiyim va moda',
      videoFormat: 'ANY',
      faceType: 'FACE',
      platforms: JSON.stringify(['Instagram', 'TikTok']),
      influencerCount: 3,
      adType: 'PAID',
      payment: 500000,
    },
  });

  await prisma.ad.create({
    data: {
      companyId: company.id,
      title: "IT bootcamp reklama video",
      description: "6 oylik IT bootcamp dasturimiz uchun reklama video kerak. Dasturlash o'rganishning qulayliklarini, bootcamp tajribasini va natijalarni ko'rsatadigan kontent.",
      images: JSON.stringify(['/uploads/sample1.jpg']),
      industry: "Ta'lim / O'quv markazlar",
      videoFormat: 'OFFLINE',
      faceType: 'ANY',
      platforms: JSON.stringify(['YouTube', 'Telegram']),
      influencerCount: 4,
      adType: 'BARTER',
      barterItem: 'Bepul bootcamp + sertifikat',
    },
  });

  await prisma.ad.create({
    data: {
      companyId: company2.id,
      title: "Sport kiyimlari uchun fitness kontent",
      description: "Yangi sport kiyimlari kolleksiyamiz uchun fitness video kontent kerak. Mashg'ulot paytida kiyimlarni kiyib ko'rsatish.",
      images: JSON.stringify(['/uploads/sample1.jpg']),
      industry: 'Kiyim va moda',
      videoFormat: 'ONLINE',
      faceType: 'FACE',
      platforms: JSON.stringify(['Instagram', 'TikTok', 'YouTube']),
      influencerCount: 3,
      adType: 'PAID',
      payment: 300000,
    },
  });

  console.log('Seed data muvaffaqiyatli qo\'shildi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
