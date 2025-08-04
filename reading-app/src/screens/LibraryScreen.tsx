import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { databaseService, Document, Collection } from '../services/DatabaseService';

const { width } = Dimensions.get('window');

interface LibraryScreenProps {
  navigation: any;
}

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'lastRead'>('date');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, cols] = await Promise.all([
        databaseService.getDocuments(),
        databaseService.getCollections()
      ]);
      setDocuments(docs);
      setCollections(cols);
    } catch (error) {
      Alert.alert('Error', 'Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getSortedDocuments = () => {
    let sorted = [...documents];
    
    if (selectedCollection) {
      // Filter by collection (simplified - in real app would query relationship table)
      sorted = sorted.filter(doc => doc.metadata?.collectionId === selectedCollection);
    }

    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'lastRead':
        return sorted.sort((a, b) => {
          const aDate = a.last_read_at ? new Date(a.last_read_at).getTime() : 0;
          const bDate = b.last_read_at ? new Date(b.last_read_at).getTime() : 0;
          return bDate - aDate;
        });
      case 'date':
      default:
        return sorted.sort((a, b) => {
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        });
    }
  };

  const renderDocumentItem = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={[styles.documentItem, isGridView ? styles.gridItem : styles.listItem]}
      onPress={() => navigation.navigate('DocumentReader', { documentId: item.id })}
    >
      <View style={styles.documentIcon}>
        <Ionicons 
          name={item.type === 'pdf' ? 'document-text' : 'globe'} 
          size={24} 
          color="#007AFF" 
        />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.author && (
          <Text style={styles.documentAuthor} numberOfLines={1}>
            {item.author}
          </Text>
        )}
        <Text style={styles.documentDate}>
          {new Date(item.created_at || '').toLocaleDateString()}
        </Text>
        {item.reading_progress && item.reading_progress > 0 && (
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${item.reading_progress * 100}%` }]} 
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setIsGridView(!isGridView)}
        >
          <Ionicons 
            name={isGridView ? 'list' : 'grid'} 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filters}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            // Show collection picker
            Alert.alert(
              'Filter by Collection',
              'Select a collection to filter by',
              [
                { text: 'All', onPress: () => setSelectedCollection(null) },
                ...collections.map(col => ({
                  text: col.name,
                  onPress: () => setSelectedCollection(col.id || null)
                }))
              ]
            );
          }}
        >
          <Text style={styles.filterButtonText}>
            {selectedCollection 
              ? collections.find(c => c.id === selectedCollection)?.name || 'Collection'
              : 'All Collections'
            }
          </Text>
          <Ionicons name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Alert.alert(
              'Sort by',
              'Choose sorting option',
              [
                { text: 'Date Added', onPress: () => setSortBy('date') },
                { text: 'Title', onPress: () => setSortBy('title') },
                { text: 'Last Read', onPress: () => setSortBy('lastRead') },
              ]
            );
          }}
        >
          <Text style={styles.filterButtonText}>
            Sort: {sortBy === 'date' ? 'Date' : sortBy === 'title' ? 'Title' : 'Last Read'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="library-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Your library is empty</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add PDFs or web articles to get started
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => navigation.navigate('AddContent')}
      >
        <Text style={styles.addFirstButtonText}>Add Your First Document</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading library...</Text>
      </View>
    );
  }

  const sortedDocuments = getSortedDocuments();

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedDocuments}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.id?.toString() || ''}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'grid' : 'list'}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddContent')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewToggle: {
    padding: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  documentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridItem: {
    width: (width - 48) / 2,
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 8,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  documentAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});