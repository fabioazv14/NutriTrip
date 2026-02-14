import { preferenceModel } from '../models/preference.model.js'
import { mealModel } from '../models/nutrition.model.js'

export const nutritionController = {
  /**
   * GET /api/nutrition/tags/:userId
   */
  async getTags(req, res, next) {
    try {
      const { userId } = req.params
      if (!userId) return res.status(400).json({ error: 'userId is required' })
      const tags = await preferenceModel.getTagsGrouped(parseInt(userId))
      res.json(tags)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/nutrition/tags
   * Body: { userId, type, tag, source? }
   */
  async addTag(req, res, next) {
    try {
      const { userId, type, tag, source = 'manual' } = req.body

      if (!userId || !type || !tag) {
        return res.status(400).json({ error: 'userId, type and tag are required' })
      }

      const validTypes = ['like', 'dislike', 'allergy', 'avoid', 'goal']
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` })
      }

      await preferenceModel.addTag(parseInt(userId), type, tag, source)
      const tags = await preferenceModel.getTagsGrouped(parseInt(userId))
      res.json(tags)
    } catch (error) {
      next(error)
    }
  },

  /**
   * DELETE /api/nutrition/tags/:userId/:tagId
   */
  async removeTag(req, res, next) {
    try {
      const { userId, tagId } = req.params
      if (!userId) return res.status(400).json({ error: 'userId is required' })
      await preferenceModel.removeTag(parseInt(userId), parseInt(tagId))
      const tags = await preferenceModel.getTagsGrouped(parseInt(userId))
      res.json(tags)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/nutrition/profile
   * Body: { userId, goal, diet, allergies, budget }
   */
  async saveProfile(req, res, next) {
    try {
      const { userId, ...profile } = req.body
      if (!userId) return res.status(400).json({ error: 'userId is required' })
      const result = await preferenceModel.saveProfile(parseInt(userId), profile)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/nutrition/profile/:userId
   */
  async getProfile(req, res, next) {
    try {
      const { userId } = req.params
      if (!userId) return res.status(400).json({ error: 'userId is required' })
      const profile = await preferenceModel.getProfile(parseInt(userId))
      res.json(profile || {})
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/nutrition/full-profile/:userId
   * Returns complete user info + profile + preferences for AI context
   */
  async getFullProfile(req, res, next) {
    try {
      const { userId } = req.params
      if (!userId) return res.status(400).json({ error: 'userId is required' })
      const profile = await preferenceModel.getFullProfile(parseInt(userId))
      res.json(profile)
    } catch (error) {
      next(error)
    }
  },

  // ─── Meal Logs ────────────────────────────────────────

  /**
   * POST /api/nutrition/meals
   * Body: { userId, mealType, name, note, image, calories, protein, carbs, fat }
   */
  async addMeal(req, res, next) {
    try {
      const {
        userId = 'guest',
        mealType,
        name,
        note,
        image,
        calories = 0,
        protein = 0,
        carbs = 0,
        fat = 0,
      } = req.body

      if (!mealType) {
        return res.status(400).json({ error: 'mealType is required' })
      }

      const meal = mealModel.add(userId, {
        mealType,
        name,
        note,
        imagePath: image || null,
        calories,
        protein,
        carbs,
        fat,
      })

      res.json(meal)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/nutrition/meals/:userId
   * Query: ?date=YYYY-MM-DD (optional, defaults to today)
   */
  async getMeals(req, res, next) {
    try {
      const { userId } = req.params
      const { date } = req.query

      let meals
      if (date) {
        meals = mealModel.getByDate(userId || 'guest', date)
      } else {
        meals = mealModel.getToday(userId || 'guest')
      }

      res.json(meals)
    } catch (error) {
      next(error)
    }
  },

  /**
   * DELETE /api/nutrition/meals/:userId/:mealId
   */
  async deleteMeal(req, res, next) {
    try {
      const { userId, mealId } = req.params
      mealModel.delete(parseInt(mealId), userId || 'guest')
      res.json({ success: true })
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/nutrition/meals/:userId/stats
   */
  async getMealStats(req, res, next) {
    try {
      const { userId } = req.params
      const stats = mealModel.getStats(userId || 'guest')
      res.json(stats)
    } catch (error) {
      next(error)
    }
  },
}
