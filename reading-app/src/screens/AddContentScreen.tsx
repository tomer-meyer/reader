import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { databaseService, Document } from '../services/DatabaseService';

interface AddContentScreenProps {
  navigation: any;
}

export default function AddContentScreen({ navigation }: AddContentScreenProps) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'urls'>('pdf');
  const [urls, setUrls] = useState('');
  const [importing, setImporting] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedPdf(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  const importPdf = async () => {
    if (!selectedPdf) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    setImporting(true);
    try {
      // Copy file to app's documents directory
      const fileName = selectedPdf.name || 'document.pdf';
      const destinationUri = `${FileSystem.documentDirectory}pdfs/${fileName}`;
      
      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}pdfs/`, {
        intermediates: true,
      });

      // Copy file
      await FileSystem.copyAsync({
        from: selectedPdf.uri,
        to: destinationUri,
      });

      // Add to database
      const document: Document = {
        type: 'pdf',
        title: fileName.replace('.pdf', ''),
        file_path: destinationUri,
        metadata: {
          originalName: selectedPdf.name,
          size: selectedPdf.size,
          mimeType: selectedPdf.mimeType,
        },
      };

      await databaseService.addDocument(document);
      Alert.alert('Success', 'PDF imported successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to import PDF');
    } finally {
      setImporting(false);
    }
  };

  const importUrls = async () => {
    if (!urls.trim()) {
      Alert.alert('Error', 'Please enter at least one URL');
      return;
    }

    setImporting(true);
    try {
      const urlList = urls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      let successCount = 0;
      let errorCount = 0;

      for (const url of urlList) {
        try {
          // Simple web scraping simulation
          // In a real app, you'd use a proper web scraping library
          const document: Document = {
            type: 'article',
            title: `Article from ${new URL(url).hostname}`,
            source_url: url,
            content: `Content from ${url} would be extracted here.`,
            metadata: {
              url: url,
              extractedAt: new Date().toISOString(),
            },
          };

          await databaseService.addDocument(document);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        Alert.alert(
          'Import Complete',
          `Successfully imported ${successCount} articles${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        );
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to import any articles');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import articles');
    } finally {
      setImporting(false);
    }
  };

  const renderPdfTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Upload PDF Document</Text>
      <Text style={styles.sectionDescription}>
        Select a PDF file from your device to add it to your library
      </Text>

      {selectedPdf ? (
        <View style={styles.selectedFile}>
          <View style={styles.fileInfo}>
            <Ionicons name="document-text" size={24} color="#007AFF" />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>{selectedPdf.name}</Text>
              <Text style={styles.fileSize}>
                {(selectedPdf.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setSelectedPdf(null)}
          >
            <Ionicons name="close-circle" size={24} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={pickPdf}>
          <Ionicons name="cloud-upload" size={32} color="#007AFF" />
          <Text style={styles.uploadButtonText}>Select PDF File</Text>
          <Text style={styles.uploadButtonSubtext}>
            Tap to browse your device
          </Text>
        </TouchableOpacity>
      )}

      {selectedPdf && (
        <TouchableOpacity
          style={[styles.importButton, importing && styles.importButtonDisabled]}
          onPress={importPdf}
          disabled={importing}
        >
          {importing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.importButtonText}>Import PDF</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderUrlsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Import Web Articles</Text>
      <Text style={styles.sectionDescription}>
        Paste URLs (one per line) to import articles from the web
      </Text>

      <TextInput
        style={styles.urlInput}
        placeholder="https://example.com/article1&#10;https://example.com/article2&#10;https://example.com/article3"
        value={urls}
        onChangeText={setUrls}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />

      <View style={styles.urlStats}>
        <Text style={styles.urlStatsText}>
          {urls.split('\n').filter(url => url.trim().length > 0).length} URLs ready to import
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.importButton, importing && styles.importButtonDisabled]}
        onPress={importUrls}
        disabled={importing || !urls.trim()}
      >
        {importing ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.importButtonText}>Import Articles</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Content</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pdf' && styles.activeTab]}
          onPress={() => setActiveTab('pdf')}
        >
          <Ionicons 
            name="document-text" 
            size={20} 
            color={activeTab === 'pdf' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'pdf' && styles.activeTabText]}>
            PDF Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'urls' && styles.activeTab]}
          onPress={() => setActiveTab('urls')}
        >
          <Ionicons 
            name="globe" 
            size={20} 
            color={activeTab === 'urls' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'urls' && styles.activeTabText]}>
            Web Articles
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'pdf' ? renderPdfTab() : renderUrlsTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginBottom: 16,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  urlInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  urlStats: {
    marginBottom: 24,
  },
  urlStatsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  importButtonDisabled: {
    backgroundColor: '#ccc',
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});