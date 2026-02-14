import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { SYSTEM_PROMPT, TAG_EXTRACTION_SUFFIX, buildUserContext, buildMealsSummary, parseTagsFromResponse } from '../utils/prompts.js'
import { preferenceModel } from '../models/preference.model.js'
import { mealModel } from '../models/nutrition.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const IA_DIR = join(__dirname, '..', 'ia')
const PYTHON_BIN = join(IA_DIR, 'venv', 'bin', 'python3')
const PYTHON_SCRIPT = join(IA_DIR, 'ia_api.py')
const PYTHON_VISION_SCRIPT = join(IA_DIR, 'ia_vision.py')

// In-memory conversation store (per session)
const conversations = new Map()
const MAX_HISTORY = 20

/**
 * Call the Python AI script via stdin/stdout
 */
function callPython(inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn(PYTHON_BIN, [PYTHON_SCRIPT], {
      cwd: IA_DIR,
    })

    let stdout = ''
    let stderr = ''

    py.stdout.on('data', (data) => { stdout += data.toString() })
    py.stderr.on('data', (data) => { stderr += data.toString() })

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python exited with code ${code}`))
      }
      try {
        const result = JSON.parse(stdout)
        if (result.error) {
          return reject(new Error(result.error))
        }
        resolve(result)
      } catch {
        reject(new Error('Invalid response from Python AI'))
      }
    })

    py.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`))
    })

    // Send JSON via stdin
    py.stdin.write(JSON.stringify(inputData))
    py.stdin.end()
  })
}

/**
 * Call the Python vision script for meal scanning
 */
function callPythonVision(inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn(PYTHON_BIN, [PYTHON_VISION_SCRIPT], {
      cwd: IA_DIR,
    })

    let stdout = ''
    let stderr = ''

    py.stdout.on('data', (data) => { stdout += data.toString() })
    py.stderr.on('data', (data) => { stderr += data.toString() })

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Python vision exited with code ${code}`))
      }
      try {
        const result = JSON.parse(stdout)
        if (result.error) {
          return reject(new Error(result.error))
        }
        resolve(result)
      } catch {
        reject(new Error('Invalid response from Python vision AI'))
      }
    })

    py.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`))
    })

    py.stdin.write(JSON.stringify(inputData))
    py.stdin.end()
  })
}

export const aiService = {
  /**
   * Send a message to the AI and get a response
   */
  async chat(sessionId, message, userProfile = null) {
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [])
    }

    const history = conversations.get(sessionId)

    // Get the MySQL user ID (integer from Utilizador table)
    const userId = userProfile?.userId || null
    let tagsSummary = ''
    if (userId) {
      try {
        tagsSummary = await preferenceModel.getTagsSummary(userId)
      } catch { /* DB not ready yet, that's fine */ }
    }

    // Get today's meals for context
    let mealsSummary = ''
    try {
      const todayMeals = mealModel.getToday(userId)
      mealsSummary = buildMealsSummary(todayMeals)
    } catch { /* DB not ready yet */ }

    // Build system message with user context + learned tags + today's meals
    const systemMessage = SYSTEM_PROMPT + TAG_EXTRACTION_SUFFIX + buildUserContext(userProfile, tagsSummary, mealsSummary)

    // Trim history before sending
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY)
    }

    try {
      // Call the Python script with message + history
      const result = await callPython({
        message,
        history: [...history],
        systemPrompt: systemMessage,
      })

      // Parse tags from the AI response
      const { cleanResponse, tags } = parseTagsFromResponse(result.response)

      // Save extracted tags to MySQL
      if (tags.length > 0 && userId) {
        try {
          await preferenceModel.addTags(userId, tags, 'chat')
        } catch { /* DB not ready */ }
      }

      // Add to conversation history (clean version without tags)
      history.push({ role: 'user', content: message })
      history.push({ role: 'assistant', content: cleanResponse })

      return {
        message: cleanResponse,
        sessionId,
        extractedTags: tags.length > 0 ? tags : undefined,
      }
    } catch (error) {
      throw error
    }
  },

  /**
   * Clear conversation history for a session
   */
  clearHistory(sessionId) {
    conversations.delete(sessionId)
  },

  /**
   * Scan a meal photo and return nutrition info
   */
  async scanMeal(imageBase64, mealType) {
    try {
      const result = await callPythonVision({
        image: imageBase64,
        mealType: mealType,
      })
      return result
    } catch (error) {
      throw error
    }
  },

  /**
   * Get conversation history for a session
   */
  getHistory(sessionId) {
    return conversations.get(sessionId) || []
  },

  /**
   * Get personalized meal suggestions based on preferences and meal history
   */
  async getSuggestions(userProfile = null) {
    const userId = userProfile?.userId || null

    // Gather context from MySQL
    let tagsSummary = ''
    if (userId) {
      try {
        tagsSummary = await preferenceModel.getTagsSummary(userId)
      } catch { /* DB not ready */ }
    }

    let mealsSummary = ''
    try {
      const todayMeals = mealModel.getToday(userId)
      mealsSummary = buildMealsSummary(todayMeals)
    } catch { /* DB not ready */ }

    let recentMealNames = ''
    try {
      const recent = mealModel.getRecent(userId, 3)
      if (recent.length > 0) {
        const names = recent.filter(m => m.name).map(m => m.name)
        if (names.length > 0) {
          recentMealNames = `\nRecent meals (last 3 days): ${names.join(', ')}`
        }
      }
    } catch { /* DB not ready */ }

    const hour = new Date().getHours()
    let mealTime = 'dinner'
    if (hour < 10) mealTime = 'breakfast'
    else if (hour < 14) mealTime = 'lunch'
    else if (hour < 17) mealTime = 'snack'

    const userContext = buildUserContext(userProfile, tagsSummary, mealsSummary + recentMealNames)

    const prompt = `Based on the user's profile, preferences, and meal history, suggest exactly 3 ${mealTime} ideas.
${userContext}

IMPORTANT: Respond ONLY with valid JSON, no other text. Use this exact format:
[
  {"name": "Meal Name", "desc": "Short description (max 10 words)", "cal": "~XXX kcal", "emoji": "single food emoji"},
  {"name": "Meal Name", "desc": "Short description (max 10 words)", "cal": "~XXX kcal", "emoji": "single food emoji"},
  {"name": "Meal Name", "desc": "Short description (max 10 words)", "cal": "~XXX kcal", "emoji": "single food emoji"}
]

Rules:
- NEVER suggest meals containing any of the user's allergens — this is critical for their safety
- Avoid suggesting meals the user already ate today
- Respect dislikes and dietary restrictions
- Match the user's goal (${userProfile?.goal || 'maintain'})
- Suggest variety from recent meals
- Keep descriptions concise`

    try {
      const result = await callPython({
        message: prompt,
        history: [],
        systemPrompt: 'You are a JSON-only meal suggestion API. Return ONLY valid JSON arrays, no markdown, no explanation.',
      })

      const jsonStr = result.response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const suggestions = JSON.parse(jsonStr)

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return { suggestions, mealTime }
      }

      throw new Error('Invalid suggestions format')
    } catch (error) {
      // Return null so the frontend can fall back to hardcoded
      return null
    }
  },
}
