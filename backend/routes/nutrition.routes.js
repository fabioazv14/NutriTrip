import { Router } from 'express'
import { nutritionController } from '../controllers/nutrition.controller.js'

const router = Router()

router.get('/tags/:userId', nutritionController.getTags)
router.post('/tags', nutritionController.addTag)
router.delete('/tags/:userId/:tagId', nutritionController.removeTag)

export default router
