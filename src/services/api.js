const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    // FastAPI returns errors in 'detail', others might use 'error'
    const message = data.detail || data.error || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return response.json()
}

export const authApi = {
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  
  async signup(data) {
    // data: { email, password, nome, dob, genero, ... }
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const aiApi = {
  async sendMessage(message, sessionId, userProfile = null) {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, userProfile }),
    })
  },

  async clearHistory(sessionId) {
    return request('/ai/clear', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    })
  },

  async getHistory(sessionId) {
    return request(`/ai/history/${sessionId}`)
  },

  async scanMeal(imageBase64, mealType = 'meal') {
    return request('/ai/scan-meal', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64, mealType }),
    })
  },

  async getSuggestions(userProfile = null) {
    return request('/ai/suggestions', {
      method: 'POST',
      body: JSON.stringify({ userProfile }),
    })
  },
}

export const nutritionApi = {
  async getTags(userId) {
    if (!userId) return { likes: [], dislikes: [], allergies: [], avoids: [], goals: [] }
    return request(`/nutrition/tags/${userId}`)
  },

  async addTag(type, tag, userId) {
    if (!userId) throw new Error('Must be logged in to add tags')
    return request('/nutrition/tags', {
      method: 'POST',
      body: JSON.stringify({ userId, type, tag, source: 'manual' }),
    })
  },

  async removeTag(tagId, userId) {
    if (!userId) throw new Error('Must be logged in to remove tags')
    return request(`/nutrition/tags/${userId}/${tagId}`, {
      method: 'DELETE',
    })
  },

  async saveProfile(userId, profile) {
    if (!userId) throw new Error('Must be logged in to save profile')
    return request('/nutrition/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, ...profile }),
    })
  },

  async getProfile(userId) {
    if (!userId) return {}
    return request(`/nutrition/profile/${userId}`)
  },

  async getFullProfile(userId) {
    if (!userId) return {}
    return request(`/nutrition/full-profile/${userId}`)
  },
}

export const mealsApi = {
  async saveMeal(meal, userId = 'guest') {
    return request('/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify({ userId, ...meal }),
    })
  },

  async getMeals(userId = 'guest', date = null) {
    const query = date ? `?date=${date}` : ''
    return request(`/nutrition/meals/${userId}${query}`)
  },

  async deleteMeal(mealId, userId = 'guest') {
    return request(`/nutrition/meals/${userId}/${mealId}`, {
      method: 'DELETE',
    })
  },

  async getStats(userId = 'guest') {
    return request(`/nutrition/meals/${userId}/stats`)
  },
}
