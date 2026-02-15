<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { nutritionApi, aiApi } from '../services/api.js'

const router = useRouter()

// Profile
const profile = ref(null)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const today = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

// Goal display
const goalLabels = { lose: 'Lose weight', maintain: 'Maintain weight', gain: 'Gain weight' }
const goalIcons = { lose: '/weight-loss.png', maintain: '/scale.png', gain: '/weight-gain.png' }

// Diet display
const dietLabels = {
  vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten-Free',
  keto: 'Keto', paleo: 'Paleo',
}

// Streak
const streak = ref(0)

// Tips
import { tips } from '@/data/tips'
const dailyTip = computed(() => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return tips[dayOfYear % tips.length]
})

// AI meal suggestion based on profile goal (fallback)
const fallbackSuggestions = {
  lose: [
    { name: 'Grilled Chicken Salad', desc: 'High protein, low calorie lunch option', cal: '380 kcal', emoji: '🥗' },
    { name: 'Greek Yogurt Bowl', desc: 'With berries and a drizzle of honey', cal: '250 kcal', emoji: '🫐' },
    { name: 'Veggie Stir-Fry', desc: 'Loaded with colorful vegetables', cal: '320 kcal', emoji: '🥦' },
  ],
  gain: [
    { name: 'Peanut Butter Smoothie', desc: 'Banana, oats, PB, and whole milk', cal: '650 kcal', emoji: '🥜' },
    { name: 'Pasta with Chicken', desc: 'Whole wheat pasta, grilled chicken, olive oil', cal: '720 kcal', emoji: '🍝' },
    { name: 'Avocado Toast & Eggs', desc: 'Sourdough, 2 eggs, half avocado', cal: '520 kcal', emoji: '🥑' },
  ],
  maintain: [
    { name: 'Salmon & Rice Bowl', desc: 'Balanced macro meal with greens', cal: '480 kcal', emoji: '🍣' },
    { name: 'Chicken Wrap', desc: 'Whole wheat wrap with veggies', cal: '420 kcal', emoji: '🌯' },
    { name: 'Quinoa Power Bowl', desc: 'Quinoa, black beans, corn, salsa', cal: '450 kcal', emoji: '🥙' },
  ],
}

// Dynamic AI suggestions
const aiSuggestions = ref(null)
const loadingSuggestions = ref(false)
const aiMealTime = ref(null)

const suggestedMeals = computed(() => {
  if (aiSuggestions.value) return aiSuggestions.value
  const goal = profile.value?.goal || 'maintain'
  return fallbackSuggestions[goal] || fallbackSuggestions.maintain
})

// Next meal hint based on time of day
const mealTimeConfig = {
  breakfast: { label: 'Breakfast ideas', icon: '/icons/sunrise.svg' },
  lunch: { label: 'Lunch ideas', icon: '/icons/sun.svg' },
  snack: { label: 'Snack ideas', icon: '/sandwich.png' },
  dinner: { label: 'Dinner ideas', icon: '/icons/moon.svg' },
}

const nextMealConfig = computed(() => {
  if (aiMealTime.value) return mealTimeConfig[aiMealTime.value] || mealTimeConfig.dinner
  const hour = new Date().getHours()
  if (hour < 10) return mealTimeConfig.breakfast
  if (hour < 14) return mealTimeConfig.lunch
  if (hour < 17) return mealTimeConfig.snack
  return mealTimeConfig.dinner
})

// Profile diet display
const profileDiets = computed(() => {
  if (!profile.value?.diet) return []
  const d = profile.value.diet
  return (Array.isArray(d) ? d : [d]).map(v => dietLabels[v] || v)
})

const profileAllergies = computed(() => {
  if (!profile.value?.allergies) return []
  return profile.value.allergies.filter(a => a !== 'no')
})

onMounted(() => {
  const saved = localStorage.getItem('nutritrip_profile')
  if (saved) profile.value = JSON.parse(saved)

  // Attach userId from auth
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      if (userData.id) profile.value = { ...profile.value, userId: userData.id }
    } catch { /* ignore */ }
  }

  updateStreak()
  loadTags()
  loadSuggestions()
  loadPeriodData()
})

