# Reading App - Local Reading & Highlight Management

A React Native mobile application inspired by Readwise that enables users to collect, organize, and review content from various sources including PDFs and web articles. This app operates entirely offline using local SQLite storage and provides a clean reading experience with highlighting and spaced repetition review features.

## 🚀 Features

### Core Features
- **PDF Upload & Management**: Upload and organize PDF documents locally
- **Web Article Import**: Import articles from URLs with content extraction
- **Highlighting System**: Highlight text and add notes with color coding
- **Spaced Repetition Review**: Daily review sessions with spaced repetition algorithm
- **Search Functionality**: Full-text search across documents and highlights
- **Collections & Tags**: Organize content with custom collections and tags
- **Reading Progress Tracking**: Track reading progress across all documents
- **Export Options**: Export data as JSON or Markdown

### Technical Features
- **Fully Offline**: All data stored locally using SQLite
- **Privacy-First**: No cloud synchronization, complete data ownership
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Cross-Platform**: Built with React Native and Expo for iOS and Android

## 📱 Screenshots

The app includes the following main screens:

1. **Library Screen**: Browse and organize your documents with grid/list view
2. **Document Reader**: Read documents with highlighting and progress tracking
3. **Add Content**: Upload PDFs or import web articles
4. **Review Screen**: Daily spaced repetition review sessions
5. **Search Screen**: Search across all content and highlights
6. **Settings Screen**: Configure reading preferences and manage data

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Database**: SQLite (via expo-sqlite)
- **Navigation**: React Navigation v6
- **UI Components**: Custom components with React Native
- **File Handling**: expo-document-picker, expo-file-system
- **Web Content**: react-native-webview
- **Icons**: @expo/vector-icons

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reading-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

### 4. Run on Device/Simulator

- **iOS**: Press `i` in the terminal or scan the QR code with the Expo Go app
- **Android**: Press `a` in the terminal or scan the QR code with the Expo Go app
- **Web**: Press `w` in the terminal

## 📁 Project Structure

```
reading-app/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Main navigation structure
│   ├── screens/
│   │   ├── LibraryScreen.tsx         # Document library
│   │   ├── DocumentReaderScreen.tsx  # Document reader with WebView
│   │   ├── AddContentScreen.tsx      # PDF upload and URL import
│   │   ├── ReviewScreen.tsx          # Spaced repetition review
│   │   ├── SearchScreen.tsx          # Search functionality
│   │   └── SettingsScreen.tsx        # App settings and preferences
│   └── services/
│       └── DatabaseService.ts        # SQLite database operations
├── App.tsx                           # Main app component
├── package.json                      # Dependencies and scripts
└── README.md                         # This file
```

## 🗄️ Database Schema

The app uses SQLite with the following main tables:

- **documents**: Store PDF and article metadata
- **highlights**: Store text highlights with notes and positions
- **collections**: Organize documents into collections
- **tags**: Tag system for content categorization
- **reading_sessions**: Track reading progress and sessions

## 🎯 Key Features Explained

### PDF Upload
- Select PDF files from device storage
- Automatic metadata extraction
- Local storage with file management
- Progress tracking for large files

### Web Article Import
- Batch URL processing
- Content extraction and cleaning
- Automatic metadata capture
- Offline storage for reading

### Highlighting System
- Text selection and highlighting
- Multiple highlight colors
- Add notes to highlights
- Export highlights as text/markdown

### Spaced Repetition Review
- Daily review sessions
- Customizable review count
- Progress tracking
- Mastered/skip functionality

### Search & Discovery
- Full-text search across content
- Search within highlights
- Filter by type, date, tags
- Search history and suggestions

## 🔧 Configuration

### Reading Preferences
- Font size adjustment
- Theme selection (light/dark)
- Line spacing options
- Auto-save highlights toggle

### Review Settings
- Daily review count
- Spaced repetition algorithm
- Review reminders
- Progress tracking

### Storage Management
- Auto cleanup options
- Compression settings
- Export functionality
- Data backup/restore

## 📊 Performance Considerations

- Lazy loading for large libraries
- Optimized SQLite queries with indexes
- Background processing for imports
- Efficient search algorithms
- Memory management for large documents

## 🔒 Privacy & Security

- All data stored locally on device
- No cloud synchronization
- No data collection or analytics
- Complete user data ownership
- Optional data export for backup

## 🚧 Future Enhancements

### Phase 2 Features
- Edge reader integration
- Advanced highlighting with colors
- Enhanced spaced repetition algorithms
- Reading statistics and analytics
- Social features (share highlights)

### Phase 3 Features
- Cloud backup option (opt-in)
- AI-powered summarization
- Cross-platform sync
- Desktop companion app
- Integration with other reading apps

## 🐛 Troubleshooting

### Common Issues

1. **Database initialization fails**
   - Ensure expo-sqlite is properly installed
   - Check device storage permissions

2. **PDF upload issues**
   - Verify file permissions
   - Check available storage space

3. **WebView content not loading**
   - Ensure internet connectivity for web articles
   - Check WebView permissions

### Development Tips

- Use Expo DevTools for debugging
- Enable React Native Debugger for better debugging experience
- Use Flipper for advanced debugging on physical devices

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

## 🙏 Acknowledgments

- Inspired by Readwise and similar reading management tools
- Built with React Native and Expo
- Uses various open-source libraries and tools

---

**Note**: This is a demonstration app implementing the features described in the Product Requirements Document. Some features like actual PDF rendering and web scraping are simulated for demonstration purposes.