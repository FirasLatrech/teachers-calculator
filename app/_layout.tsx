import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import LoadingScreen from '../components/LoadingScreen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import '../i18n';
import { ButtonConfigProvider } from '@/hooks/useButtonConfig';
import { View, DeviceEventEmitter } from 'react-native';
import { updateAppName, LANGUAGE_CHANGE_EVENT } from '@/utils/appName';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Separate component for the app content to be able to use the useTheme hook inside
function AppContent() {
  const { theme, isDarkMode, colors } = useTheme();
  const [showLoading, setShowLoading] = useState(true);
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Show loading screen for 2ms
      setTimeout(() => {
        setShowLoading(false);
      }, 2000);
    }
  }, [loaded]);

  useEffect(() => {
    // Set the app name based on the current language when the app starts
    updateAppName();

    // Listen for language changes
    const subscription = DeviceEventEmitter.addListener(
      LANGUAGE_CHANGE_EVENT,
      () => {
        // Update the app name when the language changes
        updateAppName();
      }
    );

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded && !error) {
    return null;
  }

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const isReady = useFrameworkReady();

  if (!isReady) {
    // Return a placeholder View instead of the SplashScreen component
    return <View style={{ flex: 1 }} />;
  }

  return (
    <ThemeProvider>
      <ButtonConfigProvider>
        <AppContent />
      </ButtonConfigProvider>
    </ThemeProvider>
  );
}