async function loadSuggestions() {
  loadingSuggestions.value = true
  try {
    const result = await aiApi.getSuggestions(profile.value)
    if (result && result.suggestions) {
      aiSuggestions.value = result.suggestions
      aiMealTime.value = result.mealTime
    }
  } catch {
    // Keep fallback suggestions
  } finally {
    loadingSuggestions.value = false
  }
}

function updateStreak() {
  const todayStr = new Date().toDateString()
  const lastVisit = localStorage.getItem('nutritrip_last_visit')
  const savedStreak = parseInt(localStorage.getItem('nutritrip_streak') || '0')

  if (lastVisit === todayStr) {
    streak.value = savedStreak
  } else {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (lastVisit === yesterday.toDateString()) {
      streak.value = savedStreak + 1
    } else {
      streak.value = 1
    }
    localStorage.setItem('nutritrip_streak', streak.value)
    localStorage.setItem('nutritrip_last_visit', todayStr)
  }
}

// ─── Tags / Preferences ───────────────────────

// ─── Period / Cycle Tracker ───────────────────
const showCycleTracker = computed(() =>
  profile.value?.sex === 'female' && profile.value?.menstrualCycle === 'yes'
)

const lastPeriodDate = ref(null)
const cycleLength = ref(28)

const cyclePhase = computed(() => {
  if (!lastPeriodDate.value) return null
  const start = new Date(lastPeriodDate.value)
  const now = new Date()
  const daysSince = Math.floor((now - start) / 86400000)
  const dayInCycle = ((daysSince % cycleLength.value) + cycleLength.value) % cycleLength.value

  if (dayInCycle <= 5) return { name: 'Menstrual', day: dayInCycle + 1, emoji: '🔴', color: '#fecaca', textColor: '#991b1b', tip: 'Focus on iron-rich foods like spinach, lentils, and red meat. Stay hydrated and consider anti-inflammatory foods.' }
  if (dayInCycle <= 13) return { name: 'Follicular', day: dayInCycle + 1, emoji: '🌱', color: '#d1fae5', textColor: '#065f46', tip: 'Great time for complex carbs and fermented foods. Your energy is rising — fuel it with whole grains and fresh veggies.' }
  if (dayInCycle <= 16) return { name: 'Ovulation', day: dayInCycle + 1, emoji: '✨', color: '#fef3c7', textColor: '#92400e', tip: 'Peak energy! Focus on lighter meals, antioxidant-rich fruits, and fiber. Great time for raw veggies and smoothies.' }
  return { name: 'Luteal', day: dayInCycle + 1, emoji: '🌙', color: '#e0e7ff', textColor: '#3730a3', tip: 'Cravings may increase. Prioritize magnesium-rich foods (dark chocolate, nuts), healthy fats, and complex carbs to stabilize mood.' }
})

const cycleProgress = computed(() => {
  if (!lastPeriodDate.value) return 0
  const start = new Date(lastPeriodDate.value)
  const now = new Date()
  const daysSince = Math.floor((now - start) / 86400000)
  const dayInCycle = ((daysSince % cycleLength.value) + cycleLength.value) % cycleLength.value
  return ((dayInCycle + 1) / cycleLength.value) * 100
})

function savePeriodDate() {
  if (lastPeriodDate.value) {
    localStorage.setItem('nutritrip_last_period', lastPeriodDate.value)
    localStorage.setItem('nutritrip_cycle_length', cycleLength.value.toString())
  }
}

function loadPeriodData() {
  const saved = localStorage.getItem('nutritrip_last_period')
  const savedLength = localStorage.getItem('nutritrip_cycle_length')
  if (saved) lastPeriodDate.value = saved
  if (savedLength) cycleLength.value = parseInt(savedLength)
}

// ─── Tags / Preferences ───────────────────────
const tags = ref({ likes: [], dislikes: [], allergies: [], avoids: [], goals: [] })
const showAddTag = ref(false)
const newTagText = ref('')
const newTagType = ref('like')

