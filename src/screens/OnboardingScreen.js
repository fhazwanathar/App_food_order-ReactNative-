// src/screens/OnboardingScreen.js
// PPT-style staggered text entrance + smooth slide transitions
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import OnboardingAnimation from '../components/OnboardingAnimation';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    tag: 'KUALITAS BINTANG LIMA',
    title: 'Pesan Makanan\nFavoritmu',
    desc: 'Temukan menu lezat dari restoran terbaik di sekitarmu — cepat, mudah, dan memuaskan.',
    animationKey: 'food-loading',
    accent: '#FF6347',
  },
  {
    id: '2',
    tag: 'SAMPAI DALAM 30 MENIT',
    title: 'Pengiriman\nSuper Cepat',
    desc: 'Kurir kami siap antarkan pesananmu dengan teknologi pelacakan real-time langsung ke tanganmu.',
    animationKey: 'delivery',
    accent: '#FF8C00',
  },
  {
    id: '3',
    tag: 'HEMAT SETIAP HARI',
    title: 'Promo\nExclusive',
    desc: 'Raih diskon dan penawaran spesial setiap hari — khusus untuk Sobat FoodsStreets.',
    animationKey: 'success',
    accent: '#FFB347',
  },
];

// ─────────────────────────────────────────────────
//  Cinematic Intro: Wave + Brand Name (Monarch style)
// ─────────────────────────────────────────────────
function CinematicIntro({ onDone }) {
  const waveAnim  = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const tagAnim   = useRef(new Animated.Value(0)).current;
  const exitAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(waveAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(tagAnim,   { toValue: 1, duration: 800, delay: 250, useNativeDriver: true }),
      ]),
      Animated.delay(1400),
      Animated.timing(exitAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);

  const waveY = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });
  const titleY = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const tagY   = tagAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a0a', opacity: exitAnim, overflow: 'hidden' }]}>
      {/* Rising wave */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: waveY }] }]}>
        <LinearGradient
          colors={['#B22200', '#FF4500', '#FF6347', '#FF8C00']}
          start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Brand center */}
      <View style={styles.introCenter}>
        {/* Stacked text (depth effect) */}
        <Animated.View style={{ opacity: titleAnim, transform: [{ translateY: titleY }], alignItems: 'center' }}>
          <Text style={[styles.introTitle, { opacity: 0.12, position: 'absolute', top: 4 }]}>
            <Text style={styles.introF}>F</Text>oodsStreets
          </Text>
          <Text style={[styles.introTitle, { opacity: 0.35, position: 'absolute', top: 2 }]}>
            <Text style={styles.introF}>F</Text>oodsStreets
          </Text>
          <Text style={styles.introTitle}>
            <Text style={styles.introF}>F</Text>oodsStreets
          </Text>
        </Animated.View>

        <Animated.Text style={[styles.introTagline, { opacity: tagAnim, transform: [{ translateY: tagY }] }]}>
          Pesan  ·  Nikmati  ·  Ulangi
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────
//  PPT-style staggered element entrance
// ─────────────────────────────────────────────────
function useStaggeredEntrance(trigger) {
  const anims = [
    useRef(new Animated.Value(0)).current, // tag
    useRef(new Animated.Value(0)).current, // icon
    useRef(new Animated.Value(0)).current, // title
    useRef(new Animated.Value(0)).current, // desc
  ];

  useEffect(() => {
    // Reset all
    anims.forEach(a => a.setValue(0));

    const stagger = Animated.stagger(
      120,
      anims.map(a =>
        Animated.parallel([
          Animated.timing(a, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      )
    );
    stagger.start();
  }, [trigger]);

  return anims;
}

// ─────────────────────────────────────────────────
//  Main Onboarding
// ─────────────────────────────────────────────────
const OnboardingScreen = ({ onFinish }) => {
  const { isDarkMode } = useApp();
  const [phase, setPhase]             = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Slide panel animation
  const slideX = useRef(new Animated.Value(0)).current;

  // PPT stagger for each element
  const staggerAnims = useStaggeredEntrance(currentIndex);

  const goToNext = () => {
    if (transitioning) return;
    setTransitioning(true);

    // Slide panel left-out
    Animated.timing(slideX, { toValue: -width, duration: 350, useNativeDriver: true }).start(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(i => i + 1);
        slideX.setValue(width); // come from right
        Animated.timing(slideX, { toValue: 0, duration: 400, useNativeDriver: true }).start(() =>
          setTransitioning(false)
        );
      } else {
        onFinish();
      }
    });
  };

  if (phase === 'intro') {
    return <CinematicIntro onDone={() => setPhase('slides')} />;
  }

  const slide = slides[currentIndex];
  const bg = isDarkMode ? '#0d0d0d' : '#fff8f0';
  const textCol = isDarkMode ? '#f5f5f5' : '#111111';
  const descCol = isDarkMode ? '#aaaaaa' : '#555555';

  // Helper: animated style per element
  const staggerStyle = (index) => ({
    opacity: staggerAnims[index],
    transform: [{
      translateY: staggerAnims[index].interpolate({
        inputRange: [0, 1],
        outputRange: [32, 0],
      }),
    }],
  });

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <LinearGradient
        colors={isDarkMode ? ['#0d0d0d', '#1c0800'] : ['#fff8f0', '#fffaf7']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Slide Panel ── */}
      <Animated.View style={[styles.slidePanel, { transform: [{ translateX: slideX }] }]}>

        {/* Tag — PPT entrance item 1 */}
        <Animated.Text style={[styles.tag, { color: slide.accent }, staggerStyle(0)]}>
          {slide.tag}
        </Animated.Text>

        {/* Icon badge — PPT entrance item 2 */}
        <Animated.View style={[styles.iconRow, staggerStyle(1)]}>
          <OnboardingAnimation name={slide.animationKey} />
        </Animated.View>

        {/* Title — PPT entrance item 3 */}
        <Animated.Text style={[styles.title, { color: textCol }, staggerStyle(2)]}>
          {slide.title}
        </Animated.Text>

        {/* Description — PPT entrance item 4 */}
        <Animated.Text style={[styles.desc, { color: descCol }, staggerStyle(3)]}>
          {slide.desc}
        </Animated.Text>
      </Animated.View>

      {/* ── Fixed Footer ── */}
      <View style={styles.footer}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex
                    ? slide.accent
                    : 'rgba(180,180,180,0.25)',
                  width: i === currentIndex ? 32 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={goToNext}
          disabled={transitioning}
          style={styles.btnWrap}
        >
          <LinearGradient
            colors={['#FF8C00', '#FF4500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjutkan'}
            </Text>
            {/* Custom arrow — no emoji */}
            <View style={styles.arrowBox}>
              <View style={styles.arrowLine} />
              <View style={styles.arrowHead} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Skip */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={onFinish} style={{ marginTop: 14 }}>
            <Text style={{ color: 'rgba(180,180,180,0.6)', fontSize: 13, letterSpacing: 1 }}>
              Lewati
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Intro ──
  introCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 38,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 0.5,
  },
  introF: {
    fontWeight: '900',
    fontSize: 44,
  },
  introTagline: {
    marginTop: 56,   // enough space so it's below the stacked title
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 5,
    textTransform: 'uppercase',
  },

  // ── Slides ──
  wrap: {
    flex: 1,
  },
  slidePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // vertically centered
    paddingHorizontal: 32,
    paddingBottom: 20,       // small breathing room above footer
  },
  tag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 24,
    textAlign: 'center',
  },
  iconRow: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 17,   // 17+ as requested
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
    fontWeight: '400',
  },

  // ── Footer ──
  footer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  btnWrap: {
    width: width * 0.72,
    maxWidth: 360,
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  btn: {
    paddingVertical: 17,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Custom arrow (replacing emoji →)
  arrowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 20,
  },
  arrowLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'rgba(255,255,255,0.85)',
  },
});

export default OnboardingScreen;
