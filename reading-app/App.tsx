import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { databaseService } from './src/services/DatabaseService';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await databaseService.initDatabase();
      
      // Add some sample data for demonstration
      await addSampleData();
      
      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError('Failed to initialize app. Please restart the application.');
    }
  };

  const addSampleData = async () => {
    try {
      // Check if we already have data
      const existingDocs = await databaseService.getDocuments();
      if (existingDocs.length > 0) return; // Already has data

      // Add sample documents
      const doc1 = await databaseService.addDocument({
        type: 'article',
        title: 'Getting Started with React Native',
        author: 'React Native Team',
        source_url: 'https://reactnative.dev/docs/getting-started',
        content: `React Native lets you build mobile apps using only JavaScript. It uses the same design as React, letting you compose a rich mobile UI from declarative components.

With React Native, you don't build a "mobile web app", an "HTML5 app", or a "hybrid app". You build a real mobile app that's indistinguishable from an app built using Objective-C or Java. React Native uses the same fundamental UI building blocks as regular iOS and Android apps. You just put those building blocks together using JavaScript and React.

React Native has a few different tools that you can use to get started. The tool you should use depends on what you're trying to do.`,
        metadata: {
          category: 'programming',
          tags: ['react', 'mobile', 'javascript']
        }
      });

      const doc2 = await databaseService.addDocument({
        type: 'article',
        title: 'The Power of Spaced Repetition',
        author: 'Learning Science Institute',
        source_url: 'https://example.com/spaced-repetition',
        content: `Spaced repetition is an evidence-based learning technique that is usually performed with flashcards. Newly introduced and more difficult flashcards are shown more frequently, while older and less difficult flashcards are shown less frequently in order to exploit the psychological spacing effect.

The use of spaced repetition has been proven to increase rate of learning. Although the principle is useful in many contexts, spaced repetition is commonly applied in contexts in which a learner must acquire a large number of items and retain them indefinitely in memory.

The spacing effect demonstrates that learning is more effective when study sessions are spaced out. This effect shows that more information is encoded into long-term memory by spaced study sessions, also known as spaced repetition or spaced presentation, than by massed presentation.`,
        metadata: {
          category: 'education',
          tags: ['learning', 'memory', 'study']
        }
      });

      // Add sample highlights
      await databaseService.addHighlight({
        document_id: doc1,
        text: 'React Native lets you build mobile apps using only JavaScript.',
        note: 'Key benefit of React Native',
        color: '#FFFF00'
      });

      await databaseService.addHighlight({
        document_id: doc1,
        text: 'You build a real mobile app that\'s indistinguishable from an app built using Objective-C or Java.',
        note: 'Native performance',
        color: '#FFFF00'
      });

      await databaseService.addHighlight({
        document_id: doc2,
        text: 'Spaced repetition is an evidence-based learning technique that is usually performed with flashcards.',
        note: 'Definition of spaced repetition',
        color: '#FFFF00'
      });

      await databaseService.addHighlight({
        document_id: doc2,
        text: 'The use of spaced repetition has been proven to increase rate of learning.',
        note: 'Proven effectiveness',
        color: '#FFFF00'
      });

      // Add sample collections
      await databaseService.addCollection({
        name: 'Programming',
        description: 'Programming and development articles',
        color: '#007AFF'
      });

      await databaseService.addCollection({
        name: 'Learning',
        description: 'Learning and education resources',
        color: '#34C759'
      });

    } catch (error) {
      console.error('Failed to add sample data:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing Reading App...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    lineHeight: 22,
  },
});