const tagTypeOptions = [
  { value: 'like', label: 'Like', icon: '✓' },
  { value: 'dislike', label: 'Dislike', icon: '✗' },
  { value: 'allergy', label: 'Allergy', icon: '!' },
  { value: 'avoid', label: 'Avoid', icon: '—' },
  { value: 'goal', label: 'Goal', icon: '◎' },
]

const allTags = computed(() => {
  const all = []
  for (const [type, items] of Object.entries(tags.value)) {
    const singularType = type === 'allergies' ? 'allergy' : type === 'likes' ? 'like'
      : type === 'dislikes' ? 'dislike' : type === 'avoids' ? 'avoid' : 'goal'
    for (const item of items) {
      all.push({ ...item, type: singularType })
    }
  }
  return all
})

const tagTypeConfig = {
  like: { icon: '✓', color: '#dcfce7', text: '#166534' },
  dislike: { icon: '✗', color: '#fee2e2', text: '#991b1b' },
  allergy: { icon: '!', color: '#fef3c7', text: '#92400e' },
  avoid: { icon: '—', color: '#f3e8ff', text: '#6b21a8' },
  goal: { icon: '◎', color: '#dbeafe', text: '#1e40af' },
}

function getAuthUserId() {
  try {
    const user = localStorage.getItem('user')
    if (user) return JSON.parse(user).id
  } catch { /* ignore */ }
  return null
}

async function loadTags() {
  const uid = getAuthUserId()
  if (!uid) return
  try {
    tags.value = await nutritionApi.getTags(uid)
  } catch { /* backend may not be running */ }
}

async function addTag() {
  const text = newTagText.value.trim()
  if (!text) return
  const uid = getAuthUserId()
  if (!uid) return
  try {
    tags.value = await nutritionApi.addTag(newTagType.value, text, uid)
    newTagText.value = ''
    showAddTag.value = false
  } catch { /* ignore */ }
}

