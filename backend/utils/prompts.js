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
- Always prioritize food safety — warn about allergens when relevant.
- You can use emojis sparingly to be friendly.
- Respond in the same language the user writes in.

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

export function buildUserContext(profile, tagsSummary = '') {
  const parts = []

  if (profile) {
    if (profile.goal) parts.push(`Goal: ${profile.goal}`)
    if (profile.diet) parts.push(`Diet: ${Array.isArray(profile.diet) ? profile.diet.join(', ') : profile.diet}`)
    if (profile.allergies) parts.push(`Allergies: ${Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies}`)
    if (profile.budget) parts.push(`Daily food budget: $${profile.budget}`)
  }

  if (tagsSummary) {
    parts.push(`\nLearned preferences:\n${tagsSummary}`)
  }

  if (parts.length === 0) return ''

  return `\n\nUser profile:\n${parts.join('\n')}`
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
