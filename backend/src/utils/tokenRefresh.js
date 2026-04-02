/**
 * Influencer uchun kunlik token yangilash.
 * Har kuni: tokens = dailyTokens (tarif faol bo'lsa)
 * Tarif muddati tugasa: tokens = 0, tarif o'chiriladi
 */
async function refreshInfluencerTokens(prisma, influencer) {
  if (!influencer.influencerTariffId || !influencer.tariffEndDate) return influencer;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Tarif muddati tugaganmi?
  if (now > new Date(influencer.tariffEndDate)) {
    return await prisma.influencer.update({
      where: { id: influencer.id },
      data: {
        tokens: 0,
        influencerTariffId: null,
        tariffStartDate: null,
        tariffEndDate: null,
        lastTokenRefresh: null,
      },
      include: { influencerTariff: true },
    });
  }

  // Bugun allaqachon yangilanganmi?
  if (influencer.lastTokenRefresh) {
    const lastRefresh = new Date(influencer.lastTokenRefresh);
    const lastRefreshDay = new Date(lastRefresh.getFullYear(), lastRefresh.getMonth(), lastRefresh.getDate());
    if (lastRefreshDay >= today) return influencer;
  }

  // Kunlik tokenlarni yangilash
  const tariff = influencer.influencerTariff || await prisma.influencerTariff.findUnique({
    where: { id: influencer.influencerTariffId },
  });
  if (!tariff) return influencer;

  const dailyTokens = tariff.dailyTokens;
  // Agar hozirgi tokenlar daily limitdan kam bo'lsa — to'ldirish
  const newTokens = Math.max(influencer.tokens, dailyTokens);

  return await prisma.influencer.update({
    where: { id: influencer.id },
    data: { tokens: newTokens > dailyTokens ? dailyTokens : newTokens, lastTokenRefresh: now },
    include: { influencerTariff: true },
  });
}

module.exports = { refreshInfluencerTokens };
