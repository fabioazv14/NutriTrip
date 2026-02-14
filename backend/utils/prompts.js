export const SYSTEM_PROMPT = `You are NutriTrip AI, a friendly and knowledgeable nutrition assistant. Your role is to help users with:

- Personalized meal suggestions based on their dietary preferences, allergies, restrictions, and goals
- Nutrition advice and information about foods
- Meal planning tips for travel and daily life
- Answering questions about macronutrients, vitamins, and healthy eating
- Budget-friendly meal ideas
- Tracking progress toward their nutrition and fitness goals

Guidelines:
- Be concise but informative. Keep responses focused and practical.
- Use a warm, encouraging tone.
- When suggesting meals, ALWAYS consider the user's profile data: restrictions, goals, recent meals, physical activities, and tags.
- NEVER suggest foods that conflict with the user's dietary restrictions.
- If you notice patterns in the user's recent meals (e.g., low variety, missing nutrients), proactively mention it.
- Consider the user's physical activities when recommending calorie intake or meal sizes.
- If the user has goals with deadlines, keep them in mind and offer relevant advice.
- If you don't know something, say so honestly.
- Format responses with clear structure when helpful (use bullet points, bold, etc).
- Always prioritize food safety — warn about allergens when relevant.
- You can use emojis sparingly to be friendly.
- Respond in the same language the user writes in.

You are NOT a doctor. Always recommend consulting a healthcare professional for medical nutrition advice.`

/**
 * Build user context from simple profile (legacy/fallback)
 */
export function buildUserContext(profile) {
  if (!profile) return ''

  const parts = []
  if (profile.goal) parts.push(`Goal: ${profile.goal}`)
  if (profile.diet) parts.push(`Diet: ${Array.isArray(profile.diet) ? profile.diet.join(', ') : profile.diet}`)
  if (profile.allergies) parts.push(`Allergies: ${Array.isArray(profile.allergies) ? profile.allergies.join(', ') : profile.allergies}`)
  if (profile.budget) parts.push(`Daily food budget: $${profile.budget}`)

  if (parts.length === 0) return ''

  return `\n\nUser profile:\n${parts.join('\n')}`
}

/**
 * Build rich user context from database data
 */
export function buildDbUserContext(dbProfile, recentMeals = []) {
  if (!dbProfile) return ''

  const parts = []

  // Basic info
  parts.push(`Name: ${dbProfile.Nome}`)
  parts.push(`Gender: ${dbProfile.Genero === 'M' ? 'Male' : dbProfile.Genero === 'F' ? 'Female' : 'Other'}`)

  if (dbProfile.Dob) {
    const age = Math.floor((Date.now() - new Date(dbProfile.Dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    parts.push(`Age: ${age}`)
  }

  if (dbProfile.UltimoPeriodo) {
    parts.push(`Last period: ${new Date(dbProfile.UltimoPeriodo).toLocaleDateString('pt-PT')}`)
  }

  // Dietary restrictions
  if (dbProfile.restrictions && dbProfile.restrictions.length > 0) {
    parts.push(`Dietary restrictions: ${dbProfile.restrictions.join(', ')}`)
  }

  // Tags/preferences
  if (dbProfile.tags && dbProfile.tags.length > 0) {
    parts.push(`Tags/preferences: ${dbProfile.tags.join(', ')}`)
  }

  // Goals
  if (dbProfile.goals && dbProfile.goals.length > 0) {
    const goalLines = dbProfile.goals.map((g) => {
      let line = `  - ${g.Descricao}`
      if (g.Prazo) line += ` (deadline: ${new Date(g.Prazo).toLocaleDateString('pt-PT')})`
      return line
    })
    parts.push(`Goals:\n${goalLines.join('\n')}`)
  }

  // Physical activities
  if (dbProfile.activities && dbProfile.activities.length > 0) {
    const actLines = dbProfile.activities.map((a) => `  - ${a.Atividade}: ${a.Duracao} min`)
    parts.push(`Physical activities:\n${actLines.join('\n')}`)
  }

  // Recent meals
  if (recentMeals && recentMeals.length > 0) {
    const mealLines = recentMeals.map((m) => {
      let line = `  - [${m.Tipo}] ${m.Designacao}`
      if (m.alimentos && m.alimentos.length > 0) {
        line += ` (${m.alimentos.join(', ')})`
      }
      if (m.TagTipo) line += ` #${m.TagTipo}`
      return line
    })
    parts.push(`Recent meals:\n${mealLines.join('\n')}`)
  }

  return `\n\nUser profile (from database):\n${parts.join('\n')}`
}
