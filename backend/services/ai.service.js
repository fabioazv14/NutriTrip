import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { SYSTEM_PROMPT, buildUserContext, buildDbUserContext } from '../utils/prompts.js'
import { userModel } from '../models/user.model.js'
import { nutritionModel } from '../models/nutrition.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PYTHON_SCRIPT = join(__dirname, '..', 'ia', 'ia_api.py')
const PYTHON_BIN = join(__dirname, '..', 'ia', 'venv', 'bin', 'python3')

// In-memory conversation store (per session)
const conversations = new Map()
const MAX_HISTORY = 20

/**
 * Call the Python AI script via stdin/stdout
 */
function callPython(inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn(PYTHON_BIN, [PYTHON_SCRIPT], {
      cwd: join(__dirname, '..', 'ia'),
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

export const aiService = {
  /**
   * Send a message to the AI and get a response
   * @param {string} sessionId - Session identifier
   * @param {string} message - User message
   * @param {object|null} userProfile - Legacy profile from frontend (fallback)
   * @param {number|null} userId - Database user ID for rich context
   */
  async chat(sessionId, message, userProfile = null, userId = null) {
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [])
    }

    const history = conversations.get(sessionId)

    // Build system message with user context
    let userContext = ''

    if (userId) {
      // Fetch rich profile from database
      try {
        const [dbProfile, recentMeals] = await Promise.all([
          userModel.getFullProfile(userId),
          nutritionModel.getRecentMeals(userId, 10),
        ])
        userContext = buildDbUserContext(dbProfile, recentMeals)
      } catch (err) {
        console.error('Failed to load DB profile, falling back:', err.message)
        userContext = buildUserContext(userProfile)
      }
    } else {
      userContext = buildUserContext(userProfile)
    }

    const systemMessage = SYSTEM_PROMPT + userContext

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

      // Add to conversation history
      history.push({ role: 'user', content: message })
      history.push({ role: 'assistant', content: result.response })

      return {
        message: result.response,
        sessionId,
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
   * Get conversation history for a session
   */
  getHistory(sessionId) {
    return conversations.get(sessionId) || []
  },
}
