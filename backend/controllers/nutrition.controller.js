import { userModel } from '../models/user.model.js'

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
}
