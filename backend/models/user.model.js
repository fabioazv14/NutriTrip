import { getDb } from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'

export const userModel = {
  /**
   * Create a new user
   */
  create(name, email, passwordHash = null) {
    const db = getDb()
    const id = uuidv4()
    db.prepare(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
    ).run(id, name, email, passwordHash)
    return this.findById(id)
  },

  /**
   * Find user by ID
   */
  findById(id) {
    const db = getDb()
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  },

  /**
   * Find user by email
   */
  findByEmail(email) {
    const db = getDb()
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  },

  /**
   * Get or create guest user
   */
  getGuest() {
    return this.findById('guest')
  },

  // ─── Profile ──────────────────────────────────

  /**
   * Save user profile (onboarding answers)
   */
  saveProfile(userId, profile) {
    const db = getDb()
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(userId)

    const diet = Array.isArray(profile.diet) ? JSON.stringify(profile.diet) : profile.diet
    const allergies = Array.isArray(profile.allergies) ? JSON.stringify(profile.allergies) : profile.allergies

    if (existing) {
      db.prepare(`
        UPDATE user_profiles
        SET goal = ?, diet = ?, allergies = ?, budget = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(profile.goal, diet, allergies, profile.budget, userId)
    } else {
      db.prepare(`
        INSERT INTO user_profiles (user_id, goal, diet, allergies, budget)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, profile.goal, diet, allergies, profile.budget)
    }

    return this.getProfile(userId)
  },

  /**
   * Get user profile
   */
  getProfile(userId) {
    const db = getDb()
    const row = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId)
    if (!row) return null

    return {
      ...row,
      diet: row.diet ? JSON.parse(row.diet) : null,
      allergies: row.allergies ? JSON.parse(row.allergies) : null,
    }
  },

  // ─── Food Preference Tags ─────────────────

  /**
   * Add a preference tag (e.g. "no milk", "likes chicken")
   */
  addTag(userId, type, tag, source = 'chat') {
    const db = getDb()
    db.prepare(`
      INSERT INTO food_preferences (user_id, preference_type, tag, source)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, tag, preference_type) DO NOTHING
    `).run(userId, type, tag.toLowerCase().trim(), source)
  },

  /**
   * Add multiple tags at once
   */
  addTags(userId, tags, source = 'chat') {
    const db = getDb()
    const stmt = db.prepare(`
      INSERT INTO food_preferences (user_id, preference_type, tag, source)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, tag, preference_type) DO NOTHING
    `)
    const insertMany = db.transaction((items) => {
      for (const { type, tag } of items) {
        stmt.run(userId, type, tag.toLowerCase().trim(), source)
      }
    })
    insertMany(tags)
  },

  /**
   * Remove a specific tag
   */
  removeTag(userId, tagId) {
    const db = getDb()
    db.prepare('DELETE FROM food_preferences WHERE id = ? AND user_id = ?').run(tagId, userId)
  },

  /**
   * Get all tags for a user
   */
  getTags(userId) {
    const db = getDb()
    return db.prepare(
      'SELECT * FROM food_preferences WHERE user_id = ? ORDER BY preference_type, tag'
    ).all(userId)
  },

  /**
   * Get tags grouped by type
   */
  getTagsGrouped(userId) {
    const tags = this.getTags(userId)
    return {
      likes: tags.filter(t => t.preference_type === 'like').map(t => ({ id: t.id, tag: t.tag, source: t.source })),
      dislikes: tags.filter(t => t.preference_type === 'dislike').map(t => ({ id: t.id, tag: t.tag, source: t.source })),
      allergies: tags.filter(t => t.preference_type === 'allergy').map(t => ({ id: t.id, tag: t.tag, source: t.source })),
      avoids: tags.filter(t => t.preference_type === 'avoid').map(t => ({ id: t.id, tag: t.tag, source: t.source })),
      goals: tags.filter(t => t.preference_type === 'goal').map(t => ({ id: t.id, tag: t.tag, source: t.source })),
    }
  },

  /**
   * Get tags as a flat summary for AI context
   */
  getTagsSummary(userId) {
    const grouped = this.getTagsGrouped(userId)
    const parts = []
    if (grouped.likes.length) parts.push(`Likes: ${grouped.likes.map(t => t.tag).join(', ')}`)
    if (grouped.dislikes.length) parts.push(`Dislikes: ${grouped.dislikes.map(t => t.tag).join(', ')}`)
    if (grouped.allergies.length) parts.push(`Allergies: ${grouped.allergies.map(t => t.tag).join(', ')}`)
    if (grouped.avoids.length) parts.push(`Avoids: ${grouped.avoids.map(t => t.tag).join(', ')}`)
    if (grouped.goals.length) parts.push(`Goals: ${grouped.goals.map(t => t.tag).join(', ')}`)
    return parts.join('\n')
  },
}
