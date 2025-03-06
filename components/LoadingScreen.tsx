import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

export default function LoadingScreen() {
  return (
    <Animated.View style={styles.container} exiting={FadeOut.duration(200)}>
      <Image
        source={require('../assets/images/logo.svg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Taki Academy Calculator</Text>
      <Text style={styles.subtitle}>Made with ❤️ by Taki Academy</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#35bbe3',
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
