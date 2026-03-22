// src/components/NavBar.js
import React, { useRef } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// ---------------------------------------------------------------
// Item navigation yang menampilkan animasi skala
// ---------------------------------------------------------------
const NavItem = ({ name, lib, size = 24, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue) => {
    Animated.timing(scale, {
      toValue,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const pressIn = () => animate(1.5);
  const pressOut = () => animate(1);

  const IconComponent = {
    ion: Ionicons,
    mc: MaterialCommunityIcons,
    fa: FontAwesome5,
  }[lib];

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      {...(Platform.OS === 'web' && {
        onMouseEnter: pressIn,
        onMouseLeave: pressOut,
      })}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <IconComponent name={name} size={size} color="#fff" />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// ---------------------------------------------------------------
// NavBar utama
// ---------------------------------------------------------------
export default function NavBar({ navigation }) {
  const items = [
    {
      label: 'Home',
      lib: 'ion',
      name: Platform.OS === 'ios' ? 'home-outline' : 'home',
      route: 'Home',
    },
    {
      label: 'Cart',
      lib: 'fa',
      name: 'shopping-cart',
      route: 'Cart',
    },
    {
      label: 'Profile',
      lib: 'mc',
      name: 'account-circle-outline',
      route: 'Profile',
    },
    {
      label: 'Settings',
      lib: 'ion',
      name: Platform.OS === 'ios' ? 'settings-outline' : 'settings',
      route: 'Settings',
    },
  ];

  return (
    <View style={styles.container}>
      {items.map((it) => (
        <NavItem
          key={it.label}
          lib={it.lib}
          name={it.name}
          onPress={() => navigation?.navigate(it.route)}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------
// Styling
// ---------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#060010',
    paddingVertical: 12,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
    }),
  },
});
