import { Platform, NativeModules, DeviceEventEmitter } from 'react-native';
import i18n from '@/i18n';
import * as Application from 'expo-application';

// Event name for language changes
export const LANGUAGE_CHANGE_EVENT = 'i18n:languageChanged';

/**
 * Updates the app name based on the current language
 * This function uses different methods for iOS and Android
 */
export const updateAppName = async (): Promise<void> => {
  try {
    const appName = i18n.t('appName');

    if (Platform.OS === 'ios') {
      // For iOS, we need to use the CFBundleDisplayName
      if (NativeModules.ExpoConstants) {
        // This is a workaround as we can't directly change the app name at runtime on iOS
        // We can only update what's shown in certain places like the app settings
        console.log(`iOS app name would be set to: ${appName}`);
      }
    } else if (Platform.OS === 'android') {
      // For Android, we can use the Application module from expo-application
      // Note: setAndroidApplicationLabel is not available in the current version
      // This is a placeholder for when it becomes available
      console.log(`Android app name would be set to: ${appName}`);
    }
  } catch (error) {
    console.error('Error updating app name:', error);
  }
};

/**
 * Gets the current app name based on the selected language
 */
export const getLocalizedAppName = (): string => {
  return i18n.t('appName');
};

// Set up a listener for language changes
if (typeof global.addEventListener === 'function') {
  global.addEventListener('i18n:languageChanged', () => {
    updateAppName();
  });
}
