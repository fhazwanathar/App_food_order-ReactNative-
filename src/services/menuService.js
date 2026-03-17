import { supabase } from '../config/supabase';

export const fetchMenuItems = async () => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');
  
  if (error) {
    console.error('Error fetch menu:', error.message);
    return [];
  }
  return data;
};

export const seedMenuItems = async (menuData) => {
  const items = menuData.map(item => ({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image_url: item.image,
    rating: item.rating,
    total_reviews: item.totalReviews,
  }));

  const { error } = await supabase
    .from('menu_items')
    .insert(items);

  if (error) console.error('Seed error:', error.message);
  else console.log('Menu seeded!');
};