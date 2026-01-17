import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Chip, Button, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyAppointments } from '../../redux/slices/appointmentSlice';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';

const CounsellorDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments = [] } = useSelector((state) => state.appointments || {});
  const { sessions = [] } = useSelector((state) => state.sessions || {});
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const [refreshing, setRefreshing] = React.useState(false);
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [checkInTime, setCheckInTime] = React.useState(null);
  const [dailyQuote, setDailyQuote] = React.useState('Your dedication makes a difference. Keep inspiring hope.');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const todayAppointments = safeAppointments.filter(
    (apt) =>
      apt.status === 'scheduled' &&
      new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  );

  const weekSessions = safeSessions.filter((session) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(session.date) >= weekAgo;
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchMyAppointments()), dispatch(fetchSessions())]);
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
    // Animate on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch daily quote
    const fetchDailyQuote = async () => {
      try {
        const response = await fetch('https://zenquotes.io/api/today');
        const data = await response.json();
        if (data && data[0]) {
          setDailyQuote(data[0].q + ' - ' + data[0].a);
        }
      } catch (error) {
        // Use fallback quotes
        const fallbackQuotes = [
          'Your compassion changes lives. Keep making a difference. 💙',
          'Every conversation you have plants seeds of hope. 🌱',
          'You are a beacon of light in someone\'s darkest moment. ✨',
          'Your patience and understanding create safe spaces for healing. 🤗',
          'Thank you for being a guide through life\'s challenges. 🌟',
        ];
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        setDailyQuote(randomQuote);
      }
    };
    fetchDailyQuote();

    // Check if already checked in today
    const checkStoredCheckIn = async () => {
      try {
        const savedCheckIn = await AsyncStorage.getItem('checkInDate');
        const savedTime = await AsyncStorage.getItem('checkInTime');
        const today = new Date().toDateString();
        if (savedCheckIn === today && savedTime) {
          setCheckedIn(true);
          setCheckInTime(savedTime);
        }
      } catch (error) {
        console.log('Error loading check-in state:', error);
      }
    };
    checkStoredCheckIn();
  }, []);

  const handleCheckIn = async () => {
    const now = new Date();
    const today = now.toDateString();
    const time = now.toLocaleTimeString();

    try {
      await AsyncStorage.setItem('checkInDate', today);
      await AsyncStorage.setItem('checkInTime', time);

      setCheckedIn(true);
      setCheckInTime(time);

      Alert.alert('✅ Checked In', `You are now marked as available from ${time}`, [
        { text: 'OK' }
      ]);
    } catch (error) {
      console.log('Error saving check-in:', error);
      Alert.alert('Error', 'Failed to save check-in state');
    }
  };

  const stats = [
    { label: 'Today', value: todayAppointments.length, icon: 'calendar-today', color: '#2196F3' },
    {
      label: 'This Week',
      value: weekSessions.length,
      icon: 'calendar-week',
      color: '#4CAF50',
    },
    {
      label: 'Pending',
      value: safeAppointments.filter((a) => a.status === 'scheduled').length,
      icon: 'clock-outline',
      color: '#FF9800',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || 'Counsellor'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: user?.isActive ? '#FF9800' : '#4CAF50' }]} />
            <Text style={styles.statusText}>{user?.isActive ? 'In Session' : 'Available'}</Text>
          </View>
        </View>

        {/* Daily Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.dailyQuote}>{dailyQuote}</Text>
        </View>

        {/* Check-In Section */}
        {!checkedIn ? (
          <View style={styles.checkInSection}>
            <View style={styles.checkInHeader}>
              <Icon name="clock-check-outline" size={24} color="#F5A962" />
              <Text style={styles.checkInTitle}>Daily Check-In Required</Text>
            </View>
            <Text style={styles.checkInSubtitle}>
              Mark yourself available for today's sessions
            </Text>
            <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
              <Text style={styles.checkInButtonText}>Check In Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.checkedInSection}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <View style={styles.checkedInInfo}>
              <Text style={styles.checkedInTitle}>Checked In</Text>
              <Text style={styles.checkedInTime}>Since {checkInTime}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkOutButton}
              onPress={async () => {
                try {
                  await AsyncStorage.removeItem('checkInDate');
                  await AsyncStorage.removeItem('checkInTime');
                  setCheckedIn(false);
                  setCheckInTime('');
                  Alert.alert('✓ Checked Out', 'You have been marked as unavailable');
                } catch (error) {
                  Alert.alert('Error', 'Failed to check out');
                }
              }}
            >
              <Text style={styles.checkOutButtonText}>Check Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, (!checkedIn && !user?.isActive) && styles.actionCardDisabled]}
              onPress={() => {
                if (user?.isActive) {
                  navigation.navigate('QRScanner', { mode: 'checkout', sessionId: user?.currentSessionId });
                } else {
                  if (!checkedIn) {
                    Alert.alert('Daily Check-In Required', 'Please check in for the day before starting a session');
                    return;
                  }
                  navigation.navigate('QRScanner', { mode: 'checkin' });
                }
              }}
              disabled={!checkedIn && !user?.isActive}
            >
              <Icon
                name={user?.isActive ? "qrcode-remove" : "qrcode-scan"}
                size={32}
                color={user?.isActive ? '#FF5722' : (checkedIn ? '#F5A962' : '#CCCCCC')}
              />
              <Text style={[styles.actionText, (!checkedIn && !user?.isActive) && styles.actionTextDisabled]}>
                {user?.isActive ? 'End Session' : 'Start Session'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Icon name="calendar-clock" size={32} color="#5B9BD5" />
              <Text style={styles.actionText}>Appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Availability')}
            >
              <Icon name="calendar-plus" size={32} color="#4CAF50" />
              <Text style={styles.actionText}>Manage Slots</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('StudentHistory')}
            >
              <Icon name="history" size={32} color="#B8A8D8" />
              <Text style={styles.actionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          {todayAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="calendar-blank" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No appointments scheduled for today</Text>
            </View>
          ) : (
            todayAppointments.map((apt) => (
              <View key={apt._id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentStudent}>
                      {apt.student?.anonymousUsername || 'Student'}
                    </Text>
                    <Text style={styles.appointmentTime}>{apt.time}</Text>
                  </View>
                  <View style={styles.appointmentBadge}>
                    <Text style={styles.appointmentType}>{apt.type}</Text>
                  </View>
                </View>
                <Text style={styles.appointmentReason} numberOfLines={2}>
                  {apt.reason}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
    letterSpacing: 0.15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  quoteContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFF4EC',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
  },
  dailyQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#555555',
    lineHeight: 22,
    fontWeight: '400',
  },
  checkInSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#FFF4EC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5A962',
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.15,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: spacing.md,
    fontWeight: '400',
  },
  checkInButton: {
    backgroundColor: '#F5A962',
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  checkedInSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#F1F8F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkedInInfo: {
    flex: 1,
  },
  checkedInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  checkedInTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    fontWeight: '400',
  },
  checkOutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  checkOutButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 100,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginTop: spacing.sm,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: spacing.xs,
    fontWeight: '400',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.md,
    letterSpacing: 0.15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: 110,
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionText: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  actionTextDisabled: {
    color: '#CCCCCC',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyText: {
    marginTop: spacing.md,
    color: '#999999',
    fontSize: 14,
    fontWeight: '400',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentStudent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#F5A962',
    marginTop: 4,
    fontWeight: '500',
  },
  appointmentBadge: {
    backgroundColor: '#F3F0FF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  appointmentType: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  appointmentReason: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default CounsellorDashboard;
