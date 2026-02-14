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
}

export const nutritionApi = {
  async getTags(userId = 'guest') {
    return request(`/nutrition/tags/${userId}`)
  },

  async addTag(type, tag, userId = 'guest') {
    return request('/nutrition/tags', {
      method: 'POST',
      body: JSON.stringify({ userId, type, tag, source: 'manual' }),
    })
  },

  async removeTag(tagId, userId = 'guest') {
    return request(`/nutrition/tags/${userId}/${tagId}`, {
      method: 'DELETE',
    })
  },
}
