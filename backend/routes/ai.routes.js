import { Router } from 'express'
import { aiController } from '../controllers/ai.controller.js'

const router = Router()

router.post('/chat', aiController.chat)
router.post('/scan-meal', aiController.scanMeal)
router.post('/clear', aiController.clearHistory)
router.get('/history/:sessionId', aiController.getHistory)

export default router
