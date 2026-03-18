import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList, Image, Modal,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import SuccessAnimation from '../components/SuccessAnimation';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

// ─── Float Particle ──────────────────────────────────────────
const FloatParticle = ({ emoji, onDone }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const scale      = useRef(new Animated.Value(1)).current;

  useState(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -140, duration: 800, useNativeDriver: false }),
      Animated.timing(opacity,    { toValue: 0,    duration: 800, useNativeDriver: false }),
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.6, friction: 3, useNativeDriver: false }),
        Animated.timing(scale,  { toValue: 0.4, duration: 300, useNativeDriver: false }),
      ]),
    ]).start(() => onDone());
  });

  return (
    <Animated.Text style={{
      position: 'absolute', bottom: 60, right: 20,
      fontSize: 30, zIndex: 999,
      transform: [{ translateY }, { scale }],
      opacity, pointerEvents: 'none',
    }}>
      {emoji}
    </Animated.Text>
  );
};

// ─── Add Button ───────────────────────────────────────────────
const AddButton = ({ onPress, theme }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.8, friction: 3, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1.1, friction: 3, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1,   friction: 4, useNativeDriver: false }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={handlePress} activeOpacity={0.85}>
        <Text style={styles.addBtnText}>+ Tambah</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Food Card ────────────────────────────────────────────────
