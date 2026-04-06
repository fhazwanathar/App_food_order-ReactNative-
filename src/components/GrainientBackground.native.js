import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GrainientBackground = ({ color1 = '#FF9FFC', color2 = '#5227FF', color3 = '#B19EEF' }) => {
  return (
    <LinearGradient
      colors={[color1, color2, color3]}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
};

export default GrainientBackground;
