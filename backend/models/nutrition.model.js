import { getDb } from '../config/db.js'

export const mealModel = {
  /**
   * Log a meal
   */
  add(userId, { mealType, name = null, note = null, imagePath = null, calories = 0, protein = 0, carbs = 0, fat = 0 }) {
    const db = getDb()
    const result = db.prepare(`
      INSERT INTO meal_logs (user_id, meal_type, name, note, image_path, calories, protein, carbs, fat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, mealType, name, note, imagePath, calories, protein, carbs, fat)

    return this.getById(result.lastInsertRowid)
  },

  /**
   * Get a meal by ID
   */
  getById(id) {
    const db = getDb()
    return db.prepare('SELECT * FROM meal_logs WHERE id = ?').get(id)
  },

  /**
   * Get meals for a user on a specific date
   */
  getByDate(userId, date) {
    const db = getDb()
    return db.prepare(`
      SELECT * FROM meal_logs
      WHERE user_id = ? AND DATE(logged_at) = DATE(?)
      ORDER BY logged_at DESC
    `).all(userId, date)
  },

  /**
   * Get today's meals
   */
  getToday(userId) {
    return this.getByDate(userId, new Date().toISOString())
  },

  /**
   * Get recent meals (last N days)
   */
  getRecent(userId, days = 7) {
    const db = getDb()
    return db.prepare(`
      SELECT * FROM meal_logs
      WHERE user_id = ? AND logged_at >= datetime('now', ?)
      ORDER BY logged_at DESC
    `).all(userId, `-${days} days`)
  },

  /**
   * Delete a meal
   */
  delete(mealId, userId) {
    const db = getDb()
    db.prepare('DELETE FROM meal_logs WHERE id = ? AND user_id = ?').run(mealId, userId)
  },

  /**
   * Get meal stats for a user
   */
  getStats(userId) {
    const db = getDb()
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM meal_logs
      WHERE user_id = ? AND DATE(logged_at) = DATE('now')
    `).get(userId)

    const weekCount = db.prepare(`
      SELECT COUNT(*) as count FROM meal_logs
      WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
    `).get(userId)

    const byType = db.prepare(`
      SELECT meal_type, COUNT(*) as count FROM meal_logs
      WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
      GROUP BY meal_type
    `).all(userId)

    return {
      today: todayCount.count,
      thisWeek: weekCount.count,
      byType: Object.fromEntries(byType.map(r => [r.meal_type, r.count])),
    }
  },
}
