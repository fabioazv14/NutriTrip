import { query } from '../config/mysql.js'

/**
 * Preference model — stores and retrieves learned food preferences
 * and user profile data in MySQL, linked to the Utilizador table.
 *
 * All methods are async (MySQL driver is promise-based).
 */
export const preferenceModel = {
  // ─── Profile (onboarding) ──────────────────────────

  /**
   * Save or update onboarding profile for a user
   */
  async saveProfile(userId, profile) {
    const diet = Array.isArray(profile.diet) ? JSON.stringify(profile.diet) : (profile.diet || null)
    const allergies = Array.isArray(profile.allergies) ? JSON.stringify(profile.allergies) : (profile.allergies || null)

    await query(
      `INSERT INTO PerfilUtilizador (Utilizador, Objetivo, Dieta, Alergias, Orcamento)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         Objetivo = VALUES(Objetivo),
         Dieta = VALUES(Dieta),
         Alergias = VALUES(Alergias),
         Orcamento = VALUES(Orcamento)`,
      [userId, profile.goal || null, diet, allergies, profile.budget || null]
    )

    return this.getProfile(userId)
  },

  /**
   * Get onboarding profile for a user
   */
  async getProfile(userId) {
    const rows = await query(
      'SELECT * FROM PerfilUtilizador WHERE Utilizador = ?',
      [userId]
    )
    if (rows.length === 0) return null

    const row = rows[0]
    return {
      userId: row.Utilizador,
      goal: row.Objetivo,
      diet: row.Dieta ? (typeof row.Dieta === 'string' ? JSON.parse(row.Dieta) : row.Dieta) : null,
      allergies: row.Alergias ? (typeof row.Alergias === 'string' ? JSON.parse(row.Alergias) : row.Alergias) : null,
      budget: row.Orcamento,
    }
  },

  // ─── Learned Preference Tags ───────────────────────

  /**
   * Add a single preference tag
   */
  async addTag(userId, type, tag, source = 'chat') {
    await query(
      `INSERT INTO PreferenciaAprendida (Utilizador, Tipo, Tag, Fonte)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE Fonte = VALUES(Fonte)`,
      [userId, type, tag.toLowerCase().trim(), source]
    )
  },

  /**
   * Add multiple tags at once (from AI extraction)
   */
  async addTags(userId, tags, source = 'chat') {
    if (!tags || tags.length === 0) return

    // Build batch insert with ON DUPLICATE KEY
    const values = []
    const placeholders = []
    for (const { type, tag } of tags) {
      placeholders.push('(?, ?, ?, ?)')
      values.push(userId, type, tag.toLowerCase().trim(), source)
    }

    await query(
      `INSERT INTO PreferenciaAprendida (Utilizador, Tipo, Tag, Fonte)
       VALUES ${placeholders.join(', ')}
       ON DUPLICATE KEY UPDATE Fonte = VALUES(Fonte)`,
      values
    )
  },

  /**
   * Remove a specific learned preference
   */
  async removeTag(userId, tagId) {
    await query(
      'DELETE FROM PreferenciaAprendida WHERE Id = ? AND Utilizador = ?',
      [tagId, userId]
    )
  },

  /**
   * Get all learned preferences for a user
   */
  async getTags(userId) {
    return query(
      'SELECT * FROM PreferenciaAprendida WHERE Utilizador = ? ORDER BY Tipo, Tag',
      [userId]
    )
  },

  /**
   * Get learned preferences grouped by type
   */
  async getTagsGrouped(userId) {
    const tags = await this.getTags(userId)
    return {
      likes: tags.filter(t => t.Tipo === 'like').map(t => ({ id: t.Id, tag: t.Tag, source: t.Fonte })),
      dislikes: tags.filter(t => t.Tipo === 'dislike').map(t => ({ id: t.Id, tag: t.Tag, source: t.Fonte })),
      allergies: tags.filter(t => t.Tipo === 'allergy').map(t => ({ id: t.Id, tag: t.Tag, source: t.Fonte })),
      avoids: tags.filter(t => t.Tipo === 'avoid').map(t => ({ id: t.Id, tag: t.Tag, source: t.Fonte })),
      goals: tags.filter(t => t.Tipo === 'goal').map(t => ({ id: t.Id, tag: t.Tag, source: t.Fonte })),
    }
  },

  /**
   * Get a complete preference summary for AI context.
   * Combines: learned preferences + Restricao + UtilizadorTag + PerfilUtilizador
   */
  async getTagsSummary(userId) {
    // 1. Learned preferences
    const grouped = await this.getTagsGrouped(userId)

    // 2. Existing restrictions from Restricao table
    const restricoes = await query(
      'SELECT Restricao FROM Restricao WHERE Utilizador = ?',
      [userId]
    )

    // 3. Existing tags from UtilizadorTag + Tag tables
    const userTags = await query(
      `SELECT t.Tipo FROM UtilizadorTag ut
       JOIN Tag t ON ut.Tag = t.Id
       WHERE ut.Utilizador = ?`,
      [userId]
    )

    const parts = []

    // Dietary tags (from Tag table)
    if (userTags.length > 0) {
      parts.push(`Dietary tags: ${userTags.map(t => t.Tipo).join(', ')}`)
    }

    // Restrictions (from Restricao table)
    if (restricoes.length > 0) {
      parts.push(`Restrictions: ${restricoes.map(r => r.Restricao).join(', ')}`)
    }

    // Learned preferences
    if (grouped.likes.length) parts.push(`Likes: ${grouped.likes.map(t => t.tag).join(', ')}`)
    if (grouped.dislikes.length) parts.push(`Dislikes: ${grouped.dislikes.map(t => t.tag).join(', ')}`)
    if (grouped.allergies.length) parts.push(`Allergies: ${grouped.allergies.map(t => t.tag).join(', ')}`)
    if (grouped.avoids.length) parts.push(`Avoids: ${grouped.avoids.map(t => t.tag).join(', ')}`)
    if (grouped.goals.length) parts.push(`Goals: ${grouped.goals.map(t => t.tag).join(', ')}`)

    return parts.join('\n')
  },

  /**
   * Get full user info from Utilizador for AI context
   */
  async getUserInfo(userId) {
    const rows = await query(
      'SELECT Id, Email, Nome, Dob, Genero FROM Utilizador WHERE Id = ?',
      [userId]
    )
    if (rows.length === 0) return null

    const u = rows[0]
    return {
      userId: u.Id,
      name: u.Nome,
      email: u.Email,
      dob: u.Dob,
      gender: u.Genero,
    }
  },

  /**
   * Build a complete user profile for AI context (combines Utilizador + Profile + Preferences)
   */
  async getFullProfile(userId) {
    const [userInfo, profile, tagsSummary] = await Promise.all([
      this.getUserInfo(userId),
      this.getProfile(userId),
      this.getTagsSummary(userId),
    ])

    return {
      ...(userInfo || {}),
      ...(profile || {}),
      userId,
      tagsSummary,
    }
  },
}