async function removeTag(tagId) {
  const uid = getAuthUserId()
  if (!uid) return
  try {
    tags.value = await nutritionApi.removeTag(tagId, uid)
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1>{{ greeting }}! </h1>
        <p class="date">{{ today }}</p>
      </div>
      <div class="streak-badge" v-if="streak > 0">
        <img src="/icons/flame.svg" alt="" class="streak-fire" />
        <div>
          <span class="streak-count">{{ streak }}</span>
          <span class="streak-label">day{{ streak !== 1 ? 's' : '' }} streak</span>
        </div>
      </div>
    </div>

    <!-- Top row: profile + meal suggestions -->
    <div class="top-row">
      <!-- Profile summary -->
      <div class="card profile-card">
        <h2><img src="/icons/user.svg" alt="" class="section-icon" /> Your Profile</h2>
        <div class="profile-items">
          <div class="profile-item">
            <span class="pi-icon">
              <img :src="profile?.goal ? goalIcons[profile.goal] : '/icons/target.svg'" alt="" class="pi-svg" />
            </span>
            <div>
              <span class="pi-label">Goal</span>
              <span class="pi-value">{{ profile?.goal ? goalLabels[profile.goal] : 'Not set' }}</span>
            </div>
          </div>
          <div class="profile-item">
            <span class="pi-icon">
              <img src="/broccoli.png" alt="" class="pi-svg" />
            </span>
            <div>
              <span class="pi-label">Diet</span>
              <span class="pi-value">{{ profileDiets.length ? profileDiets.join(', ') : 'No preference' }}</span>
            </div>
          </div>
          <div v-if="profileAllergies.length" class="profile-item allergy-item">
            <span class="pi-icon">
              <img src="/icons/alert.svg" alt="" class="pi-svg" />
            </span>
            <div>
              <span class="pi-label">Allergies</span>
              <span class="pi-value allergy-value">{{ profileAllergies.join(', ') }}</span>
            </div>
          </div>
        </div>
        <button class="edit-profile-btn" @click="router.push('/onboarding')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit preferences
        </button>
      </div>

      <!-- Meal suggestions -->
      <div class="card next-meal-card">
        <div class="card-header">
          <h2><img :src="nextMealConfig.icon" alt="" class="section-icon" /> {{ nextMealConfig.label }}</h2>
          <span class="card-badge">{{ aiSuggestions ? 'Personalized for you' : 'Based on your goal' }}</span>
        </div>
        <div v-if="loadingSuggestions" class="suggestions-loading">
          <div class="loading-spinner"></div>
          <span>Generating personalized ideas...</span>
        </div>
        <div v-else class="meal-suggestions">
          <div v-for="meal in suggestedMeals" :key="meal.name" class="suggestion-item">
            <span class="suggestion-emoji">{{ meal.emoji }}</span>
            <div class="suggestion-info">
              <span class="suggestion-name">{{ meal.name }}</span>
              <span class="suggestion-desc">{{ meal.desc }}</span>
            </div>
            <span class="suggestion-cal">{{ meal.cal }}</span>
          </div>
        </div>
        <div class="meal-card-actions">
          <button v-if="!loadingSuggestions" class="refresh-btn" @click="loadSuggestions" title="Get new suggestions">
            <img src="/icons/refresh.svg" alt="" class="btn-icon" /> Refresh
          </button>
          <button class="ask-ai-btn" @click="router.push('/chatbot')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask AI for more ideas
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="qa-btn" @click="router.push('/meals')">
        <div class="qa-icon qa-meals">
          <img src="/icons/camera.svg" alt="" />
        </div>
        <div class="qa-text">
          <span class="qa-title">Log a Meal</span>
          <span class="qa-desc">Snap a photo of what you ate</span>
        </div>
        <svg class="qa-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <button class="qa-btn" @click="router.push('/chatbot')">
        <div class="qa-icon qa-ai">
          <img src="/user-robot.png" alt="" />
        </div>
        <div class="qa-text">
          <span class="qa-title">Ask NutriTrip AI</span>
          <span class="qa-desc">Get personalized nutrition advice</span>
        </div>
        <svg class="qa-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Period / Cycle Tracker -->
    <div v-if="showCycleTracker" class="card cycle-card">
      <div class="card-header">
        <h2>🩸 Cycle Tracker</h2>
        <span v-if="cyclePhase" class="cycle-phase-badge" :style="{ background: cyclePhase.color, color: cyclePhase.textColor }">
          {{ cyclePhase.emoji }} {{ cyclePhase.name }} phase
        </span>
      </div>

      <!-- Setup: ask for last period date -->
      <div v-if="!lastPeriodDate" class="cycle-setup">
        <p class="cycle-setup-text">Set your last period start date to get personalized nutrition tips for each phase of your cycle.</p>
        <div class="cycle-input-row">
          <label class="cycle-label">
            Last period started
            <input type="date" v-model="lastPeriodDate" class="cycle-date-input" @change="savePeriodDate" />
          </label>
        </div>
      </div>

      <!-- Active tracker -->
      <div v-else class="cycle-active">
        <div class="cycle-progress-row">
          <div class="cycle-day-info">
            <span class="cycle-day-number">Day {{ cyclePhase?.day }}</span>
            <span class="cycle-day-total">of {{ cycleLength }}-day cycle</span>
          </div>
          <div class="cycle-progress-bar">
            <div class="cycle-progress-fill" :style="{ width: cycleProgress + '%', background: cyclePhase?.textColor }"></div>
            <div class="cycle-phases-markers">
              <span class="cycle-marker" style="left: 0%">🔴</span>
              <span class="cycle-marker" style="left: 21%">🌱</span>
              <span class="cycle-marker" style="left: 50%">✨</span>
              <span class="cycle-marker" style="left: 60%">🌙</span>
            </div>
          </div>
        </div>

        <!-- Nutrition tip for current phase -->
        <div v-if="cyclePhase" class="cycle-tip" :style="{ background: cyclePhase.color, color: cyclePhase.textColor }">
          <span class="cycle-tip-label">{{ cyclePhase.emoji }} {{ cyclePhase.name }} Phase Nutrition</span>
          <p class="cycle-tip-text">{{ cyclePhase.tip }}</p>
        </div>

        <!-- Edit settings -->
        <div class="cycle-settings">
          <label class="cycle-setting-item">
            <span class="cycle-setting-label">Last period</span>
            <input type="date" v-model="lastPeriodDate" class="cycle-date-input small" @change="savePeriodDate" />
          </label>
          <label class="cycle-setting-item">
            <span class="cycle-setting-label">Cycle length</span>
            <select v-model="cycleLength" class="cycle-select" @change="savePeriodDate">
              <option v-for="n in 15" :key="n" :value="n + 20">{{ n + 20 }} days</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- Learned Preferences (Tags) -->
    <div class="card tags-card">
      <div class="card-header">
        <h2><img src="/icons/tag.svg" alt="" class="section-icon" /> Learned Preferences</h2>
        <button class="add-tag-toggle" @click="showAddTag = !showAddTag">
          {{ showAddTag ? '✕' : '+ Add' }}
        </button>
      </div>
      <p class="tags-hint">These are automatically learned from your chats, or you can add them manually.</p>

      <!-- Add tag form -->
      <Transition name="slide">
        <div v-if="showAddTag" class="add-tag-form">
          <div class="tag-type-selector">
            <button
              v-for="opt in tagTypeOptions"
              :key="opt.value"
              class="tag-type-btn"
              :class="{ active: newTagType === opt.value }"
              @click="newTagType = opt.value"
            >
              {{ opt.icon }} {{ opt.label }}
            </button>
          </div>
          <div class="tag-input-row">
            <input
              v-model="newTagText"
              type="text"
              placeholder="e.g. no milk, likes chicken, high protein..."
              class="tag-input"
              @keydown.enter="addTag"
            />
            <button class="tag-save-btn" :disabled="!newTagText.trim()" @click="addTag">Add</button>
          </div>
        </div>
      </Transition>

      <!-- Tags list -->
      <div v-if="allTags.length" class="tags-list">
        <span
          v-for="t in allTags"
          :key="t.id"
          class="pref-tag"
          :style="{ background: tagTypeConfig[t.type]?.color, color: tagTypeConfig[t.type]?.text }"
        >
          {{ tagTypeConfig[t.type]?.icon }} {{ t.tag }}
          <button class="tag-remove" @click="removeTag(t.id)">✕</button>
        </span>
      </div>
      <p v-else class="tags-empty">No preferences yet — chat with NutriTrip AI and I'll learn what you like!</p>
    </div>

    <!-- Tip -->
    <div class="tip-box">
      <div class="tip-left">
        <span class="tip-icon"><img src="/icons/lightbulb.svg" alt="" class="tip-svg" /></span>
        <div>
          <span class="tip-title">Daily Tip</span>
          <p class="tip-text">{{ dailyTip }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f8faf8;
  padding: 32px 48px;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.dash-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.date {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
  font-weight: 500;
}

/* Streak */
.streak-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px 18px;
}

.streak-fire {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.streak-count {
  display: block;
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
}

.streak-label {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Top row */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 16px;
  margin-bottom: 16px;
}

/* Inline SVG icons */
.inline-icon {
  width: 28px;
  height: 28px;
  vertical-align: -4px;
  margin-left: 2px;
}

.section-icon {
  width: 20px;
  height: 20px;
  vertical-align: -3px;
  margin-right: 4px;
}

.pi-svg {
  width: 20px;
  height: 20px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  vertical-align: -2px;
}

.tip-svg {
  width: 22px;
  height: 22px;
}

/* Cards */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 22px;
}

.card h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
}

.card-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #22c55e;
  background: #f0fdf4;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

/* Profile card */
.profile-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pi-icon {
  width: 38px;
  height: 38px;
  background: #f0fdf4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.allergy-item .pi-icon {
  background: #fef2f2;
}

.pi-label {
  display: block;
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.pi-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
}

.allergy-value {
  color: #dc2626;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.edit-profile-btn:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #22c55e;
}

/* Meal suggestions */
.meal-suggestions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.suggestion-emoji {
  font-size: 1.5rem;
  width: 42px;
  height: 42px;
  background: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
}

.suggestion-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.suggestion-desc {
  display: block;
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 1px;
}

.suggestion-cal {
  font-size: 0.75rem;
  font-weight: 600;
  color: #22c55e;
  background: #f0fdf4;
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

.ask-ai-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  padding: 10px;
  background: #22c55e;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.ask-ai-btn:hover {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.meal-card-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.refresh-btn {
  padding: 10px 16px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.refresh-btn:hover {
  background: #e5e7eb;
}

.suggestions-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  color: #6b7280;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Quick actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
}

.qa-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.qa-btn:hover {
  border-color: #bbf7d0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.qa-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-icon img {
  width: 22px;
  height: 22px;
}

.qa-meals {
  background: #f0fdf4;
}

.qa-ai {
  background: #eef2ff;
}

.qa-text {
  flex: 1;
  min-width: 0;
}

.qa-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.qa-desc {
  display: block;
  font-size: 0.78rem;
  color: #9ca3af;
  margin-top: 2px;
}

.qa-arrow {
  flex-shrink: 0;
}

/* Tip */
.tip-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 18px 22px;
}

