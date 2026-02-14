import { Router } from 'express'
import { nutritionController } from '../controllers/nutrition.controller.js'

const router = Router()

// Tags
router.get('/tags/:userId', nutritionController.getTags)
router.post('/tags', nutritionController.addTag)
router.delete('/tags/:userId/:tagId', nutritionController.removeTag)

// Meals
router.post('/meals', nutritionController.addMeal)
router.get('/meals/:userId', nutritionController.getMeals)
router.get('/meals/:userId/stats', nutritionController.getMealStats)
router.delete('/meals/:userId/:mealId', nutritionController.deleteMeal)

export default router
