// src/screens/OnboardingScreen.js
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import OnboardingAnimation from '../components/OnboardingAnimation';
import { darkTheme, lightTheme } from '../config/theme';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Pesan Makanan Favoritmu',
    subtitle: 'KUALITAS BINTANG LIMA',
    description: 'Temukan berbagai macam menu lezat dari restoran terbaik di sekitarmu dengan mudah dan cepat.',
    animationKey: 'food-loading',
  },
  {
    id: '2',
    title: 'Pengiriman Super Cepat',
    subtitle: 'SAMPAI DALAM 30 MENIT',
    description: 'Kurir kami siap mengantarkan pesananmu dengan teknologi pelacakan real-time. Hangat sampai tujuan!',
    animationKey: 'delivery',
  },
  {
    id: '3',
    title: 'Promo Exclusive',
    subtitle: 'HEMAT SETIAP HARI',
    description: 'Dapatkan diskon dan promo menarik setiap harinya khusus untuk Sobat Kuliner FoodsStreets.',
    animationKey: 'success',
  }
];

const OnboardingScreen = ({ onFinish }) => {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const smokeAnim = useRef(new Animated.Value(1)).current;

  const goToNext = () => {
    // Stage 1: Transition Out (Slide Up + Fade out + Smoke)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -100, duration: 400, useNativeDriver: true }),
      Animated.timing(smokeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1);
        slideAnim.setValue(100); // Start from bottom
        
        // Stage 2: Transition In (Sailing Up)
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
          Animated.timing(smokeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start();
      } else {
        onFinish();
      }
    });
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDarkMode ? ['#000', '#1a1a1a'] : ['#f8f9fa', '#fff']}
        style={StyleSheet.absoluteFill}
      />

      {/* Slide Content */}
      <Animated.View style={[
        styles.slideContainer, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <OnboardingAnimation
          name={currentSlide.animationKey}
          style={styles.animation}
        />
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.subtitle, { 
            opacity: smokeAnim, 
            transform: [{ translateY: smokeAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }]
          }]}>
            {currentSlide.subtitle}
          </Animated.Text>
          <Animated.Text style={[styles.title, { 
            color: theme.text,
            opacity: smokeAnim,
            transform: [{ translateY: smokeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
          }]}>
            {currentSlide.title}
          </Animated.Text>
          <Animated.Text style={[styles.description, { 
            color: theme.textSecondary,
            opacity: smokeAnim,
            transform: [{ translateY: smokeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
          }]}>
            {currentSlide.description}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? '#FF6347' : 'rgba(128,128,128,0.2)',
                  width: i === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={goToNext}
          style={styles.buttonWrapper}
        >
          <LinearGradient
            colors={['#FFB347', '#FF6347']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjutkan'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: height * 0.12, // Menarik konten lebih ke atas
  },
  animation: {
    width: width * 0.75,
    height: width * 0.75,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6347',
    letterSpacing: 4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontWeight: '900',
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
    paddingHorizontal: 10,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  buttonWrapper: {
    width: width * 0.65,
    maxWidth: 320,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  button: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default OnboardingScreen;
