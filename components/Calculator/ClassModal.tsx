import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, RotateCcw, Edit, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Class } from './types';

interface ClassModalProps {
  visible: boolean;
  onClose: () => void;
  classes: Class[];
  selectedClass: Class | null;
  onSelectClass: (cls: Class) => void;
  onAddClass: (name: string) => void;
  onUpdateClass: (id: string, name: string) => void;
  onDeleteClass: (id: string) => void;
  onRefreshClasses: () => Promise<void>;
}

const ClassModal: React.FC<ClassModalProps> = ({
  visible,
  onClose,
  classes,
  selectedClass,
  onSelectClass,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onRefreshClasses,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [classNameInput, setClassNameInput] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset input when modal is opened
  useEffect(() => {
    if (visible) {
      setClassNameInput('');
      setEditingClassId(null);
    }
  }, [visible]);

  const handleAddOrUpdateClass = () => {
    if (!classNameInput.trim()) {
      Alert.alert(
        t('calculator.alerts.noClassName.title') || 'No Class Name',
        t('calculator.alerts.noClassName.message') ||
          'Please enter a class name'
      );
      return;
    }

    if (editingClassId) {
      onUpdateClass(editingClassId, classNameInput.trim());
    } else {
      onAddClass(classNameInput.trim());
    }

    setClassNameInput('');
    setEditingClassId(null);
  };

  const startEditClass = (cls: Class) => {
    setEditingClassId(cls.id);
    setClassNameInput(cls.name);
  };

  const cancelClassEdit = () => {
    setEditingClassId(null);
    setClassNameInput('');
  };

  const refreshClasses = async () => {
    setIsRefreshing(true);
    await onRefreshClasses();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 16,
      width: '95%',
      maxHeight: '90%',
      height: 380,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 10,
    },
    modalTitle: {
      color: colors.primary,
      fontSize: 20,
      fontFamily: 'Poppins-Bold',
    },
    closeButton: {
      padding: 8,
    },
    classInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    classInput: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      color: colors.text,
      marginRight: 8,
      minWidth: 150,
    },
    addClassButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.primary,
      minWidth: 80,
      alignItems: 'center',
    },
    addClassButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontFamily: 'Poppins-Medium',
    },
    cancelEditButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.danger,
      marginLeft: 8,
    },
    classesList: {
      flex: 1,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 8,
      minHeight: 150,
      maxHeight: 300,
    },
    classItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
    },
    classSelectButton: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 48,
    },
    selectedClassButton: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    selectedClassButtonText: {
      color: colors.primary,
      fontFamily: 'Poppins-Medium',
    },
    classActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    editClassButton: {
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 8,
      marginRight: 8,
    },
    deleteClassButton: {
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    noClassesText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
      padding: 20,
    },
    classSelectButtonText: {
      color: colors.text,
      fontSize: 16,
      fontFamily: 'Poppins-Regular',
      flex: 1,
    },
    sectionTitle: {
      color: colors.primary,
      fontSize: 18,
      fontFamily: 'Poppins-Medium',
      marginBottom: 10,
    },
    selectedIndicator: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    selectedIndicatorText: {
      color: '#ffffff',
      fontSize: 14,
      fontFamily: 'Poppins-Bold',
    },
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    refreshButton: {
      padding: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    refreshingButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    emptyClassesListContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 150,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('calculator.classModal.title')}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Class Input Section */}
          <View style={styles.classInputContainer}>
            <TextInput
              style={styles.classInput}
              placeholder={t('calculator.classModal.placeholder')}
              value={classNameInput}
              onChangeText={setClassNameInput}
              placeholderTextColor={colors.secondary}
            />
            <TouchableOpacity
              style={styles.addClassButton}
              onPress={handleAddOrUpdateClass}
            >
              <Text style={styles.addClassButtonText}>
                {editingClassId
                  ? t('calculator.classModal.update')
                  : t('calculator.classModal.add')}
              </Text>
            </TouchableOpacity>
            {editingClassId && (
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={cancelClassEdit}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Class List Section */}
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionTitle}>
              {t('calculator.classModal.yourClasses')} ({classes.length})
            </Text>
            <TouchableOpacity
              style={[
                styles.refreshButton,
                isRefreshing && styles.refreshingButton,
              ]}
              onPress={refreshClasses}
              disabled={isRefreshing}
            >
              <RotateCcw
                size={18}
                color={isRefreshing ? colors.background : colors.primary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.classesList}
            contentContainerStyle={
              classes.length === 0 ? styles.emptyClassesListContent : undefined
            }
          >
            {classes.length === 0 ? (
              <Text style={styles.noClassesText}>
                {t('calculator.classModal.noClasses')}
              </Text>
            ) : (
              classes.map((cls) => (
                <View key={cls.id} style={styles.classItem}>
                  <TouchableOpacity
                    style={[
                      styles.classSelectButton,
                      selectedClass?.id === cls.id &&
                        styles.selectedClassButton,
                    ]}
                    onPress={() => onSelectClass(cls)}
                  >
                    <Text
                      style={[
                        styles.classSelectButtonText,
                        selectedClass?.id === cls.id &&
                          styles.selectedClassButtonText,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {cls.name}
                    </Text>
                    {selectedClass?.id === cls.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedIndicatorText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.classActions}>
                    <TouchableOpacity
                      style={styles.editClassButton}
                      onPress={() => startEditClass(cls)}
                    >
                      <Edit size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteClassButton}
                      onPress={() => onDeleteClass(cls.id)}
                    >
                      <Trash2 size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ClassModal;