/* Tags card */
.tags-card {
  margin-bottom: 16px;
}

.tags-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0 0 14px;
}

.add-tag-toggle {
  background: none;
  border: 1.5px solid #e5e7eb;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #22c55e;
  cursor: pointer;
  transition: all 0.2s;
}

.add-tag-toggle:hover {
  background: #f0fdf4;
  border-color: #22c55e;
}

.add-tag-form {
  margin-bottom: 14px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.tag-type-selector {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.tag-type-btn {
  padding: 5px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.tag-type-btn.active {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #166534;
}

.tag-input-row {
  display: flex;
  gap: 8px;
}

.tag-input {
  flex: 1;
  padding: 9px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.tag-input:focus {
  border-color: #22c55e;
}

.tag-save-btn {
  padding: 9px 18px;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.tag-save-btn:hover:not(:disabled) {
  background: #16a34a;
}

.tag-save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pref-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.tag-remove {
  background: none;
  border: none;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  color: inherit;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  opacity: 1;
}

.tags-empty {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
  font-style: italic;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
  padding: 0 14px;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 200px;
  opacity: 1;
}

.tip-left {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.tip-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.tip-text {
  font-size: 0.88rem;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 20px 16px;
  }

  .dash-header {
    flex-direction: column;
    gap: 12px;
  }

  .top-row {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .cycle-settings {
    flex-direction: column;
  }
}

/* Cycle Tracker */
.cycle-card {
  margin-bottom: 16px;
}

.cycle-phase-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  white-space: nowrap;
}

.cycle-setup {
  text-align: center;
  padding: 8px 0;
}

.cycle-setup-text {
  font-size: 0.88rem;
  color: #6b7280;
  margin: 0 0 16px;
  line-height: 1.5;
}

.cycle-input-row {
  display: flex;
  justify-content: center;
}

.cycle-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.cycle-date-input {
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.cycle-date-input:focus {
  border-color: #f472b6;
}

.cycle-date-input.small {
  padding: 7px 10px;
  font-size: 0.8rem;
}

.cycle-active {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cycle-progress-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cycle-day-info {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.cycle-day-number {
  font-size: 1.3rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
}

.cycle-day-total {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
}

.cycle-progress-bar {
  flex: 1;
  height: 10px;
  background: #f3f4f6;
  border-radius: 100px;
  overflow: visible;
  position: relative;
}

.cycle-progress-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
  opacity: 0.7;
}

.cycle-phases-markers {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 0;
}

.cycle-marker {
  position: absolute;
  font-size: 0.6rem;
  transform: translateX(-50%);
  top: -4px;
}

.cycle-tip {
  padding: 14px 18px;
  border-radius: 12px;
}

.cycle-tip-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.cycle-tip-text {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

.cycle-settings {
  display: flex;
  gap: 16px;
  padding-top: 4px;
  border-top: 1px solid #f3f4f6;
}

.cycle-setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.cycle-setting-label {
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}

.cycle-select {
  padding: 7px 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.8rem;
  outline: none;
  font-family: inherit;
  background: #fff;
  cursor: pointer;
}

.cycle-select:focus {
  border-color: #f472b6;
}
</style>
