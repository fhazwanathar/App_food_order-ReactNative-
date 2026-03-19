// src/screens/MenuDetailScreen.js
// Screen detail menu: tampilkan info makanan, rating, dan sistem review realtime dari Supabase

import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../config/supabase'; // koneksi Supabase langsung untuk fetch & realtime
import { useApp } from '../context/AppContext';

const MenuDetailScreen = ({ route, navigation }) => {
  const { item } = route.params; // data menu yang dikirim dari MenuScreen
  
  // Ambil fungsi & state yang dibutuhkan dari context
  const { isDarkMode, saveReview, session, userProfile } = useApp();

  // Animasi parallax gambar saat scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  // State untuk form review
  const [userRating, setUserRating]         = useState(0);
  const [reviewText, setReviewText]         = useState('');
  const [submitting, setSubmitting]         = useState(false);

  // State untuk daftar review dari Supabase
  const [reviews, setReviews]               = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Kalau user sudah pernah review menu ini, simpan datanya
  // supaya bisa ditampilkan mode "Edit" bukan "Tambah"
  const [existingReview, setExistingReview] = useState(null);

  // Warna theme — dark/light mode
  const bg      = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const card    = isDarkMode ? '#2a2a2a' : '#ffffff';
  const textCol = isDarkMode ? '#ffffff' : '#333333';
  const subText = isDarkMode ? '#aaaaaa' : '#666666';

  // ── Fetch semua review untuk menu ini dari Supabase ──────
  const fetchReviews = async () => {
    setLoadingReviews(true);

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('menu_item_id', item.id)   // filter hanya review untuk menu ini
      .order('created_at', { ascending: false }); // review terbaru di atas

    if (!error && data) {
      setReviews(data);

      // Cek apakah user yang sedang login sudah pernah review menu ini
      if (session?.user) {
        const myReview = data.find(r => r.user_id === session.user.id);
        if (myReview) {
          // Kalau sudah pernah, isi form dengan data review lama
          setExistingReview(myReview);
          setUserRating(myReview.rating);
          setReviewText(myReview.text || '');
        }
      }
    }

    setLoadingReviews(false);
  };

  // ── Setup realtime listener ───────────────────────────────
  // Setiap ada review baru/update dari user lain, langsung refresh
  useEffect(() => {
    fetchReviews();

    // Subscribe ke perubahan tabel reviews untuk menu_item_id ini
    const channel = supabase
      .channel(`reviews-menu-${item.id}`)
      .on('postgres_changes', {
        event: '*',            // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'reviews',
        filter: `menu_item_id=eq.${item.id}`,
      }, () => {
        fetchReviews(); // refresh otomatis saat ada perubahan
      })
      .subscribe();

    // Cleanup: unsubscribe saat keluar dari screen
    return () => supabase.removeChannel(channel);
  }, [item.id]);

  // ── Submit atau update review ─────────────────────────────
  const handleSubmitReview = async () => {
    // Validasi: harus login dulu
    if (!session?.user) {
      Alert.alert('Login Dulu', 'Kamu harus login untuk memberikan review.');
      return;
    }
    if (userRating === 0) {
      Alert.alert('Error', 'Pilih rating terlebih dahulu!');
      return;
    }
    if (reviewText.trim() === '') {
      Alert.alert('Error', 'Tulis review kamu!');
      return;
    }

    setSubmitting(true);

    if (existingReview) {
      // ── Mode Edit: update review yang sudah ada ──
      const { error } = await supabase
        .from('reviews')
        .update({ rating: userRating, text: reviewText })
        .eq('id', existingReview.id);

      if (error) Alert.alert('Error', 'Gagal update review: ' + error.message);
      else {
        Alert.alert('Berhasil!', 'Review kamu diperbarui');
        fetchReviews(); // refresh list
      }

    } else {
      // ── Mode Tambah: insert review baru via AppContext ──
      // saveReview sudah handle user_id & user_name dari session
      const { error } = await saveReview({
        menuItemId: item.id,
        rating: userRating,
        text: reviewText,
      });

      if (error) {
        Alert.alert('Error', 'Gagal mengirim review: ' + error.message);
      } else {
        Alert.alert('Berhasil!', 'Review kamu berhasil ditambahkan! 🎉');
        setUserRating(0);
        setReviewText('');
        fetchReviews(); // refresh list
      }
    }

    setSubmitting(false);
  };

  // ── Render bintang rating ─────────────────────────────────
  // onPress = null berarti bintang tidak bisa diklik (read-only)
  const renderStars = (rating, onPress = null) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress && onPress(star)}
          disabled={!onPress}
        >
          <Text style={{ fontSize: onPress ? 32 : 14, marginRight: 2 }}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Hitung rata-rata rating dari Supabase ─────────────────
  // Kalau belum ada review, fallback ke rating awal dari menu_items
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (item.rating || 0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false } // false karena web tidak support native driver
        )}
        scrollEventThrottle={16}
      >
        {/* ── Gambar Parallax ── */}
        <Animated.Image
          source={{ uri: item.image }}
          style={[styles.image, {
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [-250, 0, 250],
                outputRange: [-125, 0, 125],
                extrapolate: 'clamp',
              })
            }]
          }]}
        />

        {/* ── Info Makanan ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: textCol }]}>{item.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.price}>
              Rp {(item.price || 0).toLocaleString('id-ID')}
            </Text>
          </View>
          <Text style={[styles.description, { color: subText }]}>{item.description}</Text>

          {/* Rating summary — dihitung dari review Supabase */}
          <View style={[styles.ratingBox, { backgroundColor: bg }]}>
            <Text style={[styles.ratingNum, { color: textCol }]}>{avgRating}</Text>
            {renderStars(Math.floor(avgRating))}
            <Text style={[styles.ratingCount, { color: subText }]}>
              {reviews.length} ulasan
            </Text>
          </View>
        </View>

        {/* ── Form Review ── */}
        <View style={[styles.section, { backgroundColor: card, marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            {existingReview ? '✏️ Edit Review Kamu' : '📝 Tulis Review'}
          </Text>

          {/* Kalau belum login, tampilkan pesan */}
          {!session?.user ? (
            <Text style={{ color: subText, fontStyle: 'italic' }}>
              Login untuk memberikan review
            </Text>
          ) : (
            <>
              <Text style={[styles.label, { color: subText }]}>Rating:</Text>
              {/* Bintang bisa diklik — onPress = setUserRating */}
              {renderStars(userRating, setUserRating)}

              <Text style={[styles.label, { color: subText }]}>Review:</Text>
              <TextInput
                style={[styles.textArea, { color: textCol }]}
                placeholder="Bagikan pengalaman kamu..."
                placeholderTextColor={subText}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { opacity: submitting ? 0.7 : 1 }]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting
                    ? 'Mengirim...'
                    : existingReview
                      ? 'Update Review'
                      : 'Kirim Review'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Daftar Review dari Supabase ── */}
        <View style={[styles.section, { backgroundColor: card, marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: textCol }]}>
            💬 Semua Review ({reviews.length})
          </Text>

          {/* Loading state */}
          {loadingReviews ? (
            <Text style={{ color: subText, fontStyle: 'italic' }}>
              Memuat review...
            </Text>

          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={{ fontSize: 40 }}>💬</Text>
              <Text style={{ color: subText, marginTop: 8, textAlign: 'center' }}>
                Belum ada review. Jadilah yang pertama!
              </Text>
            </View>

          ) : (
            // Map semua review — termasuk dari user lain
            reviews.map(review => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: bg }]}>
                <View style={styles.reviewHeader}>

                  {/* Avatar huruf pertama nama user */}
                  <View style={styles.reviewAvatar}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                      {(review.user_name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.reviewUser, { color: textCol }]}>
                        {review.user_name || 'User'}
                      </Text>
                      {/* Tandai review milik user yang sedang login */}
                      {review.user_id === session?.user?.id && (
                        <Text style={styles.myBadge}> • Kamu</Text>
                      )}
                    </View>
                    <Text style={{ color: subText, fontSize: 11 }}>
                      {new Date(review.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </Text>
                  </View>

                  {/* Bintang read-only */}
                  {renderStars(review.rating)}
                </View>

                <Text style={[styles.reviewText, { color: subText }]}>
                  {review.text}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1 },
  image:          { width: '100%', height: 280, resizeMode: 'cover' },
  section:        { padding: 16 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name:           { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  categoryBadge:  { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  categoryText:   { fontSize: 12, color: '#1976d2', fontWeight: '600' },
  price:          { fontSize: 24, fontWeight: 'bold', color: '#FF6347' },
  description:    { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  ratingBox:      { padding: 16, borderRadius: 12, alignItems: 'center' },
  ratingNum:      { fontSize: 48, fontWeight: 'bold', marginBottom: 4 },
  ratingCount:    { fontSize: 14, marginTop: 4 },
  starsContainer: { flexDirection: 'row', marginBottom: 8 },
  sectionTitle:   { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label:          { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  textArea:       { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', height: 100, textAlignVertical: 'top', marginBottom: 12 },
  submitBtn:      { backgroundColor: '#FF6347', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitBtnText:  { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyReviews:   { padding: 30, alignItems: 'center' },
  reviewCard:     { padding: 14, borderRadius: 12, marginBottom: 12 },
  reviewHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF6347', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  reviewUser:     { fontSize: 14, fontWeight: 'bold' },
  myBadge:        { fontSize: 11, color: '#FF6347', fontWeight: 'bold' },
  reviewText:     { fontSize: 14, lineHeight: 20 },
});

export default MenuDetailScreen;