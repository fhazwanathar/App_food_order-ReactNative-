// src/services/qdrantService.js

/**
 * Data Mentah Tren AI (Simulasi Crawling/Doku/SOSMED)
 */
const RAW_TRENDS = {
  food: [
    {
      id: 'f1',
      title: 'Seafood Platter Viral',
      description: 'Lagi ramai di TikTok, perpaduan lobster dan saus Padang melimpah.',
      keywords: ['seafood', 'lobster', 'udang', 'kepiting', 'ikan'],
      image: 'https://images.unsplash.com/photo-1559740038-f95bab91acc1?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/seafoodviral',
    },
    {
      id: 'f2',
      title: 'Steak Kaki Lima Premium',
      description: 'Tren makan steak wagyu dengan harga miring di pinggir jalan.',
      keywords: ['steak', 'daging', 'sapi', 'wagyu', 'bbq', 'geprek'],
      image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/steakviral/',
    }
  ],
  drink: [
    {
      id: 'd1',
      title: 'Es Teh Jumbo 3000',
      description: 'Segarnya es teh dengan porsi raksasa yang hits di mana-mana.',
      keywords: ['teh', 'es', 'jumbo', 'segar', 'minum'],
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=es+teh+jumbo+viral',
    },
    {
      id: 'd2',
      title: 'Kopi Susu Gula Aren 2.0',
      description: 'Varian baru kopi susu dengan tambahan topping salt cream.',
      keywords: ['kopi', 'susu', 'coffee', 'latte', 'aren'],
      image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/kopisusu/',
    }
  ],
  snack: [
    {
      id: 's1',
      title: 'Cromboloni Lumer',
      description: 'Pastry renyah dengan isian cokelat melimpah yang lagi dicari semua orang.',
      keywords: ['pastry', 'cokelat', 'manis', 'kue', 'roti', 'snack'],
      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/cromboloni',
    },
    {
      id: 's2',
      title: 'Tahu Bulat Pedas Jeruk',
      description: 'Camilan klasik yang naik level dengan bumbu daun jeruk pedas.',
      keywords: ['tahu', 'pedas', 'camilan', 'jajanan', 'snack'],
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=tahu+bulat+viral',
    }
  ]
};

/**
 * Mencari kecocokan antara tren dengan menu yang tersedia (Simulasi Vector Search)
 */
const findBestMatch = (trend, menuItems) => {
  if (!menuItems || menuItems.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  menuItems.forEach(item => {
    let score = 0;
    const itemName = item.name?.toLowerCase() || '';
    const itemDesc = item.description?.toLowerCase() || '';

    // Cek kecocokan keyword (Simulasi Vector Distance)
    trend.keywords.forEach(keyword => {
      if (itemName.includes(keyword)) score += 30;
      if (itemDesc.includes(keyword)) score += 15;
    });

    // Bonus jika kategori sama
    if (trend.id.startsWith('f') && item.category === 'Makanan Utama') score += 20;
    if (trend.id.startsWith('d') && item.category === 'Minuman') score += 20;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { 
        ...item, 
        matchScore: Math.min(score, 99) // Maksimal 99%
      };
    }
  });

  // Jika skor terlalu rendah, anggap tidak ada yang cocok secara akurat
  return highestScore > 10 ? bestMatch : null;
};

/**
 * Mengambil tren AI dengan data menu yang sudah dicocokkan
 */
export const fetchAITrends = async (category = 'food', menuItems = []) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trends = RAW_TRENDS[category] || [];
      const enrichedTrends = trends.map(trend => {
        const matchedMenu = findBestMatch(trend, menuItems);
        return {
          ...trend,
          matchedMenu: matchedMenu,
          matchScore: matchedMenu ? matchedMenu.matchScore : 0
        };
      });
      resolve(enrichedTrends);
    }, 800);
  });
};

/**
 * Mencari info viral untuk menu item spesifik (Untuk Halaman Detail)
 */
export const getViralInfoForMenuItem = (menuItemId, allTrends = []) => {
  // Gabungkan semua tren
  const flatTrends = [
    ...RAW_TRENDS.food,
    ...RAW_TRENDS.drink,
    ...RAW_TRENDS.snack
  ];

  // Cari tren yang menyebutkan menu ini (Simulasi)
  // Di real-world, ini akan menggunakan query vektor ke Qdrant
  return flatTrends.find(trend => {
    // Simulasi: Jika trend punya matchedMenu yang ID-nya sama (ini butuh context lebih luas)
    // Untuk saat ini kita return tren yang keywords-nya ada di nama menu
    return false; // Implementasi lebih lanjut
  });
};
