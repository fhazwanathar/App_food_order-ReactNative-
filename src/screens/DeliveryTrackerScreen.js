import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const TRACK_WIDTH = width - 48;

const STATUS_FLOW = ['Pending', 'Processing', 'Delivering', 'Delivered'];
const STATUS_META = {
  Pending:    { icon: '⏳', label: 'Menunggu Konfirmasi', color: '#FF9800' },
  Processing: { icon: '👨‍🍳', label: 'Sedang Dimasak',       color: '#2196F3' },
  Delivering: { icon: '🛵', label: 'Dalam Perjalanan',     color: '#9C27B0' },
  Delivered:  { icon: '✅', label: 'Pesanan Tiba!',         color: '#4CAF50' },
};

const DeliveryTrackerScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const initialStatus = STATUS_FLOW.indexOf(order.status);
  const [statusIndex, setStatusIndex] = useState(Math.max(initialStatus, 0));
  const [etaSeconds, setEtaSeconds]   = useState(30 * 60); // 30 menit

  // Animasi rider bergerak
  const riderX    = useRef(new Animated.Value(0)).current;
  const riderBob  = useRef(new Animated.Value(0)).current;
  // Progress bar animasi
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentStatus = STATUS_FLOW[statusIndex];
  const meta = STATUS_META[currentStatus];

  // Bobbing rider animation (terus loop)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(riderBob, { toValue: -6, duration: 400, useNativeDriver: false }),
        Animated.timing(riderBob, { toValue: 0,  duration: 400, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Auto-advance status setiap 8 detik (simulasi)
  useEffect(() => {
    if (statusIndex >= STATUS_FLOW.length - 1) return;
    const t = setTimeout(() => setStatusIndex(i => i + 1), 8000);
    return () => clearTimeout(t);
  }, [statusIndex]);

  // Animasi progress bar & rider saat status berubah
  useEffect(() => {
    const targetProgress = statusIndex / (STATUS_FLOW.length - 1);
    Animated.spring(progressAnim, {
      toValue: targetProgress,
      friction: 6,
      useNativeDriver: false,
    }).start();

    // Rider X position: 0% → 100% dari track
    Animated.spring(riderX, {
      toValue: targetProgress * (TRACK_WIDTH - 48),
      friction: 5,
      useNativeDriver: false,
    }).start();
  }, [statusIndex]);

  // ETA countdown
  useEffect(() => {
    if (currentStatus === 'Delivered') return;
    const t = setInterval(() => setEtaSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [currentStatus]);

  const formatEta = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_WIDTH],
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>

      {/* ── Header Status ── */}
      <View style={[styles.statusCard, { backgroundColor: meta.color }]}>
        <Text style={styles.statusIcon}>{meta.icon}</Text>
        <Text style={styles.statusLabel}>{meta.label}</Text>
        {currentStatus !== 'Delivered' ? (
          <View style={styles.etaBox}>
            <Text style={styles.etaLabel}>Estimasi Tiba</Text>
            <Text style={styles.etaValue}>{formatEta(etaSeconds)}</Text>
          </View>
        ) : (
          <Text style={styles.arrivedText}>Selamat menikmati! 🎉</Text>
        )}
      </View>

      {/* ── Map Simulation ── */}
      <View style={[styles.mapCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.mapTitle, { color: theme.text }]}>🗺️ Rute Pengiriman</Text>

        {/* Track */}
        <View style={styles.trackContainer}>
          {/* Road background */}
          <View style={styles.road}>
            {/* Dashed lines */}
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.roadDash} />
            ))}
          </View>

          {/* Progress fill */}
          <Animated.View style={[styles.roadProgress, { width: progressWidth, backgroundColor: meta.color }]} />

          {/* Rider */}
          <Animated.View style={[styles.riderContainer, {
            transform: [{ translateX: riderX }, { translateY: riderBob }]
          }]}>
            <Text style={styles.riderEmoji}>🛵</Text>
          </Animated.View>

          {/* Start & End markers */}
          <View style={styles.markerStart}>
            <Text style={styles.markerEmoji}>🍳</Text>
            <Text style={styles.markerLabel}>Resto</Text>
          </View>
          <View style={styles.markerEnd}>
            <Text style={styles.markerEmoji}>📍</Text>
            <Text style={styles.markerLabel}>Kamu</Text>
          </View>
        </View>

        {/* Address */}
        <View style={[styles.addressBox, { backgroundColor: theme.background }]}>
          <Text style={[styles.addressLabel, { color: theme.textSecondary }]}>Dikirim ke:</Text>
          <Text style={[styles.addressValue, { color: theme.text }]} numberOfLines={2}>
            {order.deliveryAddress}
          </Text>
        </View>
      </View>

      {/* ── Timeline ── */}
      <View style={[styles.timelineCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.timelineTitle, { color: theme.text }]}>📋 Status Pesanan</Text>
        {STATUS_FLOW.map((status, i) => {
          const m = STATUS_META[status];
          const done = i <= statusIndex;
          const active = i === statusIndex;
          return (
            <View key={status} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineDot,
                  { borderColor: done ? m.color : theme.border },
                  done && { backgroundColor: m.color },
                ]}>
                  {done && <Text style={styles.timelineDotCheck}>✓</Text>}
                </View>
                {i < STATUS_FLOW.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: i < statusIndex ? m.color : theme.border }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[
                  styles.timelineStatus,
                  { color: active ? m.color : done ? theme.text : theme.textSecondary },
                  active && { fontWeight: 'bold' },
                ]}>
                  {m.icon} {m.label}
                </Text>
                {active && (
                  <Text style={[styles.timelineActive, { color: m.color }]}>● Sekarang</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Order Info ── */}
      <View style={[styles.orderCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.orderTitle, { color: theme.text }]}>🧾 Detail Pesanan</Text>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>No. Pesanan</Text>
          <Text style={[styles.orderValue, { color: theme.text }]}>#{order.orderNumber}</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>Total Item</Text>
          <Text style={[styles.orderValue, { color: theme.text }]}>{order.items.length} item</Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>Total Bayar</Text>
          <Text style={[styles.orderValue, { color: '#FF6347', fontWeight: 'bold' }]}>
            Rp {order.total.toLocaleString('id-ID')}
          </Text>
        </View>
        <View style={styles.orderRow}>
          <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>Pembayaran</Text>
          <Text style={[styles.orderValue, { color: theme.text }]}>{order.paymentMethod}</Text>
        </View>
      </View>

      {currentStatus === 'Delivered' && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate('CartMain')}
        >
          <Text style={styles.doneButtonText}>🏠 Kembali ke Beranda</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1 },
  statusCard:       { padding: 24, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  statusIcon:       { fontSize: 56, marginBottom: 8 },
  statusLabel:      { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  etaBox:           { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16, alignItems: 'center' },
  etaLabel:         { fontSize: 12, color: '#fff', opacity: 0.9 },
  etaValue:         { fontSize: 32, fontWeight: 'bold', color: '#fff', fontVariant: ['tabular-nums'] },
  arrivedText:      { fontSize: 18, color: '#fff', fontWeight: '600' },
  mapCard:          { margin: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mapTitle:         { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  trackContainer:   { height: 80, marginBottom: 16, position: 'relative', justifyContent: 'center' },
  road:             { position: 'absolute', left: 24, right: 24, height: 12, backgroundColor: '#e0e0e0', borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', overflow: 'hidden', top: 34 },
  roadDash:         { width: 16, height: 3, backgroundColor: '#bbb', borderRadius: 2 },
  roadProgress:     { position: 'absolute', left: 24, height: 12, borderRadius: 6, top: 34 },
  riderContainer:   { position: 'absolute', left: 16, top: 12 },
  riderEmoji:       { fontSize: 36 },
  markerStart:      { position: 'absolute', left: 0, alignItems: 'center', top: 10 },
  markerEnd:        { position: 'absolute', right: 0, alignItems: 'center', top: 10 },
  markerEmoji:      { fontSize: 28 },
  markerLabel:      { fontSize: 10, color: '#666', fontWeight: '600', marginTop: 2 },
  addressBox:       { padding: 12, borderRadius: 10 },
  addressLabel:     { fontSize: 12, marginBottom: 4 },
  addressValue:     { fontSize: 14, fontWeight: '500' },
  timelineCard:     { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  timelineTitle:    { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  timelineRow:      { flexDirection: 'row', marginBottom: 4 },
  timelineLeft:     { alignItems: 'center', marginRight: 12, width: 24 },
  timelineDot:      { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  timelineDotCheck: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  timelineLine:     { width: 2, height: 32, marginTop: 4 },
  timelineContent:  { flex: 1, paddingTop: 2, paddingBottom: 8 },
  timelineStatus:   { fontSize: 14 },
  timelineActive:   { fontSize: 11, marginTop: 2 },
  orderCard:        { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  orderTitle:       { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  orderRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  orderLabel:       { fontSize: 14 },
  orderValue:       { fontSize: 14, fontWeight: '500' },
  doneButton:       { backgroundColor: '#FF6347', marginHorizontal: 16, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  doneButtonText:   { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default DeliveryTrackerScreen;