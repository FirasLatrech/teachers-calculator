import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Class } from './types';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  operationsCount: number;
  selectedClass: Class | null;
  historyLength: number;
  onSaveSession: () => void;
  onOpenClassModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  operationsCount,
  selectedClass,
  historyLength,
  onSaveSession,
  onOpenClassModal,
}) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [maxTextLength, setMaxTextLength] = useState(16);
  const screenWidth = Dimensions.get('window').width;

  // Dynamically adjust text length based on screen width
  useEffect(() => {
    // Base length for medium-sized screens
    let baseLength = 16;

    if (screenWidth < 360) {
      // Small screens
      baseLength = 10;
    } else if (screenWidth >= 768) {
      // Larger screens like tablets
      baseLength = 24;
    }

    setMaxTextLength(baseLength);
  }, [screenWidth]);

  // Function to truncate text if needed
  const truncateText = (text: string) => {
    if (text.length > maxTextLength) {
      return text.slice(0, maxTextLength) + '...';
    }
    return text;
  };

  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.headerBackground,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    logo: {
      height: 60,
      justifyContent: 'center',
    },
    logoImage: {
      width: 60,
      height: 60,
      resizeMode: 'contain',
    },
    registerButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    disabledButton: {
      backgroundColor: '#cccccc',
      opacity: 0.6,
    },
    registerText: {
      color: '#ffffff',
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    operationsCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
    },
    operationsCountText: {
      color: colors.primary,
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
    classButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    classButtonText: {
      color: '#ffffff',
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>
          <Image
            source={require('../../assets/images/splash.png')}
            alt="logo"
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.operationsCountContainer}>
            <Text style={styles.operationsCountText}>
              {t('calculator.clicks')}: {operationsCount}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.classButton}
            onPress={onOpenClassModal}
          >
            <Text style={styles.classButtonText}>
              {selectedClass
                ? truncateText(selectedClass.name)
                : truncateText(t('calculator.selectClass'))}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.registerButton,
              historyLength === 0 && styles.disabledButton,
            ]}
            onPress={onSaveSession}
            disabled={historyLength === 0}
          >
            <Text style={styles.registerText}>{t('calculator.register')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Header;
