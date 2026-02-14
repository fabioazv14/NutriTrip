import { Router } from 'express'
import aiRoutes from './ai.routes.js'
import nutritionRoutes from './nutrition.routes.js'

export const router = Router()

router.use('/ai', aiRoutes)
router.use('/nutrition', nutritionRoutes)
