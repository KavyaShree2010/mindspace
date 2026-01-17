import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchJournals, deleteJournal } from '../../redux/slices/journalSlice';
import { spacing, theme } from '../../constants/theme';

const JournalListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { journals = [] } = useSelector((state) => state.journals || {});
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    dispatch(fetchJournals());
  }, [dispatch]);

  const filteredJournals = (journals || []).filter((j) =>
    j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Journal',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteJournal(id)),
        },
      ]
    );
  };

  const renderJournal = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('JournalEditor', { journal: item })}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {new Date(item.date).toISOString().split('T')[0]}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('JournalEditor', { journal: item })}>
          <Icon name="square-edit-outline" size={20} color="#666666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
          <TouchableOpacity>
            <Icon name="filter-variant" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search journal entries..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredJournals}
          renderItem={renderJournal}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="book-open-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No journal entries yet</Text>
              <Text style={styles.emptySubtext}>Start writing to track your thoughts</Text>
            </View>
          }
        />
        <FAB
          style={styles.fab}
          icon="plus"
          color="#FFFFFF"
          onPress={() => navigation.navigate('JournalEditor')}
        />
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    padding: 0,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF4EC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999999',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  content: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
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
    letterSpacing: 0.2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 10,
    bottom: 10,
    backgroundColor: '#F5A962',
    borderRadius: 30,
  },
});

export default JournalListScreen;
