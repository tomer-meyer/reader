import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { databaseService } from '../services/DatabaseService';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [loading, setLoading] = useState(false);
  const [storageUsed, setStorageUsed] = useState('0 MB');
  const [documentCount, setDocumentCount] = useState(0);
  const [highlightCount, setHighlightCount] = useState(0);

  // Reading preferences
  const [fontSize, setFontSize] = useState('medium');
  const [theme, setTheme] = useState('light');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [autoSaveHighlights, setAutoSaveHighlights] = useState(true);
  const [readingProgress, setReadingProgress] = useState(true);

  // Review settings
  const [dailyReviewCount, setDailyReviewCount] = useState(10);
  const [spacedRepetition, setSpacedRepetition] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);

  // Storage settings
  const [autoCleanup, setAutoCleanup] = useState(false);
  const [compressionEnabled, setCompressionEnabled] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const documents = await databaseService.getDocuments();
      const highlights = await databaseService.getHighlightsForReview(1000); // Get all highlights
      
      setDocumentCount(documents.length);
      setHighlightCount(highlights.length);
      
      // Simulate storage calculation
      const totalSize = documents.length * 2.5 + highlights.length * 0.1; // MB
      setStorageUsed(`${totalSize.toFixed(1)} MB`);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'JSON', onPress: () => exportAsJSON() },
        { text: 'Markdown', onPress: () => exportAsMarkdown() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const exportAsJSON = async () => {
    try {
      setLoading(true);
      const documents = await databaseService.getDocuments();
      const highlights = await databaseService.getHighlightsForReview(1000);
      
      const exportData = {
        documents,
        highlights,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // In a real app, this would save to file or share
      Alert.alert('Export Complete', 'Data exported as JSON successfully!');
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const exportAsMarkdown = async () => {
    try {
      setLoading(true);
      const documents = await databaseService.getDocuments();
      const highlights = await databaseService.getHighlightsForReview(1000);
      
      let markdown = '# Reading App Export\n\n';
      markdown += `Exported on ${new Date().toLocaleDateString()}\n\n`;
      
      markdown += '## Documents\n\n';
      documents.forEach(doc => {
        markdown += `### ${doc.title}\n`;
        if (doc.author) markdown += `**Author:** ${doc.author}\n`;
        markdown += `**Type:** ${doc.type}\n`;
        markdown += `**Added:** ${new Date(doc.created_at || '').toLocaleDateString()}\n\n`;
      });
      
      markdown += '## Highlights\n\n';
      highlights.forEach(highlight => {
        const doc = documents.find(d => d.id === highlight.document_id);
        markdown += `> ${highlight.text}\n\n`;
        if (highlight.note) markdown += `**Note:** ${highlight.note}\n\n`;
        markdown += `*From: ${doc?.title || 'Unknown Document'}*\n\n`;
      });
      
      // In a real app, this would save to file or share
      Alert.alert('Export Complete', 'Data exported as Markdown successfully!');
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your documents, highlights, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Are you absolutely sure? This will delete everything.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete Everything', 
                  style: 'destructive',
                  onPress: () => {
                    // In a real app, this would clear the database
                    Alert.alert('Data Cleared', 'All data has been cleared');
                    loadStats();
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={20} color="#007AFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </TouchableOpacity>
  );

  const renderSwitch = (value: boolean, onValueChange: (value: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#e1e5e9', true: '#007AFF' }}
      thumbColor={value ? 'white' : '#f4f3f4'}
    />
  );

  const renderValue = (value: string) => (
    <View style={styles.valueContainer}>
      <Text style={styles.valueText}>{value}</Text>
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Storage Stats */}
      {renderSection('Storage', (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{documentCount}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{highlightCount}</Text>
            <Text style={styles.statLabel}>Highlights</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{storageUsed}</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>
        </View>
      ))}

      {/* Reading Preferences */}
      {renderSection('Reading Preferences', (
        <>
          {renderSettingItem(
            'text',
            'Font Size',
            'Adjust text size for better readability',
            renderValue(fontSize === 'small' ? 'Small' : fontSize === 'large' ? 'Large' : 'Medium'),
            () => {
              Alert.alert(
                'Font Size',
                'Choose font size:',
                [
                  { text: 'Small', onPress: () => setFontSize('small') },
                  { text: 'Medium', onPress: () => setFontSize('medium') },
                  { text: 'Large', onPress: () => setFontSize('large') },
                ]
              );
            }
          )}
          
          {renderSettingItem(
            'color-palette',
            'Theme',
            'Choose your preferred color scheme',
            renderValue(theme === 'dark' ? 'Dark' : 'Light'),
            () => {
              Alert.alert(
                'Theme',
                'Choose theme:',
                [
                  { text: 'Light', onPress: () => setTheme('light') },
                  { text: 'Dark', onPress: () => setTheme('dark') },
                ]
              );
            }
          )}
          
          {renderSettingItem(
            'resize',
            'Line Spacing',
            'Adjust spacing between lines',
            renderValue(lineSpacing === 'tight' ? 'Tight' : lineSpacing === 'loose' ? 'Loose' : 'Normal'),
            () => {
              Alert.alert(
                'Line Spacing',
                'Choose line spacing:',
                [
                  { text: 'Tight', onPress: () => setLineSpacing('tight') },
                  { text: 'Normal', onPress: () => setLineSpacing('normal') },
                  { text: 'Loose', onPress: () => setLineSpacing('loose') },
                ]
              );
            }
          )}
          
          {renderSettingItem(
            'bookmark',
            'Auto-save Highlights',
            'Automatically save text selections',
            renderSwitch(autoSaveHighlights, setAutoSaveHighlights)
          )}
          
          {renderSettingItem(
            'analytics',
            'Reading Progress',
            'Track your reading progress',
            renderSwitch(readingProgress, setReadingProgress)
          )}
        </>
      ))}

      {/* Review Settings */}
      {renderSection('Review Settings', (
        <>
          {renderSettingItem(
            'refresh-circle',
            'Daily Review Count',
            'Number of highlights to review each day',
            renderValue(`${dailyReviewCount} highlights`),
            () => {
              Alert.alert(
                'Daily Review Count',
                'Choose number of highlights:',
                [
                  { text: '5', onPress: () => setDailyReviewCount(5) },
                  { text: '10', onPress: () => setDailyReviewCount(10) },
                  { text: '15', onPress: () => setDailyReviewCount(15) },
                  { text: '20', onPress: () => setDailyReviewCount(20) },
                ]
              );
            }
          )}
          
          {renderSettingItem(
            'repeat',
            'Spaced Repetition',
            'Use spaced repetition algorithm',
            renderSwitch(spacedRepetition, setSpacedRepetition)
          )}
          
          {renderSettingItem(
            'notifications',
            'Review Reminders',
            'Get notified about daily reviews',
            renderSwitch(reviewReminders, setReviewReminders)
          )}
        </>
      ))}

      {/* Storage Management */}
      {renderSection('Storage Management', (
        <>
          {renderSettingItem(
            'trash',
            'Auto Cleanup',
            'Automatically remove old content',
            renderSwitch(autoCleanup, setAutoCleanup)
          )}
          
          {renderSettingItem(
            'compress',
            'Compression',
            'Compress content to save space',
            renderSwitch(compressionEnabled, setCompressionEnabled)
          )}
          
          {renderSettingItem(
            'download',
            'Export Data',
            'Export your data as JSON or Markdown',
            <Ionicons name="chevron-forward" size={16} color="#ccc" />,
            handleExportData
          )}
          
          {renderSettingItem(
            'trash-outline',
            'Clear All Data',
            'Permanently delete all content',
            <Ionicons name="chevron-forward" size={16} color="#ccc" />,
            handleClearData
          )}
        </>
      ))}

      {/* About */}
      {renderSection('About', (
        <>
          {renderSettingItem(
            'information-circle',
            'Version',
            'App version and build info',
            renderValue('1.0.0')
          )}
          
          {renderSettingItem(
            'help-circle',
            'Help & Support',
            'Get help and contact support',
            <Ionicons name="chevron-forward" size={16} color="#ccc" />,
            () => Alert.alert('Help', 'Help and support information would go here')
          )}
          
          {renderSettingItem(
            'document-text',
            'Privacy Policy',
            'Read our privacy policy',
            <Ionicons name="chevron-forward" size={16} color="#ccc" />,
            () => Alert.alert('Privacy Policy', 'Privacy policy would be displayed here')
          )}
        </>
      ))}
    </ScrollView>
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
  section: {
    backgroundColor: 'white',
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    marginLeft: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 16,
    color: '#666',
  },
});