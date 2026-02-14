<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

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
const goalEmojis = { lose: '🔥', maintain: '⚖️', gain: '💪' }

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

// AI meal suggestion based on profile goal
const mealSuggestions = {
  lose: [
    { name: 'Grilled Chicken Salad', desc: 'High protein, low calorie lunch option', cal: '~380 kcal', emoji: '🥗' },
    { name: 'Greek Yogurt Bowl', desc: 'With berries and a drizzle of honey', cal: '~250 kcal', emoji: '🫐' },
    { name: 'Veggie Stir-Fry', desc: 'Loaded with colorful vegetables', cal: '~320 kcal', emoji: '🥦' },
  ],
  gain: [
    { name: 'Peanut Butter Smoothie', desc: 'Banana, oats, PB, and whole milk', cal: '~650 kcal', emoji: '🥜' },
    { name: 'Pasta with Chicken', desc: 'Whole wheat pasta, grilled chicken, olive oil', cal: '~720 kcal', emoji: '🍝' },
    { name: 'Avocado Toast & Eggs', desc: 'Sourdough, 2 eggs, half avocado', cal: '~520 kcal', emoji: '🥑' },
  ],
  maintain: [
    { name: 'Salmon & Rice Bowl', desc: 'Balanced macro meal with greens', cal: '~480 kcal', emoji: '🍣' },
    { name: 'Chicken Wrap', desc: 'Whole wheat wrap with veggies', cal: '~420 kcal', emoji: '🌯' },
    { name: 'Quinoa Power Bowl', desc: 'Quinoa, black beans, corn, salsa', cal: '~450 kcal', emoji: '🥙' },
  ],
}

const suggestedMeals = computed(() => {
  const goal = profile.value?.goal || 'maintain'
  return mealSuggestions[goal] || mealSuggestions.maintain
})

// Next meal hint based on time of day
const nextMealLabel = computed(() => {
  const hour = new Date().getHours()
  if (hour < 10) return '🌅 Breakfast ideas'
  if (hour < 14) return '☀️ Lunch ideas'
  if (hour < 17) return '🍎 Snack ideas'
  return '🌙 Dinner ideas'
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
  updateStreak()
})

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
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1>{{ greeting }}! 👋</h1>
        <p class="date">{{ today }}</p>
      </div>
      <div class="streak-badge" v-if="streak > 0">
        <span class="streak-fire">🔥</span>
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
        <h2>👤 Your Profile</h2>
        <div class="profile-items">
          <div class="profile-item">
            <span class="pi-icon">{{ profile?.goal ? goalEmojis[profile.goal] : '🎯' }}</span>
            <div>
              <span class="pi-label">Goal</span>
              <span class="pi-value">{{ profile?.goal ? goalLabels[profile.goal] : 'Not set' }}</span>
            </div>
          </div>
          <div class="profile-item">
            <span class="pi-icon">🥗</span>
            <div>
              <span class="pi-label">Diet</span>
              <span class="pi-value">{{ profileDiets.length ? profileDiets.join(', ') : 'No preference' }}</span>
            </div>
          </div>
          <div v-if="profileAllergies.length" class="profile-item allergy-item">
            <span class="pi-icon">⚠️</span>
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
          <h2>{{ nextMealLabel }}</h2>
          <span class="card-badge">Based on your goal</span>
        </div>
        <div class="meal-suggestions">
          <div v-for="meal in suggestedMeals" :key="meal.name" class="suggestion-item">
            <span class="suggestion-emoji">{{ meal.emoji }}</span>
            <div class="suggestion-info">
              <span class="suggestion-name">{{ meal.name }}</span>
              <span class="suggestion-desc">{{ meal.desc }}</span>
            </div>
            <span class="suggestion-cal">{{ meal.cal }}</span>
          </div>
        </div>
        <button class="ask-ai-btn" @click="router.push('/chatbot')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Ask AI for more ideas
        </button>
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
          <img src="/icons/meal-tracker.svg" alt="" />
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

    <!-- Tip -->
    <div class="tip-box">
      <div class="tip-left">
        <span class="tip-icon">💡</span>
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
  font-size: 1.5rem;
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
  font-size: 1.2rem;
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
  width: 100%;
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

.tip-left {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tip-icon {
  font-size: 1.3rem;
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
}
</style>
