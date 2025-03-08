import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { lightColors, useTheme } from '@/hooks/useTheme';

export default function LoadingScreen() {
  // Try to use the theme, but fallback to light theme colors if context is not available yet
  let themeColors;
  try {
    const { colors } = useTheme();
    themeColors = colors;
  } catch (error) {
    // Fallback to light theme if theme context is not available
    themeColors = lightColors;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      color: themeColors.primary,
      fontFamily: 'Poppins-Bold',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: '#a0a0a0',
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
    },
  });

  return (
    <Animated.View style={styles.container} exiting={FadeOut.duration(200)}>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Taki Academy Calculator</Text>
      <Text style={styles.subtitle}>Made with ❤️ by Taki Academy</Text>
    </Animated.View>
  );
}
