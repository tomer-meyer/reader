import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { databaseService, Highlight } from '../services/DatabaseService';

const { width, height } = Dimensions.get('window');

interface ReviewScreenProps {
  navigation: any;
}

export default function ReviewScreen({ navigation }: ReviewScreenProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [todayReviewed, setTodayReviewed] = useState(0);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      setLoading(true);
      const reviewHighlights = await databaseService.getHighlightsForReview(20);
      setHighlights(reviewHighlights);
      
      // Simulate daily streak (in real app, this would come from database)
      setDailyStreak(7);
      setTodayReviewed(3);
    } catch (error) {
      Alert.alert('Error', 'Failed to load highlights for review');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= highlights.length) return;

    const currentHighlight = highlights[currentIndex];
    const mastered = direction === 'right';

    try {
      await databaseService.updateHighlightReview(currentHighlight.id!, mastered);
      
      // Move to next highlight
      setCurrentIndex(prev => prev + 1);
      setTodayReviewed(prev => prev + 1);
      
      // If we've reviewed all highlights, show completion
      if (currentIndex + 1 >= highlights.length) {
        setTimeout(() => {
          Alert.alert(
            'Review Complete!',
            `You've reviewed ${highlights.length} highlights today. Great job!`,
            [
              {
                text: 'Continue',
                onPress: () => {
                  setCurrentIndex(0);
                  loadHighlights();
                }
              }
            ]
          );
        }, 500);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update highlight');
    }
  };

  const renderHighlightCard = (highlight: Highlight) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.documentTitle}>{highlight.document_title || 'Unknown Document'}</Text>
        <View style={styles.reviewCount}>
          <Ionicons name="refresh" size={16} color="#666" />
          <Text style={styles.reviewCountText}>{highlight.review_count || 0}</Text>
        </View>
      </View>

      <View style={styles.highlightContent}>
        <View style={styles.highlightTextContainer}>
          <Text style={styles.highlightText}>{highlight.text}</Text>
        </View>
        
        {highlight.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Your note:</Text>
            <Text style={styles.noteText}>{highlight.note}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.highlightDate}>
          {new Date(highlight.created_at || '').toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderProgress = () => {
    const progress = highlights.length > 0 ? (currentIndex / highlights.length) * 100 : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progress}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex} of {highlights.length}
        </Text>
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Ionicons name="flame" size={24} color="#FF6B35" />
        <Text style={styles.statNumber}>{dailyStreak}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
      
      <View style={styles.statItem}>
        <Ionicons name="checkmark-circle" size={24} color="#34C759" />
        <Text style={styles.statNumber}>{todayReviewed}</Text>
        <Text style={styles.statLabel}>Today</Text>
      </View>
      
      <View style={styles.statItem}>
        <Ionicons name="book" size={24} color="#007AFF" />
        <Text style={styles.statNumber}>{highlights.length}</Text>
        <Text style={styles.statLabel}>Remaining</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle" size={64} color="#34C759" />
      <Text style={styles.emptyStateTitle}>All caught up!</Text>
      <Text style={styles.emptyStateSubtitle}>
        You've reviewed all your highlights for today. Come back tomorrow for more.
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadHighlights}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading highlights...</Text>
      </View>
    );
  }

  if (highlights.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Review</Text>
        </View>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Review</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert('Settings', 'Review settings would go here')}
        >
          <Ionicons name="settings" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {renderStats()}
      {renderProgress()}

      <View style={styles.cardContainer}>
        {currentIndex < highlights.length && renderHighlightCard(highlights[currentIndex])}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.skipButton]}
          onPress={() => handleSwipe('left')}
        >
          <Ionicons name="close" size={24} color="#FF3B30" />
          <Text style={[styles.controlButtonText, styles.skipButtonText]}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.masteredButton]}
          onPress={() => handleSwipe('right')}
        >
          <Ionicons name="checkmark" size={24} color="#34C759" />
          <Text style={[styles.controlButtonText, styles.masteredButtonText]}>Mastered</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Swipe right if you remember this, left if you need more review
        </Text>
      </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e1e5e9',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    maxHeight: height * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    flex: 1,
  },
  reviewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCountText: {
    fontSize: 12,
    color: '#666',
  },
  highlightContent: {
    flex: 1,
  },
  highlightTextContainer: {
    backgroundColor: '#FFFF00',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  highlightText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
  },
  noteContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 20,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  highlightDate: {
    fontSize: 12,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  skipButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  masteredButton: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#E5FFE5',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#FF3B30',
  },
  masteredButtonText: {
    color: '#34C759',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});