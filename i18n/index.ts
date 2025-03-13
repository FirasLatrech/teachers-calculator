import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DeviceEventEmitter } from 'react-native';

import en from './locales/en';
import fr from './locales/fr';
import ar from './locales/ar';
import { LANGUAGE_CHANGE_EVENT } from '@/utils/appName';

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    en,
    fr,
    ar,
  },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

// Add a language change listener to update the app name
i18n.on('languageChanged', () => {
  // Emit an event that can be listened to by other parts of the app
  DeviceEventEmitter.emit(LANGUAGE_CHANGE_EVENT);
});

export default i18n;
