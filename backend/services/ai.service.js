import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { SYSTEM_PROMPT, TAG_EXTRACTION_SUFFIX, buildUserContext, parseTagsFromResponse } from '../utils/prompts.js'
import { userModel } from '../models/user.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PYTHON_SCRIPT = join(__dirname, '..', 'ia', 'ia_api.py')
const PYTHON_VISION_SCRIPT = join(__dirname, '..', 'ia', 'ia_vision.py')

// In-memory conversation store (per session)
const conversations = new Map()
const MAX_HISTORY = 20

/**
 * Call the Python AI script via stdin/stdout
 */
function callPython(inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [PYTHON_SCRIPT], {
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

/**
 * Call the Python vision script for meal scanning
 */
function callPythonVision(inputData) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [PYTHON_VISION_SCRIPT], {
      cwd: join(__dirname, '..', 'ia'),
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

    // Get learned preference tags for this user
    const userId = userProfile?.userId || 'guest'
    let tagsSummary = ''
    try {
      tagsSummary = userModel.getTagsSummary(userId)
    } catch { /* DB not ready yet, that's fine */ }

    // Build system message with user context + learned tags
    const systemMessage = SYSTEM_PROMPT + TAG_EXTRACTION_SUFFIX + buildUserContext(userProfile, tagsSummary)

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

      // Save extracted tags to DB
      if (tags.length > 0) {
        try {
          userModel.addTags(userId, tags, 'chat')
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
}
