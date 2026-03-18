import { supabase } from '../lib/supabaseClient';

// Fungsi untuk menambah review baru ke tabel reviews
export async function addReview(menu_item_id, user_id, rating, text, user_name) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ menu_item_id, user_id, rating, text, user_name }])
    .select()
    .single();
  return { data, error };
}

// Fungsi untuk mengambil semua review pada satu menu
export async function getMenuReviews(menu_item_id) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('menu_item_id', menu_item_id)
    .order('created_at', { ascending: false });
  return { data, error };
}