import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';

const SessionHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { sessions = [], isLoading } = useSelector((state) => state.sessions || {});
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      await dispatch(fetchSessions()).unwrap();
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err?.message || 'Failed to load sessions');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  // Group sessions by date
  const groupedSessions = React.useMemo(() => {
    const groups = {};
    (sessions || []).forEach(session => {
      if (!session || !session.date) return;
      try {
        const date = new Date(session.date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(session);
      } catch (error) {
        console.error('Error parsing session date:', error);
      }
    });
    return groups;
  }, [sessions]);

  if (isLoading && (!sessions || sessions.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A962" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session History</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Error State */}
        {error ? (
          <View style={styles.emptyState}>
            <Icon name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.emptyText}>{error}</Text>
            <Text style={styles.emptySubtext}>Pull down to retry</Text>
          </View>
        ) : (!sessions || sessions.length === 0) ? (
          <View style={styles.emptyState}>
            <Icon name="history" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No session history</Text>
            <Text style={styles.emptySubtext}>
              Your counselling session history will appear here
            </Text>
          </View>
        ) : (
          Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <View key={date} style={styles.dateGroup}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <Icon name="calendar-blank" size={20} color="#666666" style={styles.dateIcon} />
                <Text style={styles.dateText}>{date}</Text>
              </View>

              {/* Sessions for this date */}
              {dateSessions.map((session, index) => (
                <TouchableOpacity
                  key={session._id || `session-${index}`}
                  style={styles.sessionCard}
                  onPress={() => {
                    if (session._id && navigation.navigate) {
                      try {
                        navigation.navigate('SessionDetails', { sessionId: session._id });
                      } catch (err) {
                        console.log('Navigation not available');
                      }
                    }
                  }}
                >
                  <View style={styles.avatar}>
                    <Icon name="account" size={28} color="#999999" />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.counsellorName}>
                      {session?.counsellor?.name || session?.counsellorName || 'Counsellor'}
                    </Text>
                    <Text style={styles.sessionType}>
                      {session?.type || 'Session'}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#CCCCCC" />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  dateGroup: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  counsellorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999999',
    marginTop: 15,
    letterSpacing: 0.2,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#CCCCCC',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default SessionHistoryScreen;