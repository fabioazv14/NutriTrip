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
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return response.json()
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
}