const FoodCard = ({ item, theme, onAddToCart, onToggleFavorite, onPress, isFavorite }) => {
  const heartScale = useRef(new Animated.Value(1)).current;
  const cardScale  = useRef(new Animated.Value(1)).current;

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.6, friction: 3, useNativeDriver: false }),
      Animated.spring(heartScale, { toValue: 1,   friction: 4, useNativeDriver: false }),
    ]).start();
    onToggleFavorite(item.id);
  };

  const handlePressIn  = () => Animated.spring(cardScale, { toValue: 0.97, friction: 6, useNativeDriver: false }).start();
  const handlePressOut = () => Animated.spring(cardScale, { toValue: 1,    friction: 4, useNativeDriver: false }).start();

  const stars = Math.floor(item.rating || 0);

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.card, transform: [{ scale: cardScale }] }]}>
      {/* Image */}
      <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          {/* Gradient overlay */}
          <View style={styles.imageOverlay} />

          {/* Category pill */}
          <View style={[styles.categoryPill, { backgroundColor: theme.primary }]}>
            <Text style={styles.categoryPillText}>{item.category}</Text>
          </View>

          {/* Favorite button */}
          <Animated.View style={[styles.heartBtn, { transform: [{ scale: heartScale }] }]}>
            <TouchableOpacity onPress={handleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 22 }}>{isFavorite ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>⭐ {item.rating}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardPrice}>Rp {(item.price || 0).toLocaleString('id-ID')}</Text>
        </View>

        <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.reviewsRow}>
            <Text style={{ fontSize: 11, color: theme.textSecondary }}>
              {'⭐'.repeat(Math.min(stars, 5))} {item.total_reviews} ulasan
            </Text>
          </View>
          <AddButton onPress={() => onAddToCart(item)} theme={theme} />
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const MenuScreen = ({ navigation }) => {
  const { addToCart, favorites, toggleFavorite, isDarkMode, menuItems, menuLoading } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [selectedCategory, setSelectedCategory]       = useState('Semua');
  const [searchQuery, setSearchQuery]                 = useState('');
  const [sortBy, setSortBy]                           = useState('name-asc');
  const [showFavoritesOnly, setShowFavoritesOnly]     = useState(false);
  const [priceRange]                                  = useState({ min: 0, max: 100000 });
  const [showFilterModal, setShowFilterModal]         = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [particles, setParticles]                     = useState([]);
  const successScale = useRef(new Animated.Value(0)).current;

  const triggerSuccess = () => {
    setShowSuccessAnimation(true);
    Animated.sequence([
      Animated.spring(successScale, { toValue: 1, friction: 4, useNativeDriver: false }),
      Animated.delay(900),
      Animated.timing(successScale, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start(() => setShowSuccessAnimation(false));
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    const id = Date.now();
    setParticles(prev => [...prev, { id, emoji: '🛒' }]);
    triggerSuccess();
  };

  const categories  = ['Semua', 'Makanan Utama', 'Minuman'];
  const sortOptions = [
    { value: 'name-asc',    label: 'Nama A-Z' },
    { value: 'name-desc',   label: 'Nama Z-A' },
    { value: 'price-asc',   label: 'Termurah' },
    { value: 'price-desc',  label: 'Termahal' },
    { value: 'rating-desc', label: 'Rating Tertinggi' },
  ];

  const filteredMenu = useMemo(() => {
    let result = [...(menuItems || [])];
    if (selectedCategory !== 'Semua') result = result.filter(i => i.category === selectedCategory);
    if (searchQuery.trim()) result = result.filter(i =>
      i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (showFavoritesOnly) result = result.filter(i => favorites.includes(i.id));
    result = result.filter(i => (i.price || 0) >= priceRange.min && (i.price || 0) <= priceRange.max);
    switch (sortBy) {
      case 'name-asc':    result.sort((a, b) => a.name?.localeCompare(b.name)); break;
      case 'name-desc':   result.sort((a, b) => b.name?.localeCompare(a.name)); break;
      case 'price-asc':   result.sort((a, b) => a.price - b.price); break;
      case 'price-desc':  result.sort((a, b) => b.price - a.price); break;
      case 'rating-desc': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [selectedCategory, searchQuery, sortBy, showFavoritesOnly, priceRange, favorites, menuItems]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* ── Search Bar ── */}
      <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Cari makanan atau minuman..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ fontSize: 18, color: theme.textSecondary, paddingHorizontal: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category + Filter Row ── */}
      <View style={[styles.controlRow, { backgroundColor: theme.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && { backgroundColor: theme.primary }]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}

          {/* Fav toggle */}
          <TouchableOpacity
            style={[styles.catChip, showFavoritesOnly && { backgroundColor: '#e74c3c' }]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Text style={[styles.catChipText, showFavoritesOnly && { color: '#fff' }]}>❤️ Favorit</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Filter button */}
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.card }]} onPress={() => setShowFilterModal(true)}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* ── Result count ── */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 12, color: theme.textSecondary, fontStyle: 'italic' }}>
          {menuLoading ? 'Memuat menu...' : `${filteredMenu.length} menu tersedia`}
        </Text>
      </View>

      {/* ── List ── */}
      {menuLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 48 }}>🍔</Text>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Memuat menu...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMenu}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => (
            <FoodCard
              item={item}
              theme={theme}
              isFavorite={favorites.includes(item.id)}
              onAddToCart={handleAddToCart}
              onToggleFavorite={toggleFavorite}
              onPress={() => navigation.navigate('MenuDetail', { item })}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🍽️</Text>
              <Text style={[styles.emptyText, { color: theme.text }]}>Menu tidak ditemukan</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center' }}>
                Coba kata kunci lain atau ganti filter
              </Text>
            </View>
          )}
        />
      )}

      {/* ── Filter Modal ── */}
      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Urutkan Menu</Text>
            {sortOptions.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sortRow, sortBy === opt.value && { backgroundColor: theme.primary + '22' }]}
                onPress={() => { setSortBy(opt.value); setShowFilterModal(false); }}
              >
                <Text style={[styles.sortRowText, { color: theme.text }, sortBy === opt.value && { color: theme.primary, fontWeight: 'bold' }]}>
                  {opt.label}
                </Text>
                {sortBy === opt.value && <Text style={{ color: theme.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Particles ── */}
      {particles.map(p => (
        <FloatParticle key={p.id} emoji={p.emoji} onDone={() => setParticles(prev => prev.filter(x => x.id !== p.id))} />
      ))}

      {/* ── Success Overlay ── */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <SuccessAnimation style={{ width: 100, height: 100 }} />
            <Text style={styles.successText}>Ditambahkan! 🎉</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },

  // Search
  searchBar:        { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 10, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchIcon:       { fontSize: 18, marginRight: 8 },
  searchInput:      { flex: 1, fontSize: 14, paddingVertical: 0 },

  // Controls
  controlRow:       { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, marginBottom: 8 },
  catChip:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#f0f0f0' },
  catChipText:      { fontSize: 13, fontWeight: '600', color: '#666' },
  filterBtn:        { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },

  // List
  listContainer:    { paddingHorizontal: 16, paddingBottom: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  loadingText:      { fontSize: 16, marginTop: 12 },
  emptyContainer:   { paddingTop: 60, alignItems: 'center', paddingHorizontal: 32 },
  emptyText:        { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },

  // Card
  card:             { borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
  imageWrapper:     { position: 'relative', width: '100%', height: 200 },
  cardImage:        { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlay:     { ...StyleSheet.absoluteFillObject, background: 'transparent', backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)' },
  categoryPill:     { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryPillText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  heartBtn:         { position: 'absolute', top: 10, right: 12, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.92)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  ratingBadge:      { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  ratingBadgeText:  { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Card body
  cardBody:         { padding: 14 },
  cardTopRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardName:         { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 8 },
  cardPrice:        { fontSize: 16, fontWeight: 'bold', color: '#FF6347' },
  cardDesc:         { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  cardFooter:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewsRow:       { flex: 1 },

  // Add button
  addBtn:           { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10 },
  addBtnText:       { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // Modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle:      { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle:       { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  sortRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 6 },
  sortRowText:      { fontSize: 15 },

  // Success
  successOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  successCard:      { backgroundColor: '#fff', padding: 24, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  successText:      { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 8 },
});

export default MenuScreen;