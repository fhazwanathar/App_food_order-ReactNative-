import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Easing, 
  Dimensions, 
  TouchableOpacity, 
  Linking,
  Text 
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LogoLoopNative = ({
  logos,
  speed = 100, // Speed in pixels per second
  direction = 'left',
  logoHeight = 40,
  gap = 40,
  ariaLabel = 'Partner logos',
  style = {}
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);

  // Measure the width of a single set of logos
  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && contentWidth === 0) {
      setContentWidth(width);
    }
  };

  useEffect(() => {
    if (contentWidth > 0) {
      const duration = (contentWidth / speed) * 1000;
      
      const startAnimation = () => {
        animatedValue.setValue(0);
        Animated.timing(animatedValue, {
          toValue: -contentWidth,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            startAnimation();
          }
        });
      };

      startAnimation();
    }
    return () => animatedValue.stopAnimation();
  }, [contentWidth, speed]);

  const renderItem = (item, index) => {
    const content = 'node' in item ? (
      <View style={{ height: logoHeight, justifyContent: 'center' }}>
        {item.node}
      </View>
    ) : (
      <View style={{ height: logoHeight, width: logoHeight * 1.5, justifyContent: 'center' }}>
        {/* Fallback for images if needed, but in Profile we use icons */}
        <Text style={{ fontSize: 10 }}>Logo</Text>
      </View>
    );

    return (
      <TouchableOpacity 
        key={index} 
        onPress={() => item.href && Linking.openURL(item.href)}
        style={[styles.item, { marginRight: gap }]}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]} accessibilityLabel={ariaLabel}>
      <Animated.View 
        style={[
          styles.track, 
          { transform: [{ translateX: animatedValue }] }
        ]}
      >
        {/* Original items */}
        <View style={styles.list} onLayout={onLayout}>
          {logos.map((logo, i) => renderItem(logo, i))}
        </View>
        {/* Duplicate items for seamless loop */}
        <View style={styles.list}>
          {logos.map((logo, i) => renderItem(logo, `duplicate-${i}`))}
        </View>
        {/* Triplicate items to ensure screen coverage */}
        <View style={styles.list}>
          {logos.map((logo, i) => renderItem(logo, `triplicate-${i}`))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    height: 60,
    justifyContent: 'center',
  },
  track: {
    flexDirection: 'row',
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default LogoLoopNative;
