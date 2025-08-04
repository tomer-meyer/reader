# Product Requirements Document
## Local Reading & Highlight Management App

### 1. Executive Summary

#### 1.1 Product Overview
A mobile application inspired by Readwise that enables users to collect, organize, and review content from various sources including PDFs and web articles. Unlike Readwise, this app operates entirely offline using local SQLite storage and leverages Microsoft Edge's reader functionality for optimal reading experience.

#### 1.2 Key Differentiators
- **Fully Offline**: All data stored locally using SQLite
- **Privacy-First**: No cloud synchronization, complete data ownership
- **PDF Support**: Direct PDF upload and annotation
- **Web Article Saving**: Batch URL processing for article archiving
- **Edge Reader Integration**: Leveraging Microsoft Edge's reader view for distraction-free reading

### 2. Technical Stack

- **Framework**: React Native with Expo
- **Database**: SQLite (via expo-sqlite)
- **PDF Processing**: react-native-pdf or expo-document-picker
- **Web Scraping**: Custom implementation or react-native-webview
- **Reader View**: Microsoft Edge WebView integration

### 3. Core Features

#### 3.1 Content Import & Management

##### 3.1.1 PDF Upload
- **User Story**: As a user, I want to upload PDF files so I can read and highlight them within the app
- **Acceptance Criteria**:
  - Support for selecting PDFs from device storage
  - PDF preview before import
  - Automatic metadata extraction (title, author, page count)
  - Progress indicator for large files
  - Support for multiple simultaneous uploads

##### 3.1.2 Web Article Import
- **User Story**: As a user, I want to save web articles by providing URLs so I can read them offline
- **Acceptance Criteria**:
  - Batch URL input (paste multiple URLs at once)
  - Article content extraction and cleaning
  - Automatic metadata capture (title, author, publication date, source)
  - Failed import handling with retry option
  - Preview of extracted content before saving

##### 3.1.3 Content Organization
- **User Story**: As a user, I want to organize my content into collections so I can easily find what I need
- **Acceptance Criteria**:
  - Create/edit/delete custom collections
  - Tag system for content categorization
  - Search functionality across all content
  - Sort by date added, last read, title
  - Filter by content type (PDF/Article)

#### 3.2 Reading Experience

##### 3.2.1 Microsoft Edge Reader Integration
- **User Story**: As a user, I want a clean reading experience using Edge's reader mode
- **Acceptance Criteria**:
  - Seamless transition to Edge reader view
  - Customizable reading settings (font size, theme, spacing)
  - Reading progress tracking
  - Return to exact position on app re-entry
  - Offline availability of reader mode

##### 3.2.2 Highlighting & Annotation
- **User Story**: As a user, I want to highlight important passages and add notes
- **Acceptance Criteria**:
  - Text selection and highlighting
  - Multiple highlight colors
  - Add notes to highlights
  - View all highlights for a document
  - Export highlights as text/markdown

#### 3.3 Review & Learning

##### 3.3.1 Daily Review
- **User Story**: As a user, I want to review my highlights regularly to reinforce learning
- **Acceptance Criteria**:
  - Daily review sessions with customizable count
  - Spaced repetition algorithm
  - Mark highlights as mastered
  - Skip/snooze options
  - Progress tracking

##### 3.3.2 Search & Discovery
- **User Story**: As a user, I want to search through all my content and highlights
- **Acceptance Criteria**:
  - Full-text search across all content
  - Search within highlights only
  - Filter by date range, tags, collections
  - Search history
  - Suggested searches based on content

### 4. Database Schema

#### 4.1 Core Tables

```sql
-- Documents table
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('pdf', 'article')),
    title TEXT NOT NULL,
    author TEXT,
    source_url TEXT,
    file_path TEXT,
    content TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    reading_progress REAL DEFAULT 0
);

-- Collections table
CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document-Collection relationship
CREATE TABLE document_collections (
    document_id INTEGER,
    collection_id INTEGER,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (collection_id) REFERENCES collections(id),
    PRIMARY KEY (document_id, collection_id)
);

-- Highlights table
CREATE TABLE highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    note TEXT,
    color TEXT DEFAULT '#FFFF00',
    position JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed_at TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    mastered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- Tags table
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Document-Tag relationship
CREATE TABLE document_tags (
    document_id INTEGER,
    tag_id INTEGER,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id),
    PRIMARY KEY (document_id, tag_id)
);

-- Reading sessions
CREATE TABLE reading_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    progress_start REAL,
    progress_end REAL,
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

### 5. User Interface Design

#### 5.1 Navigation Structure
- **Bottom Tab Navigation**:
  - Library (home)
  - Review
  - Search
  - Settings

#### 5.2 Key Screens

##### 5.2.1 Library Screen
- Grid/List view toggle
- Collection filter dropdown
- Sort options
- Quick add button (FAB)
- Pull-to-refresh gesture

##### 5.2.2 Document Reader
- Edge WebView container
- Floating action menu:
  - Highlight tool
  - Note tool
  - Share
  - Settings
- Progress bar
- Back navigation

##### 5.2.3 Add Content Screen
- Tab selector (PDF/URLs)
- PDF picker with preview
- URL batch input textarea
- Import button with progress

##### 5.2.4 Review Screen
- Card-based highlight display
- Swipe gestures (mastered/skip)
- Progress indicator
- Daily streak counter

### 6. Technical Considerations

#### 6.1 Performance
- Lazy loading for large libraries
- Image/PDF thumbnail caching
- Background processing for imports
- Optimized SQLite queries with indexes

#### 6.2 Storage Management
- Configurable storage limits
- Compression for article content
- Cleanup tools for old content
- Storage usage analytics

#### 6.3 Edge WebView Integration
- Custom WebView wrapper for Edge
- JavaScript injection for highlight functionality
- Communication bridge between RN and WebView
- Fallback for non-Edge environments

### 7. MVP Scope

#### Phase 1 (MVP)
1. Basic PDF upload and viewing
2. URL-to-article conversion
3. Simple highlighting (no colors)
4. Basic collections
5. Search functionality

#### Phase 2
1. Edge reader integration
2. Highlight colors and notes
3. Daily review feature
4. Tags system
5. Reading statistics

#### Phase 3
1. Advanced review algorithms
2. Export functionality
3. Batch operations
4. Reading goals
5. UI customization

### 8. Success Metrics

- **User Engagement**:
  - Daily active users
  - Average reading time per session
  - Number of highlights per user
  - Review completion rate

- **Performance**:
  - App launch time < 2 seconds
  - Article import success rate > 95%
  - Search response time < 500ms
  - Crash rate < 0.1%

### 9. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Edge WebView compatibility | High | Implement fallback reader |
| Large PDF performance | Medium | Implement pagination and lazy loading |
| Web scraping reliability | Medium | Multiple extraction methods, user feedback |
| Storage limitations | Low | Clear storage management UI |

### 10. Future Considerations

- Cloud backup option (opt-in)
- Social features (share highlights)
- AI-powered summarization
- Cross-platform sync (desktop app)
- Integration with other reading apps
- Audio article playback
