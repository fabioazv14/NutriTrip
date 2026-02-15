import { query } from '../config/mysql.js'

/**
 * Meal model — uses MySQL RegistoRefeicao table.
 * All methods are async (MySQL driver is promise-based).
 */
export const mealModel = {
  /**
   * Log a meal
   */
  async add(userId, { mealType, name = null, note = null, imagePath = null, calories = 0, protein = 0, carbs = 0, fat = 0 }) {
    const result = await query(
      `INSERT INTO RegistoRefeicao (Utilizador, TipoRefeicao, Nome, Notas, Imagem, Calorias, Proteina, Hidratos, Gordura)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, mealType, name, note, imagePath, calories, protein, carbs, fat]
    )

    return this.getById(result.insertId)
  },

  /**
   * Get a meal by ID
   */
  async getById(id) {
    const rows = await query('SELECT * FROM RegistoRefeicao WHERE Id = ?', [id])
    return rows.length > 0 ? this._mapRow(rows[0]) : null
  },

  /**
   * Get meals for a user on a specific date
   */
  async getByDate(userId, date) {
    const rows = await query(
      `SELECT * FROM RegistoRefeicao
       WHERE Utilizador = ? AND DATE(RegistadoEm) = DATE(?)
       ORDER BY RegistadoEm DESC`,
      [userId, date]
    )
    return rows.map(this._mapRow)
  },

  /**
   * Get today's meals
   */
  async getToday(userId) {
    const rows = await query(
      `SELECT * FROM RegistoRefeicao
       WHERE Utilizador = ? AND DATE(RegistadoEm) = CURDATE()
       ORDER BY RegistadoEm DESC`,
      [userId]
    )
    return rows.map(this._mapRow)
  },

  /**
   * Get recent meals (last N days)
   */
  async getRecent(userId, days = 7) {
    const rows = await query(
      `SELECT * FROM RegistoRefeicao
       WHERE Utilizador = ? AND RegistadoEm >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY RegistadoEm DESC`,
      [userId, days]
    )
    return rows.map(this._mapRow)
  },

  /**
   * Delete a meal
   */
  async delete(mealId, userId) {
    await query(
      'DELETE FROM RegistoRefeicao WHERE Id = ? AND Utilizador = ?',
      [mealId, userId]
    )
  },

  /**
   * Get meal stats for a user
   */
  async getStats(userId) {
    const [todayCount] = await query(
      `SELECT COUNT(*) as count FROM RegistoRefeicao
       WHERE Utilizador = ? AND DATE(RegistadoEm) = CURDATE()`,
      [userId]
    )

    const [weekCount] = await query(
      `SELECT COUNT(*) as count FROM RegistoRefeicao
       WHERE Utilizador = ? AND RegistadoEm >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    )

    const byType = await query(
      `SELECT TipoRefeicao as meal_type, COUNT(*) as count FROM RegistoRefeicao
       WHERE Utilizador = ? AND RegistadoEm >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY TipoRefeicao`,
      [userId]
    )

    return {
      today: todayCount.count,
      thisWeek: weekCount.count,
      byType: Object.fromEntries(byType.map(r => [r.meal_type, r.count])),
    }
  },

  /**
   * Map a MySQL row to the shape the rest of the app expects
   */
  _mapRow(row) {
    return {
      id: row.Id,
      user_id: row.Utilizador,
      meal_type: row.TipoRefeicao,
      name: row.Nome,
      note: row.Notas,
      image_path: row.Imagem,
      calories: row.Calorias,
      protein: row.Proteina,
      carbs: row.Hidratos,
      fat: row.Gordura,
      logged_at: row.RegistadoEm,
    }
  },
}
