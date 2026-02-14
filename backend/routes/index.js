import { Router } from 'express'
import aiRoutes from './ai.routes.js'

export const router = Router()

router.use('/ai', aiRoutes)
