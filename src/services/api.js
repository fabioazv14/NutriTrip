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
  async sendMessage(message, sessionId, userProfile = null, userId = null) {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId, userProfile, userId }),
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
}
