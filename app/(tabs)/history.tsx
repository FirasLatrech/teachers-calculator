import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, RefreshCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface HistoryItem {
  value: number;
  timestamp: number;
}

interface HistorySession {
  date: string;
  items: HistoryItem[];
  total: number;
}

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const handleFocus = () => {
      loadHistory();
    };

    const unsubscribe = navigation.addListener('focus', handleFocus);

    loadHistory();

    return unsubscribe;
  }, []);

  const loadHistory = async () => {
    try {
      setIsRefreshing(true);
      const savedSessions = await AsyncStorage.getItem('calculatorSessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        // Sort sessions by date in descending order (newest first)
        parsedSessions.sort(
          (a: HistorySession, b: HistorySession) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error(t('history.errors.loadFailed'), error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem('calculatorSessions');
      setSessions([]);
      Alert.alert(t('common.success'), t('history.alerts.cleared'));
    } catch (error) {
      console.error(t('history.errors.clearFailed'), error);
      Alert.alert(t('common.error'), t('history.alerts.clearError'));
    }
  };

  const confirmClearHistory = () => {
    Alert.alert(
      t('history.alerts.clearTitle'),
      t('history.alerts.clearConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: clearAllHistory,
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyItem}>
      <Text
        style={[
          styles.historyValue,
          item.value >= 0 ? styles.positiveValue : styles.negativeValue,
        ]}
      >
        {item.value >= 0 ? '+' : ''}
        {item.value.toFixed(2)}
      </Text>
      <Text style={styles.historyTime}>{formatDate(item.timestamp)}</Text>
    </View>
  );

  const renderSession = ({ item }: { item: HistorySession }) => (
    <View style={styles.sessionContainer}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{formatSessionDate(item.date)}</Text>
        <Text style={styles.sessionTotal}>
          {t('history.total')} : {item.total.toFixed(2)}
        </Text>
      </View>
      <FlatList
        data={item.items}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => `history-${item.timestamp}-${index}`}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyItemContainer}>
            <Text style={styles.emptyItemText}>
              {t('history.noOperations')}
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('history.title')}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={loadHistory} style={styles.headerButton}>
            <RefreshCw size={20} color="#4ade80" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmClearHistory}
            style={styles.headerButton}
          >
            <Trash2 size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('history.noHistory')}</Text>
          <Text style={styles.emptySubtext}>
            {t('history.sessionsWillAppear')}
          </Text>
          <Text style={styles.emptySubtext}>
            {t('history.pressRegisterButton')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item, index) => `session-${index}`}
          contentContainerStyle={styles.listContent}
          onRefresh={loadHistory}
          refreshing={isRefreshing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#47B5FF',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  sessionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sessionDate: {
    color: '#333333',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  sessionTotal: {
    color: '#47B5FF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  historyValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  positiveValue: {
    color: '#47B5FF',
  },
  negativeValue: {
    color: '#ff4747',
  },
  historyTime: {
    color: '#666666',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#333333',
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666666',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyItemContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyItemText: {
    color: '#666666',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
