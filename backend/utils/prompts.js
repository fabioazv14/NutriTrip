export const SYSTEM_PROMPT = `You are NutriTrip AI, a friendly and knowledgeable nutrition assistant. Your role is to help users with:

- Personalized meal suggestions based on their dietary preferences, allergies, and goals
- Nutrition advice and information about foods
- Meal planning tips for travel and daily life
- Answering questions about macronutrients, vitamins, and healthy eating
- Budget-friendly meal ideas

Guidelines:
- Be concise but informative. Keep responses focused and practical.
- Use a warm, encouraging tone.
- When suggesting meals, consider the user's profile (goal, diet, allergies, budget) if provided.
- If you don't know something, say so honestly.
- Format responses with clear structure when helpful (use bullet points, bold, etc).
- You can use emojis sparingly to be friendly.
- Respond in the same language the user writes in.

CRITICAL — ALLERGY SAFETY:
- NEVER suggest, recommend, or include foods that contain the user's listed allergens, not even as optional ingredients.
- If the user asks about a food that contains one of their allergens, ALWAYS warn them clearly and prominently.
- When suggesting recipes or meals, double-check every ingredient against the user's allergy list.
- If unsure whether a food contains an allergen, err on the side of caution and warn the user.
- Treat both profile allergies AND learned allergy tags with equal importance.

You are NOT a doctor. Always recommend consulting a healthcare professional for medical nutrition advice.`

/**
 * Prompt appended to every AI call — asks the model to also return
 * extracted preference tags as structured JSON at the end of its reply.
 */
export const TAG_EXTRACTION_SUFFIX = `

IMPORTANT: After your response, if the user's message reveals any food preferences, dislikes, allergies, foods they avoid, or nutrition goals, append a line at the very end of your reply in EXACTLY this format:
[TAGS]{"tags":[{"type":"like|dislike|allergy|avoid|goal","tag":"short description"}]}[/TAGS]

Rules for tags:
- Keep each tag short (2-4 words max), e.g. "no milk", "likes chicken", "high protein", "avoids sugar"
- Only extract CLEAR preferences, don't guess
- Types: "like" (foods they enjoy), "dislike" (foods they don't like), "allergy" (food allergies), "avoid" (dietary restrictions), "goal" (nutrition goals like "high protein", "low carb")
- If no preferences are expressed, do NOT include the [TAGS] block at all
- The [TAGS] block must be the very LAST thing in your response`

export function buildUserContext(profile, tagsSummary = '', mealsSummary = '') {
  const parts = []

  // Collect all allergy sources
  const allAllergies = new Set()

  if (profile) {
    if (profile.goal) parts.push(`Goal: ${profile.goal}`)
    if (profile.diet) parts.push(`Diet: ${Array.isArray(profile.diet) ? profile.diet.join(', ') : profile.diet}`)
    if (profile.allergies) {
      const allergies = Array.isArray(profile.allergies) ? profile.allergies : [profile.allergies]
      allergies.filter(a => a && a !== 'no').forEach(a => allAllergies.add(a.toLowerCase()))
    }
    if (profile.budget) parts.push(`Daily food budget: $${profile.budget}`)
  }

  // Extract allergy tags from tagsSummary
  if (tagsSummary) {
    const allergyMatch = tagsSummary.match(/Allergies:\s*(.+)/i)
    if (allergyMatch) {
      allergyMatch[1].split(',').map(a => a.trim().toLowerCase()).filter(Boolean).forEach(a => allAllergies.add(a))
    }
    parts.push(`\nLearned preferences:\n${tagsSummary}`)
  }

  // Add prominent allergy warning at the top
  if (allAllergies.size > 0) {
    parts.unshift(`⚠️ ALLERGIES (NEVER include these): ${[...allAllergies].join(', ')}`)
  }

  if (mealsSummary) {
    parts.push(`\n${mealsSummary}`)
  }

  if (parts.length === 0) return ''

  return `\n\nUser profile:\n${parts.join('\n')}`
}

/**
 * Build a summary of today's meals for the AI context
 */
export function buildMealsSummary(meals) {
  if (!meals || meals.length === 0) return ''

  const lines = meals.map(m => {
    const parts = [`- ${m.meal_type}`]
    if (m.name) parts[0] += `: ${m.name}`
    if (m.note && m.note !== m.name) parts[0] += ` (${m.note})`

    const macros = []
    if (m.calories) macros.push(`${m.calories} kcal`)
    if (m.protein) macros.push(`${m.protein}g protein`)
    if (m.carbs) macros.push(`${m.carbs}g carbs`)
    if (m.fat) macros.push(`${m.fat}g fat`)
    if (macros.length > 0) parts[0] += ` — ${macros.join(', ')}`

    const time = m.logged_at ? new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
    if (time) parts[0] += ` (at ${time})`

    return parts[0]
  })

  return `Today's logged meals:\n${lines.join('\n')}`
}

/**
 * Parse [TAGS] block from AI response and return clean response + tags
 */
export function parseTagsFromResponse(response) {
  const tagMatch = response.match(/\[TAGS\](.*?)\[\/TAGS\]/s)

  if (!tagMatch) {
    return { cleanResponse: response.trim(), tags: [] }
  }

  const cleanResponse = response.replace(/\[TAGS\].*?\[\/TAGS\]/s, '').trim()

  try {
    const parsed = JSON.parse(tagMatch[1])
    const tags = (parsed.tags || []).filter(
      t => t.tag && t.type && ['like', 'dislike', 'allergy', 'avoid', 'goal'].includes(t.type)
    )
    return { cleanResponse, tags }
  } catch {
    return { cleanResponse, tags: [] }
  }
}
