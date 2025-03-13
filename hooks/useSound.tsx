import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FeedbackTypes = 'success' | 'error' | 'warning' | 'input';

interface UseFeedbackResult {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setVibrationEnabled: (enabled: boolean) => Promise<void>;
  playFeedback: (type: FeedbackTypes) => void;
}

export function useFeedback(): UseFeedbackResult {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState<boolean>(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('calculatorSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setSoundEnabledState(
          parsedSettings.soundEnabled !== undefined
            ? parsedSettings.soundEnabled
            : true
        );
        setVibrationEnabledState(
          parsedSettings.vibrationEnabled !== undefined
            ? parsedSettings.vibrationEnabled
            : true
        );
      }
    } catch (error) {
      console.error('Failed to load feedback settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      // Get current settings
      const settingsStr = await AsyncStorage.getItem('calculatorSettings');
      const settings = settingsStr ? JSON.parse(settingsStr) : {};

      // Update with new feedback settings
      settings.soundEnabled = soundEnabled;
      settings.vibrationEnabled = vibrationEnabled;

      // Save back to AsyncStorage
      await AsyncStorage.setItem(
        'calculatorSettings',
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save feedback settings:', error);
    }
  };

  // Helper function to update sound setting
  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    // After state update, save the settings
    setTimeout(() => {
      saveSettings();
    }, 0);
  };

  // Helper function to update vibration setting
  const setVibrationEnabled = async (enabled: boolean) => {
    setVibrationEnabledState(enabled);
    // After state update, save the settings
    setTimeout(() => {
      saveSettings();
    }, 0);
  };

  // Play feedback based on the type and enabled settings
  const playFeedback = (type: FeedbackTypes) => {
    if (vibrationEnabled) {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'input':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    if (soundEnabled) {
      // Sound implementation can be added here when needed
      // For now, we'll just use vibration
    }
  };

  return {
    soundEnabled,
    vibrationEnabled,
    setSoundEnabled,
    setVibrationEnabled,
    playFeedback,
  };
}
