import { query } from '../config/mysql.js'

/**
 * User model — uses MySQL Utilizador table.
 * All methods are async (MySQL driver is promise-based).
 *
 * Profile and tag methods delegate to the MySQL tables
 * (PerfilUtilizador, PreferenciaAprendida) which are also
 * handled by preference.model.js.
 */
export const userModel = {
  /**
   * Create a new user in the Utilizador table
   */
  async create(name, email, passwordHash = null) {
    // No AUTO_INCREMENT — manually get next id
    const [maxRow] = await query('SELECT MAX(Id) as maxId FROM Utilizador')
    const nextId = (maxRow?.maxId || 0) + 1

    await query(
      'INSERT INTO Utilizador (Id, Nome, Email, Password, Dob, Genero) VALUES (?, ?, ?, ?, ?, ?)',
      [nextId, name, email, passwordHash, '2000-01-01', 'O']
    )
    return this.findById(nextId)
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const rows = await query('SELECT * FROM Utilizador WHERE Id = ?', [id])
    if (rows.length === 0) return null
    const u = rows[0]
    return {
      id: u.Id,
      name: u.Nome,
      email: u.Email,
      password_hash: u.Password,
      dob: u.Dob,
      gender: u.Genero,
    }
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const rows = await query('SELECT * FROM Utilizador WHERE Email = ?', [email])
    if (rows.length === 0) return null
    const u = rows[0]
    return {
      id: u.Id,
      name: u.Nome,
      email: u.Email,
      password_hash: u.Password,
      dob: u.Dob,
      gender: u.Genero,
    }
  },

  // ─── Profile ──────────────────────────────────

  /**
   * Save user profile (onboarding answers)
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
   * Get user profile
   */
  async getProfile(userId) {
    const rows = await query('SELECT * FROM PerfilUtilizador WHERE Utilizador = ?', [userId])
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

  // ─── Food Preference Tags ─────────────────

  /**
   * Add a preference tag
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
   * Add multiple tags at once
   */
  async addTags(userId, tags, source = 'chat') {
    if (!tags || tags.length === 0) return

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
   * Remove a specific tag
   */
  async removeTag(userId, tagId) {
    await query(
      'DELETE FROM PreferenciaAprendida WHERE Id = ? AND Utilizador = ?',
      [tagId, userId]
    )
  },

  /**
   * Get all tags for a user
   */
  async getTags(userId) {
    return query(
      'SELECT * FROM PreferenciaAprendida WHERE Utilizador = ? ORDER BY Tipo, Tag',
      [userId]
    )
  },

  /**
   * Get tags grouped by type
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
   * Get tags as a flat summary for AI context
   */
  async getTagsSummary(userId) {
    const grouped = await this.getTagsGrouped(userId)
    const parts = []
    if (grouped.likes.length) parts.push(`Likes: ${grouped.likes.map(t => t.tag).join(', ')}`)
    if (grouped.dislikes.length) parts.push(`Dislikes: ${grouped.dislikes.map(t => t.tag).join(', ')}`)
    if (grouped.allergies.length) parts.push(`Allergies: ${grouped.allergies.map(t => t.tag).join(', ')}`)
    if (grouped.avoids.length) parts.push(`Avoids: ${grouped.avoids.map(t => t.tag).join(', ')}`)
    if (grouped.goals.length) parts.push(`Goals: ${grouped.goals.map(t => t.tag).join(', ')}`)
    return parts.join('\n')
  },
}
