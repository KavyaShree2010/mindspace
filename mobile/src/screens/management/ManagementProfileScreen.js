import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Avatar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../../redux/slices/authSlice';
import { spacing, theme } from '../../constants/theme';

const ManagementProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const profileSections = [
    {
      title: 'Role',
      value: 'Management',
      icon: 'shield-account',
    },
    {
      title: 'Email',
      value: user?.email || 'Not available',
      icon: 'email',
    },
    {
      title: 'Access Level',
      value: 'Analytics & Reports',
      icon: 'lock-open',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileHeader}>
            <Avatar.Icon
              size={80}
              icon="account-tie"
              style={styles.avatar}
            />
            <Text style={styles.name}>{user?.name || 'Manager'}</Text>
            <Text style={styles.role}>Management User</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            {profileSections.map((section, index) => (
              <View key={index}>
                <View style={styles.infoRow}>
                  <Icon name={section.icon} size={24} color={theme.colors.primary} />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>{section.title}</Text>
                    <Text style={styles.infoValue}>{section.value}</Text>
                  </View>
                </View>
                {index < profileSections.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Button
              mode="outlined"
              icon="bell"
              style={styles.settingButton}
              contentStyle={styles.buttonContent}
            >
              Notification Settings
            </Button>
            <Button
              mode="outlined"
              icon="shield-lock"
              style={styles.settingButton}
              contentStyle={styles.buttonContent}
            >
              Privacy Settings
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => dispatch(logout())}
          style={styles.logoutButton}
          icon="logout"
          buttonColor="#F44336"
        >
          Logout
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    backgroundColor: '#6200EE',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.md,
  },
  role: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  infoValue: {
    fontSize: 16,
    marginTop: 2,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  settingButton: {
    marginTop: spacing.sm,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
    justifyContent: 'flex-start',
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default ManagementProfileScreen;
