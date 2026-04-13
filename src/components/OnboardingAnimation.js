import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const iconMap = {
  'food-loading': 'chef-hat',
  'delivery': 'motorbike',
  'success': 'ticket-percent',
};

export default function OnboardingAnimation({ name, style }) {
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -20, duration: 1500, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const iconName = iconMap[name] || 'silverware';

  return (
    <View style={[style, styles.container]}>
      {/* ── Glow Stack (Icon Layering) ── */}
      <Animated.View style={[
        styles.iconWrapper,
        { 
          transform: [
            { translateY: floatAnim }, 
            { scale: bounceAnim },
            { rotate: spin }
          ] 
        }
      ]}>
        {/* Glow Layer 1 (Outer Aura) */}
        <Animated.View style={[styles.glowLayer, { opacity: 0.12, transform: [{ scale: 1.5 }] }]}>
          <MaterialCommunityIcons name={iconName} size={95} color="#FFB347" />
        </Animated.View>
        
        {/* Glow Layer 2 (Inner Shine) */}
        <Animated.View style={[styles.glowLayer, { opacity: 0.25, transform: [{ scale: 1.25 }] }]}>
          <MaterialCommunityIcons name={iconName} size={88} color="#FF8C00" />
        </Animated.View>

        {/* Main Icon (Top Layer) */}
        <MaterialCommunityIcons 
          name={iconName} 
          size={82} 
          color="#FF6347" 
          style={styles.mainIcon}
        />
      </Animated.View>

      <Animated.View style={[
        styles.shadow,
        {
          opacity: floatAnim.interpolate({
            inputRange: [-20, 0],
            outputRange: [0.03, 0.1],
          }),
          transform: [{ scale: floatAnim.interpolate({
            inputRange: [-20, 0],
            outputRange: [0.6, 1.2],
          }) }]
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    zIndex: 2,
  },
  glowLayer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    zIndex: 5,
    textShadowColor: 'rgba(255, 99, 71, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  shadow: {
    position: 'absolute',
    bottom: -25,
    width: 110,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#000',
  }
});