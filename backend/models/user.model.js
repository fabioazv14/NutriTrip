import pool from '../config/db.js'

export const userModel = {
  /**
   * Get user by ID with all related data
   */
  async getById(id) {
    const [rows] = await pool.execute(
      'SELECT Id, Email, Nome, Dob, Genero, UltimoPeriodo FROM Utilizador WHERE Id = ?',
      [id]
    )
    return rows[0] || null
  },

  /**
   * Get user by email
   */
  async getByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT Id, Email, Nome, Dob, Genero, UltimoPeriodo FROM Utilizador WHERE Email = ?',
      [email]
    )
    return rows[0] || null
  },

  /**
   * Get dietary restrictions for a user
   */
  async getRestrictions(userId) {
    const [rows] = await pool.execute(
      'SELECT Restricao FROM Restricao WHERE Utilizador = ?',
      [userId]
    )
    return rows.map((r) => r.Restricao)
  },

  /**
   * Get tags for a user
   */
  async getTags(userId) {
    const [rows] = await pool.execute(
      `SELECT t.Tipo FROM Tag t
       INNER JOIN UtilizadorTag ut ON ut.Tag = t.Id
       WHERE ut.Utilizador = ?`,
      [userId]
    )
    return rows.map((r) => r.Tipo)
  },

  /**
   * Get goals for a user
   */
  async getGoals(userId) {
    const [rows] = await pool.execute(
      'SELECT Descricao, Prazo FROM Objetivo WHERE Utilizador = ?',
      [userId]
    )
    return rows
  },

  /**
   * Get physical activities for a user
   */
  async getActivities(userId) {
    const [rows] = await pool.execute(
      'SELECT Atividade, Duracao FROM AtividadeFisica WHERE Utilizador = ?',
      [userId]
    )
    return rows
  },

  /**
   * Get full user profile with all related data for AI context
   */
  async getFullProfile(userId) {
    const user = await this.getById(userId)
    if (!user) return null

    const [restrictions, tags, goals, activities] = await Promise.all([
      this.getRestrictions(userId),
      this.getTags(userId),
      this.getGoals(userId),
      this.getActivities(userId),
    ])

    return {
      ...user,
      restrictions,
      tags,
      goals,
      activities,
    }
  },
}
