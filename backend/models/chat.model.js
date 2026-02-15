import { query } from '../config/mysql.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Chat model — uses MySQL ChatSession / ChatMensagem tables.
 * All methods are async (MySQL driver is promise-based).
 */
export const chatModel = {
  /**
   * Create a new chat session
   */
  async createSession(userId, title = null) {
    const id = uuidv4()
    await query(
      'INSERT INTO ChatSession (Id, Utilizador, Titulo) VALUES (?, ?, ?)',
      [id, userId, title]
    )
    return { id, userId, title }
  },

  /**
   * Get or create session
   */
  async getOrCreateSession(sessionId, userId) {
    const rows = await query('SELECT * FROM ChatSession WHERE Id = ?', [sessionId])

    if (rows.length === 0) {
      await query(
        'INSERT INTO ChatSession (Id, Utilizador) VALUES (?, ?)',
        [sessionId, userId]
      )
      return { id: sessionId, user_id: userId, title: null }
    }

    const s = rows[0]
    return { id: s.Id, user_id: s.Utilizador, title: s.Titulo }
  },

  /**
   * Save a message to a session
   */
  async addMessage(sessionId, role, content) {
    await query(
      'INSERT INTO ChatMensagem (Sessao, Role, Conteudo) VALUES (?, ?, ?)',
      [sessionId, role, content]
    )
  },

  /**
   * Get all messages for a session
   */
  async getMessages(sessionId, limit = 50) {
    const rows = await query(
      'SELECT Role as role, Conteudo as content, CriadoEm as created_at FROM ChatMensagem WHERE Sessao = ? ORDER BY CriadoEm ASC LIMIT ?',
      [sessionId, limit]
    )
    return rows
  },

  /**
   * Get recent messages for AI context (last N messages)
   */
  async getRecentMessages(sessionId, limit = 20) {
    const rows = await query(
      `SELECT Role as role, Conteudo as content FROM ChatMensagem
       WHERE Sessao = ? AND Role IN ('user', 'assistant')
       ORDER BY CriadoEm DESC LIMIT ?`,
      [sessionId, limit]
    )
    return rows.reverse() // oldest first
  },

  /**
   * Update session title (from first user message)
   */
  async updateTitle(sessionId, title) {
    await query(
      'UPDATE ChatSession SET Titulo = ?, AtualizadoEm = CURRENT_TIMESTAMP WHERE Id = ? AND Titulo IS NULL',
      [title.substring(0, 100), sessionId]
    )
  },

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId) {
    const rows = await query(
      `SELECT s.*,
        (SELECT COUNT(*) FROM ChatMensagem WHERE Sessao = s.Id) as message_count,
        (SELECT Conteudo FROM ChatMensagem WHERE Sessao = s.Id AND Role = 'user' ORDER BY CriadoEm ASC LIMIT 1) as first_message
       FROM ChatSession s
       WHERE s.Utilizador = ?
       ORDER BY s.AtualizadoEm DESC`,
      [userId]
    )
    return rows.map(s => ({
      id: s.Id,
      user_id: s.Utilizador,
      title: s.Titulo,
      created_at: s.CriadoEm,
      updated_at: s.AtualizadoEm,
      message_count: s.message_count,
      first_message: s.first_message,
    }))
  },

  /**
   * Delete a session and its messages
   */
  async deleteSession(sessionId) {
    await query('DELETE FROM ChatMensagem WHERE Sessao = ?', [sessionId])
    await query('DELETE FROM ChatSession WHERE Id = ?', [sessionId])
  },

  /**
   * Get all user messages (for preference extraction)
   */
  async getAllUserMessages(userId, limit = 100) {
    const rows = await query(
      `SELECT m.Conteudo as content, m.CriadoEm as created_at
       FROM ChatMensagem m
       JOIN ChatSession s ON m.Sessao = s.Id
       WHERE s.Utilizador = ? AND m.Role = 'user'
       ORDER BY m.CriadoEm DESC
       LIMIT ?`,
      [userId, limit]
    )
    return rows
  },
}
