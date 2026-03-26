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

  // === Qo'shimcha mock influenserlar ===
  const mockInfluencers = [
    { telegramId: '20001', firstName: 'Madina', lastName: 'Karimova', username: 'madina_k', name: 'Madina Karimova', bio: 'Lifestyle va moda kontenti. 50K+ auditoriya. Instagram va TikTok da faol ishlayman.', category: 'Kiyim va moda', socialLinks: { Instagram: '@madina_k', TikTok: '@madina_k' } },
    { telegramId: '20002', firstName: 'Sardor', lastName: 'Toshmatov', username: 'sardor_fit', name: 'Sardor Toshmatov', bio: "Fitness va sog'lom turmush tarzi. Mashg'ulot dasturlari va ovqatlanish rejalari. 80K auditoriya.", category: 'Sport va fitness', socialLinks: { Instagram: '@sardor_fit', TikTok: '@sardor_fit', YouTube: '@sardor_fit' } },
    { telegramId: '20003', firstName: 'Dilfuza', lastName: 'Nazarova', username: 'dilfuza_food', name: 'Dilfuza Nazarova', bio: "Milliy va xalqaro taomlar retseptlari. Restoran obzorlari. 65K+ obunachilar.", category: 'Oziq-ovqat va restoran', socialLinks: { Instagram: '@dilfuza_food', TikTok: '@dilfuza_food' } },
    { telegramId: '20004', firstName: 'Azizbek', lastName: 'Umarov', username: 'aziz_auto', name: 'Azizbek Umarov', bio: "Avtomobil obzorlari va ta'mirlash maslahatlari. 40K YouTube obunachilar.", category: "Avtomobil ta'miri", socialLinks: { YouTube: '@aziz_auto', Telegram: '@aziz_auto' } },
    { telegramId: '20005', firstName: 'Shahlo', lastName: 'Mirzayeva', username: 'shahlo_edu', name: 'Shahlo Mirzayeva', bio: "Ingliz tili o'qituvchisi. Ta'lim kontenti va motivatsiya videolari. 90K+ auditoriya.", category: "Ta'lim / O'quv markazlar", socialLinks: { Instagram: '@shahlo_edu', YouTube: '@shahlo_edu', Telegram: '@shahlo_edu' } },
    { telegramId: '20006', firstName: 'Bobur', lastName: 'Xasanov', username: 'bobur_home', name: 'Bobur Xasanov', bio: "Uy jihozlari va interior dizayn. Mebel tanlash bo'yicha maslahatlar. 35K auditoriya.", category: 'Mebel', socialLinks: { Instagram: '@bobur_home', TikTok: '@bobur_home' } },
    { telegramId: '20007', firstName: 'Kamola', lastName: 'Sultanova', username: 'kamola_style', name: 'Kamola Sultanova', bio: "Hijob fashion va modest moda. Brend hamkorliklari. 110K Instagram obunachilar.", category: 'Kiyim va moda', socialLinks: { Instagram: '@kamola_style', TikTok: '@kamola_style', YouTube: '@kamola_style' } },
    { telegramId: '20008', firstName: 'Otabek', lastName: 'Qodirov', username: 'otabek_realty', name: 'Otabek Qodirov', bio: "Ko'chmas mulk bo'yicha maslahatchi. Kvartira va uy obzorlari. 55K YouTube.", category: "Ko'chmas mulk", socialLinks: { Instagram: '@otabek_realty', Telegram: '@otabek_realty', YouTube: '@otabek_realty' } },
    { telegramId: '20009', firstName: 'Zarina', lastName: 'Abdullayeva', username: 'zarina_life', name: 'Zarina Abdullayeva', bio: "Kundalik hayot va vlog. Oilaviy kontentlar. Safarlar va tajribalar. 70K+ auditoriya.", category: 'Boshqa', socialLinks: { Instagram: '@zarina_life', TikTok: '@zarina_life' } },
    { telegramId: '20010', firstName: 'Sherzod', lastName: 'Raximov', username: 'sherzod_tech', name: 'Sherzod Raximov', bio: "IT va dasturlash. Texnologiya yangiliklari va gadget sharhlari. 45K obunachilar.", category: 'Elektronika va telefonlar', socialLinks: { YouTube: '@sherzod_tech', Telegram: '@sherzod_tech' } },
    { telegramId: '20011', firstName: 'Gulnora', lastName: 'Ismoilova', username: 'gulnora_beauty', name: 'Gulnora Ismoilova', bio: "Makeup artist va skincare mutaxassisi. Tutorial va mahsulot obzorlari. 95K.", category: "Go'zallik va kosmetika", socialLinks: { Instagram: '@gulnora_beauty', YouTube: '@gulnora_beauty', TikTok: '@gulnora_beauty' } },
    { telegramId: '20012', firstName: 'Ulugbek', lastName: 'Normatov', username: 'ulugbek_sport', name: 'Ulugbek Normatov', bio: "Professional trener. Bodybuilding va powerlifting kontenti. 60K auditoriya.", category: 'Sport va fitness', socialLinks: { Instagram: '@ulugbek_sport', YouTube: '@ulugbek_sport' } },
  ];

  for (const inf of mockInfluencers) {
    const u = await prisma.user.create({
      data: {
        telegramId: inf.telegramId,
        firstName: inf.firstName,
        lastName: inf.lastName,
        username: inf.username,
        role: 'INFLUENCER',
        onboarded: true,
      },
    });
    await prisma.influencer.create({
      data: {
        userId: u.id,
        name: inf.name,
        bio: inf.bio,
        category: inf.category,
        socialLinks: JSON.stringify(inf.socialLinks),
      },
    });
    console.log(`  + ${inf.name} (${inf.category})`);
  }

  console.log('Seed data muvaffaqiyatli qo\'shildi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
