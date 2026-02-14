import { getDb } from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const chatModel = {
  /**
   * Create a new chat session
   */
  createSession(userId, title = null) {
    const db = getDb()
    const id = uuidv4()
    db.prepare(
      'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)'
    ).run(id, userId, title)
    return { id, userId, title }
  },

  /**
   * Get or create session
   */
  getOrCreateSession(sessionId, userId) {
    const db = getDb()
    let session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId)

    if (!session) {
      db.prepare(
        'INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)'
      ).run(sessionId, userId)
      session = { id: sessionId, user_id: userId, title: null }
    }

    return session
  },

  /**
   * Save a message to a session
   */
  addMessage(sessionId, role, content) {
    const db = getDb()
    db.prepare(
      'INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)'
    ).run(sessionId, role, content)
  },

  /**
   * Get all messages for a session
   */
  getMessages(sessionId, limit = 50) {
    const db = getDb()
    return db.prepare(
      'SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?'
    ).all(sessionId, limit)
  },

  /**
   * Get recent messages for AI context (last N messages)
   */
  getRecentMessages(sessionId, limit = 20) {
    const db = getDb()
    const rows = db.prepare(`
      SELECT role, content FROM chat_messages
      WHERE session_id = ? AND role IN ('user', 'assistant')
      ORDER BY created_at DESC LIMIT ?
    `).all(sessionId, limit)

    return rows.reverse() // oldest first
  },

  /**
   * Update session title (from first user message)
   */
  updateTitle(sessionId, title) {
    const db = getDb()
    db.prepare(
      'UPDATE chat_sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND title IS NULL'
    ).run(title.substring(0, 100), sessionId)
  },

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId) {
    const db = getDb()
    return db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as message_count,
        (SELECT content FROM chat_messages WHERE session_id = s.id AND role = 'user' ORDER BY created_at ASC LIMIT 1) as first_message
      FROM chat_sessions s
      WHERE s.user_id = ?
      ORDER BY s.updated_at DESC
    `).all(userId)
  },

  /**
   * Delete a session and its messages
   */
  deleteSession(sessionId) {
    const db = getDb()
    db.prepare('DELETE FROM chat_messages WHERE session_id = ?').run(sessionId)
    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId)
  },

  /**
   * Get all user messages (for preference extraction)
   */
  getAllUserMessages(userId, limit = 100) {
    const db = getDb()
    return db.prepare(`
      SELECT m.content, m.created_at
      FROM chat_messages m
      JOIN chat_sessions s ON m.session_id = s.id
      WHERE s.user_id = ? AND m.role = 'user'
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(userId, limit)
  },
}
