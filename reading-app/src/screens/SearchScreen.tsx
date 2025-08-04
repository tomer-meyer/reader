import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { databaseService, Document, Highlight } from '../services/DatabaseService';

interface SearchScreenProps {
  navigation: any;
}

interface SearchResult {
  type: 'document' | 'highlight';
  data: Document | Highlight;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'documents' | 'highlights'>('all');

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    // In a real app, this would load from AsyncStorage
    setSearchHistory(['react native', 'pdf reading', 'highlighting', 'spaced repetition']);
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (searchType === 'all' || searchType === 'documents') {
        const documents = await databaseService.searchDocuments(searchQuery);
        searchResults.push(...documents.map(doc => ({ type: 'document' as const, data: doc })));
      }

      if (searchType === 'all' || searchType === 'highlights') {
        const highlights = await databaseService.searchHighlights(searchQuery);
        searchResults.push(...highlights.map(highlight => ({ type: 'highlight' as const, data: highlight })));
      }

      setResults(searchResults);

      // Add to search history
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        const newHistory = [searchQuery.trim(), ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        // In a real app, save to AsyncStorage
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(query);
    setShowHistory(false);
  };

  const handleHistoryItemPress = (historyItem: string) => {
    setQuery(historyItem);
    performSearch(historyItem);
    setShowHistory(false);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'document') {
      const document = item.data as Document;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => navigation.navigate('DocumentReader', { documentId: document.id })}
        >
          <View style={styles.resultIcon}>
            <Ionicons 
              name={document.type === 'pdf' ? 'document-text' : 'globe'} 
              size={20} 
              color="#007AFF" 
            />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {document.title}
            </Text>
            {document.author && (
              <Text style={styles.resultSubtitle} numberOfLines={1}>
                By {document.author}
              </Text>
            )}
            <Text style={styles.resultMeta}>
              {document.type === 'pdf' ? 'PDF Document' : 'Web Article'} • 
              {new Date(document.created_at || '').toLocaleDateString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
      );
    } else {
      const highlight = item.data as Highlight;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => {
            // Navigate to document and scroll to highlight
            navigation.navigate('DocumentReader', { 
              documentId: highlight.document_id,
              highlightId: highlight.id 
            });
          }}
        >
          <View style={styles.resultIcon}>
            <Ionicons name="create" size={20} color="#FFD700" />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={2}>
              {highlight.text}
            </Text>
            {highlight.note && (
              <Text style={styles.resultSubtitle} numberOfLines={1}>
                Note: {highlight.note}
              </Text>
            )}
            <Text style={styles.resultMeta}>
              Highlight • {new Date(highlight.created_at || '').toLocaleDateString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
      );
    }
  };

  const renderSearchHistory = () => (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Recent Searches</Text>
        <TouchableOpacity
          onPress={() => {
            setSearchHistory([]);
            // In a real app, clear from AsyncStorage
          }}
        >
          <Text style={styles.clearHistoryText}>Clear</Text>
        </TouchableOpacity>
      </View>
      {searchHistory.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.historyItem}
          onPress={() => handleHistoryItemPress(item)}
        >
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.historyText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSuggestedSearches = () => (
    <View style={styles.suggestedContainer}>
      <Text style={styles.suggestedTitle}>Suggested Searches</Text>
      <View style={styles.suggestedTags}>
        {['react native', 'pdf reading', 'highlighting', 'spaced repetition'].map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestedTag}
            onPress={() => handleHistoryItemPress(tag)}
          >
            <Text style={styles.suggestedTagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Search your library</Text>
      <Text style={styles.emptyStateSubtitle}>
        Find documents and highlights by typing keywords
      </Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No results found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Try different keywords or check your spelling
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents and highlights..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            onFocus={() => setShowHistory(true)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setQuery('');
                setResults([]);
                setShowHistory(true);
              }}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Type Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, searchType === 'all' && styles.filterButtonActive]}
          onPress={() => setSearchType('all')}
        >
          <Text style={[styles.filterButtonText, searchType === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, searchType === 'documents' && styles.filterButtonActive]}
          onPress={() => setSearchType('documents')}
        >
          <Text style={[styles.filterButtonText, searchType === 'documents' && styles.filterButtonTextActive]}>
            Documents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, searchType === 'highlights' && styles.filterButtonActive]}
          onPress={() => setSearchType('highlights')}
        >
          <Text style={[styles.filterButtonText, searchType === 'highlights' && styles.filterButtonTextActive]}>
            Highlights
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : query.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {showHistory && searchHistory.length > 0 && renderSearchHistory()}
              {renderSuggestedSearches()}
            </>
          }
          ListEmptyComponent={renderEmptyState()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          ListEmptyComponent={renderNoResults()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    flexGrow: 1,
  },
  historyContainer: {
    backgroundColor: 'white',
    marginBottom: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#007AFF',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  suggestedContainer: {
    backgroundColor: 'white',
    padding: 16,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  suggestedTagText: {
    fontSize: 14,
    color: '#007AFF',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    lineHeight: 22,
  },
});