import * as SQLite from 'expo-sqlite';

export interface Document {
  id?: number;
  type: 'pdf' | 'article';
  title: string;
  author?: string;
  source_url?: string;
  file_path?: string;
  content?: string;
  metadata?: any;
  created_at?: string;
  last_read_at?: string;
  reading_progress?: number;
}

export interface Collection {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
}

export interface Highlight {
  id?: number;
  document_id: number;
  text: string;
  note?: string;
  color?: string;
  position?: any;
  created_at?: string;
  last_reviewed_at?: string;
  review_count?: number;
  mastered?: boolean;
  document_title?: string; // Added for join queries
}

export interface Tag {
  id?: number;
  name: string;
}

export interface ReadingSession {
  id?: number;
  document_id: number;
  start_time?: string;
  end_time?: string;
  progress_start?: number;
  progress_end?: number;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('reading_app.db');
    
    // Create tables
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const createTablesSQL = `
      -- Documents table
      CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK(type IN ('pdf', 'article')),
          title TEXT NOT NULL,
          author TEXT,
          source_url TEXT,
          file_path TEXT,
          content TEXT,
          metadata TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_read_at TIMESTAMP,
          reading_progress REAL DEFAULT 0
      );

      -- Collections table
      CREATE TABLE IF NOT EXISTS collections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Document-Collection relationship
      CREATE TABLE IF NOT EXISTS document_collections (
          document_id INTEGER,
          collection_id INTEGER,
          FOREIGN KEY (document_id) REFERENCES documents(id),
          FOREIGN KEY (collection_id) REFERENCES collections(id),
          PRIMARY KEY (document_id, collection_id)
      );

      -- Highlights table
      CREATE TABLE IF NOT EXISTS highlights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          note TEXT,
          color TEXT DEFAULT '#FFFF00',
          position TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_reviewed_at TIMESTAMP,
          review_count INTEGER DEFAULT 0,
          mastered BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (document_id) REFERENCES documents(id)
      );

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
      );

      -- Document-Tag relationship
      CREATE TABLE IF NOT EXISTS document_tags (
          document_id INTEGER,
          tag_id INTEGER,
          FOREIGN KEY (document_id) REFERENCES documents(id),
          FOREIGN KEY (tag_id) REFERENCES tags(id),
          PRIMARY KEY (document_id, tag_id)
      );

      -- Reading sessions
      CREATE TABLE IF NOT EXISTS reading_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          document_id INTEGER NOT NULL,
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP,
          progress_start REAL,
          progress_end REAL,
          FOREIGN KEY (document_id) REFERENCES documents(id)
      );
    `;

    await this.db.execAsync(createTablesSQL);
  }

  // Document operations
  async addDocument(document: Document): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      `INSERT INTO documents (type, title, author, source_url, file_path, content, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        document.type,
        document.title,
        document.author || null,
        document.source_url || null,
        document.file_path || null,
        document.content || null,
        document.metadata ? JSON.stringify(document.metadata) : null
      ]
    );
    
    return result.lastInsertRowId;
  }

  async getDocuments(): Promise<Document[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      `SELECT * FROM documents ORDER BY created_at DESC`
    );
    
    return result.map((row: any) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  }

  async getDocumentById(id: number): Promise<Document | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync(
      `SELECT * FROM documents WHERE id = ?`,
      [id]
    );
    
    if (!result) return null;
    
    return {
      ...(result as any),
      metadata: (result as any).metadata ? JSON.parse((result as any).metadata) : null
    };
  }

  async updateDocumentProgress(id: number, progress: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      `UPDATE documents SET reading_progress = ?, last_read_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [progress, id]
    );
  }

  // Collection operations
  async addCollection(collection: Collection): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      `INSERT INTO collections (name, description, color) VALUES (?, ?, ?)`,
      [collection.name, collection.description || null, collection.color || null]
    );
    
    return result.lastInsertRowId;
  }

  async getCollections(): Promise<Collection[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllAsync(`SELECT * FROM collections ORDER BY name`);
  }

  async addDocumentToCollection(documentId: number, collectionId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      `INSERT OR IGNORE INTO document_collections (document_id, collection_id) VALUES (?, ?)`,
      [documentId, collectionId]
    );
  }

  // Highlight operations
  async addHighlight(highlight: Highlight): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      `INSERT INTO highlights (document_id, text, note, color, position) VALUES (?, ?, ?, ?, ?)`,
      [
        highlight.document_id,
        highlight.text,
        highlight.note || null,
        highlight.color || '#FFFF00',
        highlight.position ? JSON.stringify(highlight.position) : null
      ]
    );
    
    return result.lastInsertRowId;
  }

  async getHighlightsForDocument(documentId: number): Promise<Highlight[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      `SELECT * FROM highlights WHERE document_id = ? ORDER BY created_at DESC`,
      [documentId]
    );
    
    return result.map((row: any) => ({
      ...row,
      position: row.position ? JSON.parse(row.position) : null
    }));
  }

  async getHighlightsForReview(limit: number = 10): Promise<Highlight[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      `SELECT h.*, d.title as document_title 
       FROM highlights h 
       JOIN documents d ON h.document_id = d.id 
       WHERE h.mastered = FALSE 
       ORDER BY h.last_reviewed_at ASC NULLS FIRST, h.created_at ASC 
       LIMIT ?`,
      [limit]
    );
    
    return result.map((row: any) => ({
      ...row,
      position: row.position ? JSON.parse(row.position) : null
    }));
  }

  async updateHighlightReview(highlightId: number, mastered: boolean): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      `UPDATE highlights SET 
       last_reviewed_at = CURRENT_TIMESTAMP, 
       review_count = review_count + 1,
       mastered = ? 
       WHERE id = ?`,
      [mastered, highlightId]
    );
  }

  // Tag operations
  async addTag(tag: Tag): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      `INSERT OR IGNORE INTO tags (name) VALUES (?)`,
      [tag.name]
    );
    
    return result.lastInsertRowId;
  }

  async getTags(): Promise<Tag[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllAsync(`SELECT * FROM tags ORDER BY name`);
  }

  async addDocumentTag(documentId: number, tagId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      `INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)`,
      [documentId, tagId]
    );
  }

  // Reading session operations
  async startReadingSession(session: ReadingSession): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(
      `INSERT INTO reading_sessions (document_id, progress_start) VALUES (?, ?)`,
      [session.document_id, session.progress_start || 0]
    );
    
    return result.lastInsertRowId;
  }

  async endReadingSession(sessionId: number, progressEnd: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.runAsync(
      `UPDATE reading_sessions SET end_time = CURRENT_TIMESTAMP, progress_end = ? WHERE id = ?`,
      [progressEnd, sessionId]
    );
  }

  // Search operations
  async searchDocuments(query: string): Promise<Document[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      `SELECT * FROM documents 
       WHERE title LIKE ? OR author LIKE ? OR content LIKE ?
       ORDER BY created_at DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    
    return result.map((row: any) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  }

  async searchHighlights(query: string): Promise<Highlight[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync(
      `SELECT h.*, d.title as document_title 
       FROM highlights h 
       JOIN documents d ON h.document_id = d.id 
       WHERE h.text LIKE ? OR h.note LIKE ?
       ORDER BY h.created_at DESC`,
      [`%${query}%`, `%${query}%`]
    );
    
    return result.map((row: any) => ({
      ...row,
      position: row.position ? JSON.parse(row.position) : null
    }));
  }
}

export const databaseService = new DatabaseService();