import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { useButtonConfig, ButtonConfig } from '@/hooks/useButtonConfig';
import {
  ArrowUp,
  ArrowDown,
  RotateCcw,
  MoveVertical,
  ToggleRight,
  Minus,
  Plus,
} from 'lucide-react-native';

export default function ButtonConfigurationScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    buttonConfig,
    toggleButton,
    moveButtonUp,
    moveButtonDown,
    resetToDefaults,
  } = useButtonConfig();

  const [reorderMode, setReorderMode] = useState(false);
  // Animation value for sliding between modes
  const [slideAnimation] = useState(new Animated.Value(0));

  // Toggle between modes with animation
  const toggleReorderMode = () => {
    const toValue = reorderMode ? 0 : 1;

    Animated.timing(slideAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setReorderMode(!reorderMode);
  };

  // Handler for resetting button configuration
  const handleResetConfig = () => {
    Alert.alert(
      t('settings.resetButtons.title') || 'Reset Buttons',
      t('settings.resetButtons.message') ||
        'Are you sure you want to reset button configuration to defaults?',
      [
        {
          text: t('settings.resetButtons.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('settings.resetButtons.confirm') || 'Reset',
          style: 'destructive',
          onPress: () => {
            resetToDefaults();
            if (reorderMode) {
              toggleReorderMode();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getButtonIcon = (id: string) => {
    switch (id) {
      case 'reset':
        return <RotateCcw size={20} color={colors.primary} />;
      case 'undo':
        return <ArrowUp size={20} color={colors.primary} />;
      case 'subtract':
        return <Minus size={20} color={colors.primary} />;
      case 'add':
        return <Plus size={20} color={colors.primary} />;
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
      textAlign: 'center',
      opacity: 0.8,
      lineHeight: 20,
      marginBottom: 16,
    },
    modeToggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    modeToggleOption: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      borderRadius: 10,
      zIndex: 1,
    },
    modeToggleText: {
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
      marginLeft: 6,
    },
    modeToggleHighlight: {
      position: 'absolute',
      height: '100%',
      width: '50%',
      backgroundColor: colors.primary,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonsContainer: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    buttonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    buttonInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    buttonName: {
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      color: colors.text,
    },
    orderControls: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    orderButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    disabledOrderButton: {
      opacity: 0.5,
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    resetButton: {
      backgroundColor: colors.danger,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
      marginLeft: 8,
    },
  });

  // Calculate animation properties
  const toggleLeft = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  const toggleActiveColor = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#fff'],
  });

  const toggleInactiveColor = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, colors.text],
  });

  // Render function for each button item
  const renderButtonItem = (item: ButtonConfig, index: number) => (
    <View key={item.id} style={styles.buttonItem}>
      <View style={styles.buttonInfo}>
        <View style={styles.buttonIconContainer}>{getButtonIcon(item.id)}</View>
        <Text style={styles.buttonName}>
          {t(`calculator.buttons.${item.id}`) || item.name}
        </Text>
      </View>

      {reorderMode ? (
        <View style={styles.orderControls}>
          <TouchableOpacity
            style={[
              styles.orderButton,
              index === 0 && styles.disabledOrderButton,
            ]}
            onPress={() => moveButtonUp(index)}
            disabled={index === 0}
            activeOpacity={0.7}
          >
            <ArrowUp size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.orderButton,
              index === buttonConfig.length - 1 && styles.disabledOrderButton,
            ]}
            onPress={() => moveButtonDown(index)}
            disabled={index === buttonConfig.length - 1}
            activeOpacity={0.7}
          >
            <ArrowDown size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <Switch
          value={item.enabled}
          onValueChange={() => toggleButton(item.id)}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor="#f4f3f4"
          ios_backgroundColor="#3e3e3e"
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('settings.buttonConfiguration') || 'Button Configuration'}
        </Text>
        <Text style={styles.description}>
          {t('settings.buttonConfigDescription') ||
            'Customize which buttons appear in your calculator and their order'}
        </Text>
      </View>

      {/* Toggle between modes */}
      <View style={styles.modeToggleContainer}>
        <Animated.View
          style={[
            styles.modeToggleHighlight,
            { transform: [{ translateX: toggleLeft }] },
          ]}
        />

        <TouchableOpacity
          style={styles.modeToggleOption}
          onPress={() => reorderMode && toggleReorderMode()}
          activeOpacity={0.7}
        >
          <ToggleRight size={18} color={reorderMode ? colors.text : '#fff'} />
          <Animated.Text
            style={[
              styles.modeToggleText,
              { color: reorderMode ? toggleInactiveColor : toggleActiveColor },
            ]}
          >
            {t('settings.toggleMode') || 'Toggle'}
          </Animated.Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeToggleOption}
          onPress={() => !reorderMode && toggleReorderMode()}
          activeOpacity={0.7}
        >
          <MoveVertical size={18} color={!reorderMode ? colors.text : '#fff'} />
          <Animated.Text
            style={[
              styles.modeToggleText,
              { color: !reorderMode ? toggleInactiveColor : toggleActiveColor },
            ]}
          >
            {t('settings.reorderMode') || 'Reorder'}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsContainer}>
        {buttonConfig
          .sort((a, b) => a.order - b.order)
          .map((button, index) => renderButtonItem(button, index))}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, styles.resetButton]}
        onPress={handleResetConfig}
        activeOpacity={0.7}
      >
        <RotateCcw size={20} color="#fff" />
        <Text style={styles.actionButtonText}>
          {t('settings.resetToDefaults') || 'Reset to Defaults'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
