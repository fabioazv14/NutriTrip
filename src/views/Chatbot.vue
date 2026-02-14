<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { aiApi } from '../services/api.js'

const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const error = ref(null)
const chatContainer = ref(null)
const inputRef = ref(null)

// Unique session per browser tab
const sessionId = ref(localStorage.getItem('nutritrip_session') || crypto.randomUUID())
localStorage.setItem('nutritrip_session', sessionId.value)

// User profile from onboarding (if saved)
const userProfile = computed(() => {
  const saved = localStorage.getItem('nutritrip_profile')
  return saved ? JSON.parse(saved) : null
})

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: 'Hey! 👋 I\'m your NutriTrip nutrition assistant. Ask me anything about nutrition, meal planning, healthy eating, or food ideas for your trips!',
    time: formatTime(),
  })
  inputRef.value?.focus()
})

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/^- (.*)/gm, '• $1')
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  error.value = null

  messages.value.push({
    role: 'user',
    content: text,
    time: formatTime(),
  })

  input.value = ''
  await scrollToBottom()

  isLoading.value = true
  try {
    const response = await aiApi.sendMessage(text, sessionId.value, userProfile.value)

    messages.value.push({
      role: 'assistant',
      content: response.message,
      time: formatTime(),
    })
  } catch (err) {
    error.value = err.message || 'Failed to get response.'
    messages.value.push({
      role: 'assistant',
      content: '⚠️ Sorry, I couldn\'t process that. Please try again.',
      time: formatTime(),
      isError: true,
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
    inputRef.value?.focus()
  }
}

async function clearChat() {
  if (messages.value.length <= 1) return

  try { await aiApi.clearHistory(sessionId.value) } catch {}

  sessionId.value = crypto.randomUUID()
  localStorage.setItem('nutritrip_session', sessionId.value)

  messages.value = [{
    role: 'assistant',
    content: 'Chat cleared! 🧹 How can I help you?',
    time: formatTime(),
  }]
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const suggestions = [
  'Suggest a healthy breakfast',
  'High protein meal ideas',
  'What should I eat on a road trip?',
  'Budget-friendly healthy meals',
]

function useSuggestion(text) {
  input.value = text
  sendMessage()
}
</script>

<template>
  <div class="chatbot-page">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-left">
        <div class="ai-avatar">
          <img src="/nutritrip.png" alt="" />
        </div>
        <div>
          <h1>NutriTrip AI</h1>
          <span class="status">
            <span class="status-dot"></span>
            Online
          </span>
        </div>
      </div>
      <button class="clear-btn" @click="clearChat" title="Clear chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        <span>Clear</span>
      </button>
    </div>

    <!-- Messages -->
    <div ref="chatContainer" class="chat-messages">
      <!-- Suggestions -->
      <div v-if="messages.length <= 1 && !isLoading" class="suggestions">
        <p class="suggestions-label">Try asking:</p>
        <div class="suggestions-grid">
          <button
            v-for="s in suggestions"
            :key="s"
            class="suggestion-chip"
            @click="useSuggestion(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Message bubbles -->
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="message"
        :class="[msg.role, { error: msg.isError }]"
      >
        <div v-if="msg.role === 'assistant'" class="msg-avatar">
          <img src="/nutritrip.png" alt="" />
        </div>
        <div class="msg-bubble">
          <div class="msg-content" v-html="formatMessage(msg.content)"></div>
          <span class="msg-time">{{ msg.time }}</span>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isLoading" class="message assistant">
        <div class="msg-avatar">
          <img src="/nutritrip.png" alt="" />
        </div>
        <div class="msg-bubble typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null">✕</button>
    </div>

    <!-- Input -->
    <div class="chat-input-area">
      <div class="input-wrapper">
        <textarea
          ref="inputRef"
          v-model="input"
          placeholder="Ask about nutrition, meals, or healthy eating..."
          rows="1"
          @keydown="onKeydown"
          :disabled="isLoading"
        ></textarea>
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!input.trim() || isLoading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chatbot-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8faf8;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: #f0fdf4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar img {
  width: 40px;
  height: 40px;
}

.chat-header h1 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 500;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #22c55e;
  border-radius: 50%;
  display: inline-block;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

/* Messages area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Suggestions */
.suggestions {
  margin: 16px 0 8px;
}

.suggestions-label {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0 0 12px;
  font-weight: 500;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  padding: 10px 16px;
  background: #ffffff;
  border: 1.5px solid #d1fae5;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #166534;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: #f0fdf4;
  border-color: #22c55e;
}

/* Message */
.message {
  display: flex;
  gap: 10px;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.assistant {
  align-self: flex-start;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg-avatar {
  width: 32px;
  height: 32px;
  background: #f0fdf4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.msg-avatar img {
  width: 34px;
  height: 34px;
}

.msg-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  line-height: 1.5;
}

.message.assistant .msg-bubble {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  color: #111827;
}

.message.user .msg-bubble {
  background: #22c55e;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.message.error .msg-bubble {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.msg-content {
  font-size: 0.9rem;
  word-wrap: break-word;
}

.msg-content :deep(strong) {
  font-weight: 600;
}

.msg-content :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}

.msg-time {
  display: block;
  font-size: 0.7rem;
  margin-top: 6px;
  opacity: 0.5;
}

.message.user .msg-time {
  text-align: right;
}

/* Typing indicator */
.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 14px 18px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite both;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Error banner */
.error-banner {
  padding: 10px 20px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.error-banner button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1rem;
  padding: 0 4px;
}

/* Input area */
.chat-input-area {
  padding: 16px 24px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: #f9fafb;
  border: 1.5px solid #d1d5db;
  border-radius: 14px;
  padding: 6px 6px 6px 16px;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #22c55e;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input-wrapper textarea {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  color: #111827;
  resize: none;
  line-height: 1.5;
  padding: 8px 0;
  max-height: 120px;
  font-family: inherit;
}

.input-wrapper textarea::placeholder {
  color: #9ca3af;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: #22c55e;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #16a34a;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .chat-messages { padding: 16px; }
  .message { max-width: 90%; }
  .chat-input-area { padding: 12px 16px; }
  .chat-header { padding: 12px 16px; }
  .clear-btn span { display: none; }
}
</style>
