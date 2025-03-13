import { useColorScheme } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';

// Define color palette
export const lightColors = {
  background: '#ffffff',
  text: '#333333',
  primary: '#35bbe3',
  secondary: '#4ade80',
  border: '#f0f0f0',
  card: '#f8f9fa',
  danger: '#ff6b6b',
  success: '#34C759',
  tabBar: '#ffffff',
  headerBackground: '#ffffff',
  inputBackground: '#f0f0f0',
};

export const darkColors = {
  background: '#121212',
  text: '#f5f5f5',
  primary: '#35bbe3',
  secondary: '#4ade80',
  border: '#2a2a2a',
  card: '#1e1e1e',
  danger: '#ff6b6b',
  success: '#30D158',
  tabBar: '#1a1a1a',
  headerBackground: '#1a1a1a',
  inputBackground: '#2a2a2a',
};

export type ColorTheme = typeof lightColors;

// Create a context for the theme
type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  colors: ColorTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create the ThemeProvider component
export const ThemeProvider = (props: {children: React.ReactNode}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [colors, setColors] = useState<ColorTheme>(lightColors);

  // Initialize theme on component mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Update colors when theme or system theme changes
  useEffect(() => {
    const effectiveDarkMode =
      theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

    setColors(effectiveDarkMode ? darkColors : lightColors);
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isDarkMode =
    theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  const value = {
    theme,
    setTheme,
    isDarkMode,
    colors,
  };

  // Use React.createElement instead of JSX
  return React.createElement(
    ThemeContext.Provider,
    { value },
    props.children
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
