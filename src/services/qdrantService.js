// src/services/qdrantService.js

/**
 * Data Tren AI (Simulasi Vector Hub dari Qdrant)
 */
const MOCK_TRENDS = {
  food: [
    {
      id: 'f1',
      title: 'Seafood Platter Viral',
      description: 'Lagi ramai di TikTok, perpaduan lobster dan saus Padang melimpah.',
      image: 'https://images.unsplash.com/photo-1559740038-f95bab91acc1?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/seafoodviral',
      matchScore: 98
    },
    {
      id: 'f2',
      title: 'Steak Kaki Lima Premium',
      description: 'Tren makan steak wagyu dengan harga miring di pinggir jalan.',
      image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/steakviral/',
      matchScore: 92
    }
  ],
  drink: [
    {
      id: 'd1',
      title: 'Es Teh Jumbo 3000',
      description: 'Segarnya es teh dengan porsi raksasa yang hits di mana-mana.',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=es+teh+jumbo+viral',
      matchScore: 95
    },
    {
      id: 'd2',
      title: 'Kopi Susu Gula Aren 2.0',
      description: 'Varian baru kopi susu dengan tambahan topping salt cream.',
      image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/kopisusu/',
      matchScore: 89
    }
  ],
  snack: [
    {
      id: 's1',
      title: 'Cromboloni Lumer',
      description: 'Pastry renyah dengan isian cokelat melimpah yang lagi dicari semua orang.',
      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/cromboloni',
      matchScore: 99
    },
    {
      id: 's2',
      title: 'Tahu Bulat Pedas Jeruk',
      description: 'Camilan klasik yang naik level dengan bumbu daun jeruk pedas.',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=tahu+bulat+viral',
      matchScore: 85
    }
  ]
};

/**
 * Mengambil tren makanan/minuman berdasarkan kategori (AI Powered)
 * @param {String} category 'food' | 'drink' | 'snack'
 */
export const fetchAITrends = async (category = 'food') => {
  // Simulasi Delay Network
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRENDS[category] || []);
    }, 800);
  });
};
