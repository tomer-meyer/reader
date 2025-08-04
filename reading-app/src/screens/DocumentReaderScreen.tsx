import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { databaseService, Document, Highlight } from '../services/DatabaseService';

const { width, height } = Dimensions.get('window');

interface DocumentReaderScreenProps {
  navigation: any;
  route: {
    params: {
      documentId: number;
    };
  };
}

export default function DocumentReaderScreen({ navigation, route }: DocumentReaderScreenProps) {
  const { documentId } = route.params;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await databaseService.getDocumentById(documentId);
      if (doc) {
        setDocument(doc);
        setProgress(doc.reading_progress || 0);
      } else {
        Alert.alert('Error', 'Document not found');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load document');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress: number) => {
    setProgress(newProgress);
    try {
      await databaseService.updateDocumentProgress(documentId, newProgress);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const createHighlight = async () => {
    if (!selectedText.trim()) {
      Alert.alert('Error', 'No text selected');
      return;
    }

    try {
      const highlight: Highlight = {
        document_id: documentId,
        text: selectedText,
        note: highlightNote.trim() || undefined,
        color: '#FFFF00',
      };

      await databaseService.addHighlight(highlight);
      setShowHighlightModal(false);
      setSelectedText('');
      setHighlightNote('');
      Alert.alert('Success', 'Highlight saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save highlight');
    }
  };

  const getHtmlContent = () => {
    if (!document) return '';

    if (document.type === 'pdf') {
      // For PDFs, we'll show a placeholder since we need a PDF viewer
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              padding: 20px;
              margin: 0;
              background: #f8f9fa;
            }
            .pdf-placeholder {
              background: white;
              border-radius: 12px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              margin: 20px;
            }
            .pdf-icon {
              font-size: 48px;
              color: #007AFF;
              margin-bottom: 16px;
            }
            .pdf-title {
              font-size: 24px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 8px;
            }
            .pdf-info {
              color: #666;
              margin-bottom: 24px;
            }
            .pdf-content {
              text-align: left;
              line-height: 1.8;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="pdf-placeholder">
            <div class="pdf-icon">📄</div>
            <div class="pdf-title">${document.title}</div>
            <div class="pdf-info">PDF Document</div>
            <div class="pdf-content">
              <p>This is a PDF document: ${document.title}</p>
              <p>In a full implementation, this would display the actual PDF content using a PDF viewer component.</p>
              <p>You can still highlight this text to test the highlighting functionality.</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // For articles, show the content with reader mode styling
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.8;
              padding: 20px;
              margin: 0;
              background: #f8f9fa;
              color: #1a1a1a;
            }
            .article-container {
              background: white;
              border-radius: 12px;
              padding: 32px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              margin: 20px;
              max-width: 800px;
              margin-left: auto;
              margin-right: auto;
            }
            .article-title {
              font-size: 28px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 16px;
              line-height: 1.3;
            }
            .article-meta {
              color: #666;
              font-size: 14px;
              margin-bottom: 32px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e1e5e9;
            }
            .article-content {
              font-size: 18px;
              line-height: 1.8;
            }
            .article-content p {
              margin-bottom: 24px;
            }
            ::selection {
              background: #FFFF00;
              color: #000;
            }
          </style>
        </head>
        <body>
          <div class="article-container">
            <h1 class="article-title">${document.title}</h1>
            <div class="article-meta">
              ${document.author ? `By ${document.author} • ` : ''}
              ${document.source_url ? `<a href="${document.source_url}" style="color: #007AFF;">Source</a> • ` : ''}
              ${new Date(document.created_at || '').toLocaleDateString()}
            </div>
            <div class="article-content">
              ${document.content || 'No content available'}
            </div>
          </div>
        </body>
        </html>
      `;
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selection') {
        setSelectedText(data.text);
        setShowHighlightModal(true);
      } else if (data.type === 'scroll') {
        updateProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      let lastScrollTop = 0;
      let documentHeight = 0;
      
      // Handle text selection
      document.addEventListener('selectionchange', function() {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'selection',
            text: selection.toString().trim()
          }));
        }
      });
      
      // Handle scroll progress
      window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;
        
        if (Math.abs(scrollTop - lastScrollTop) > 50) {
          lastScrollTop = scrollTop;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'scroll',
            progress: progress
          }));
        }
      });
      
      // Initial progress calculation
      setTimeout(function() {
        documentHeight = document.documentElement.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'scroll',
          progress: 0
        }));
      }, 1000);
    })();
  `;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading document...</Text>
      </View>
    );
  }

  if (!document) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Document not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progress * 100}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: getHtmlContent() }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Menu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Ionicons name={showMenu ? 'close' : 'ellipsis-horizontal'} size={24} color="white" />
      </TouchableOpacity>

      {showMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              // In a real app, this would trigger text selection mode
              Alert.alert('Highlight', 'Long press on text to highlight');
            }}
          >
            <Ionicons name="create" size={20} color="#007AFF" />
            <Text style={styles.menuItemText}>Highlight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              // Share functionality
              Alert.alert('Share', 'Share functionality would go here');
            }}
          >
            <Ionicons name="share" size={20} color="#007AFF" />
            <Text style={styles.menuItemText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              // Settings functionality
              Alert.alert('Settings', 'Reader settings would go here');
            }}
          >
            <Ionicons name="settings" size={20} color="#007AFF" />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Highlight Modal */}
      <Modal
        visible={showHighlightModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHighlightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Highlight</Text>
            
            <View style={styles.selectedTextContainer}>
              <Text style={styles.selectedTextLabel}>Selected Text:</Text>
              <Text style={styles.selectedText}>{selectedText}</Text>
            </View>

            <Text style={styles.noteLabel}>Add a note (optional):</Text>
            <TextInput
              style={styles.noteInput}
              value={highlightNote}
              onChangeText={setHighlightNote}
              placeholder="Add your thoughts..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowHighlightModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={createHighlight}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Save Highlight
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e1e5e9',
    borderRadius: 2,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  webview: {
    flex: 1,
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
  menuContainer: {
    position: 'absolute',
    bottom: 88,
    right: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: width - 40,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  selectedTextContainer: {
    marginBottom: 16,
  },
  selectedTextLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  selectedText: {
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#FFFF00',
    padding: 12,
    borderRadius: 8,
    lineHeight: 22,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalButtonTextPrimary: {
    color: 'white',
  },
});