import { aiService } from '../services/ai.service.js'

export const aiController = {
  /**
   * POST /api/ai/chat
   */
  async chat(req, res, next) {
    try {
      const { message, sessionId, userProfile } = req.body

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' })
      }

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' })
      }

      const result = await aiService.chat(sessionId, message.trim(), userProfile)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/ai/scan-meal
   */
  async scanMeal(req, res, next) {
    try {
      const { image, mealType } = req.body

      if (!image) {
        return res.status(400).json({ error: 'Image is required' })
      }

      const result = await aiService.scanMeal(image, mealType || 'meal')
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/ai/clear
   */
  async clearHistory(req, res, next) {
    try {
      const { sessionId } = req.body

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' })
      }

      aiService.clearHistory(sessionId)
      res.json({ success: true })
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/ai/history/:sessionId
   */
  async getHistory(req, res, next) {
    try {
      const { sessionId } = req.params
      const history = aiService.getHistory(sessionId)
      res.json({ history, sessionId })
    } catch (error) {
      next(error)
    }
  },
}
