import pool from '../config/db.js'

export const nutritionModel = {
  /**
   * Get all meals for a user
   */
  async getMeals(userId) {
    const [rows] = await pool.execute(
      `SELECT r.Id, r.Tipo, r.Designacao, t.Tipo AS TagTipo
       FROM Refeicao r
       LEFT JOIN Tag t ON r.Tag = t.Id
       WHERE r.Utilizador = ?
       ORDER BY r.Id DESC`,
      [userId]
    )
    return rows
  },

  /**
   * Get meals with their foods for a user
   */
  async getMealsWithFoods(userId) {
    const meals = await this.getMeals(userId)

    for (const meal of meals) {
      const [foods] = await pool.execute(
        `SELECT a.Designacao
         FROM RefeicaoAlimento ra
         INNER JOIN Alimento a ON ra.Alimento = a.Id
         WHERE ra.Refeicao = ? AND ra.Utilizador = ?`,
        [meal.Id, userId]
      )
      meal.alimentos = foods.map((f) => f.Designacao)
    }

    return meals
  },

  /**
   * Get recent meals (last N) with foods for AI context
   */
  async getRecentMeals(userId, limit = 10) {
    const safeLimit = parseInt(limit) || 10
    const [meals] = await pool.execute(
      `SELECT r.Id, r.Tipo, r.Designacao, t.Tipo AS TagTipo
       FROM Refeicao r
       LEFT JOIN Tag t ON r.Tag = t.Id
       WHERE r.Utilizador = ?
       ORDER BY r.Id DESC
       LIMIT ${safeLimit}`,
      [userId]
    )

    for (const meal of meals) {
      const [foods] = await pool.execute(
        `SELECT a.Designacao
         FROM RefeicaoAlimento ra
         INNER JOIN Alimento a ON ra.Alimento = a.Id
         WHERE ra.Refeicao = ? AND ra.Utilizador = ?`,
        [meal.Id, userId]
      )
      meal.alimentos = foods.map((f) => f.Designacao)
    }

    return meals
  },
}
