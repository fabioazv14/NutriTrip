import { userModel } from '../models/user.model.js'
import { mealModel } from '../models/nutrition.model.js'

export const nutritionController = {
  /**
   * GET /api/nutrition/tags/:userId
   */
  async getTags(req, res, next) {
    try {
      const { userId } = req.params
      const tags = userModel.getTagsGrouped(userId || 'guest')
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
      const { userId = 'guest', type, tag, source = 'manual' } = req.body

      if (!type || !tag) {
        return res.status(400).json({ error: 'Type and tag are required' })
      }

      const validTypes = ['like', 'dislike', 'allergy', 'avoid', 'goal']
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` })
      }

      userModel.addTag(userId, type, tag, source)
      const tags = userModel.getTagsGrouped(userId)
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
      userModel.removeTag(userId || 'guest', parseInt(tagId))
      const tags = userModel.getTagsGrouped(userId || 'guest')
      res.json(tags)
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
