import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * GlareHover - React Native implementation of the Glare/Shine effect.
 * Works on Web (hover) and Mobile (press).
 */
const GlareHover = ({
  borderRadius = 16,
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.4,
  glareAngle = -45,
  transitionDuration = 800,
  onPress,
  onPressIn,
  onPressOut,
  style = {},
  containerStyle = {}
}) => {
  const glareAnim = useRef(new Animated.Value(0)).current;
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const startGlare = () => {
    glareAnim.setValue(0);
    Animated.timing(glareAnim, {
      toValue: 1,
      duration: transitionDuration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    startGlare();
    if (onPressIn) onPressIn();
  };

  const handlePressOut = () => {
    if (onPressOut) onPressOut();
  };

  // Calculate rotation from angle
  const rotation = `${glareAngle}deg`;

  // Interpolate position
  const translateX = glareAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-layout.width * 2, layout.width * 2],
  });

  const glareColorRGBA = glareColor.startsWith('rgba') 
    ? glareColor 
    : `${glareColor}${Math.floor(glareOpacity * 255).toString(16).padStart(2, '0')}`;

  return (
    <View 
      onLayout={onLayout}
      style={[
        styles.container, 
        { borderRadius, overflow: 'hidden' }, 
        containerStyle,
        style
      ]}
    >
      <Pressable
        onHoverIn={Platform.OS === 'web' ? startGlare : undefined}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          { flex: 1 },
          style
        ]}
      >
        {children}
        
        {/* Animated Glare Streak */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              pointerEvents: 'none',
              transform: [
                { translateX },
                { rotate: rotation },
                { scale: 3 } 
              ],
              opacity: glareAnim.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 1, 0]
              })
            }
          ]}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(255,255,255,0)',
                glareColorRGBA,
                'rgba(255,255,255,0)',
                'transparent'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.glareGradient}
            />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glareGradient: {
    flex: 1,
    width: '30%', // Focused streak
    alignSelf: 'center',
  }
});

export default GlareHover;
