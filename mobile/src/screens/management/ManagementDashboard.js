import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchSessions } from '../../redux/slices/sessionSlice';
import { spacing, theme } from '../../constants/theme';

const ManagementDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const sessions = useSelector((state) => state.sessions?.sessions || []);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchSessions());
    } catch (error) {
      console.log('Error fetching sessions:', error);
    }
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const stats = React.useMemo(() => [
    {
      label: 'Total Sessions',
      value: Array.isArray(sessions) ? sessions.length : 0,
      icon: 'calendar-check',
      color: '#2196F3',
    },
    {
      label: 'High Severity',
      value: Array.isArray(sessions) ? sessions.filter((s) => s?.severity === 'high').length : 0,
      icon: 'alert-circle',
      color: '#F44336',
    },
    {
      label: 'This Month',
      value: Array.isArray(sessions) ? sessions.filter((s) => {
        try {
          const sessionDate = new Date(s?.date);
          const now = new Date();
          return (
            sessionDate.getMonth() === now.getMonth() &&
            sessionDate.getFullYear() === now.getFullYear()
          );
        } catch {
          return false;
        }
      }).length : 0,
      icon: 'calendar-month',
      color: '#4CAF50',
    },
  ], [sessions]);

  const analytics = [
    {
      title: 'Department Analytics',
      subtitle: 'View session distribution by department',
      icon: 'office-building',
      screen: 'DepartmentAnalytics',
      color: '#2196F3',
    },
    {
      title: 'Year Analytics',
      subtitle: 'Analyze data by academic year',
      icon: 'school',
      screen: 'YearAnalytics',
      color: '#4CAF50',
    },
    {
      title: 'Severity Analysis',
      subtitle: 'Track severity trends',
      icon: 'chart-line',
      screen: 'SeverityAnalytics',
      color: '#FF9800',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeEmoji}>📊</Text>
                <View>
                  <Text style={styles.welcomeGreeting}>Welcome,</Text>
                  <Text style={styles.welcomeName}>{user?.name || 'Manager'}!</Text>
                </View>
              </View>
              <Chip
                icon="shield-check"
                mode="flat"
                style={{ backgroundColor: '#6200EE20' }}
                textStyle={{ color: '#6200EE' }}
              >
                Management
              </Chip>
            </View>
            <Text style={styles.welcomeSubtitle}>Privacy-first insights and analytics</Text>
          </Card.Content>
        </Card>

        {/* Stats */}
        <View style={styles.stats}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Icon name={stat.icon} size={32} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Analytics */}
        <Text style={styles.sectionTitle}>Analytics Reports</Text>
        {analytics.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
            <Card style={styles.analyticsCard}>
              <Card.Content style={styles.analyticsContent}>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                  <Icon name={item.icon} size={28} color={item.color} />
                </View>
                <View style={styles.analyticsText}>
                  <Text style={styles.analyticsTitle}>{item.title}</Text>
                  <Text style={styles.analyticsSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={theme.colors.disabled} />
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  welcomeCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  welcomeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginTop: 2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  analyticsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  analyticsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyticsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default ManagementDashboard;
