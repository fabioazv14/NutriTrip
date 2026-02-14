<script setup>
import { ref, computed, onMounted } from 'vue'
import { aiApi, mealsApi } from '../services/api.js'

const meals = ref([])
const showUpload = ref(false)
const dragOver = ref(false)
const previewUrl = ref(null)
const selectedFile = ref(null)
const mealType = ref('lunch')
const mealNote = ref('')

// Scanning state
const isScanning = ref(false)
const scanResult = ref(null)
const scanError = ref(null)
const isSaving = ref(false)
const isLoading = ref(false)
const newItem = ref('')

function addItem() {
  if (newItem.value.trim() && scanResult.value) {
    if (!scanResult.value.items) scanResult.value.items = []
    scanResult.value.items.push(newItem.value.trim())
    newItem.value = ''
  }
}

function removeItem(index) {
  if (scanResult.value && scanResult.value.items) {
    scanResult.value.items.splice(index, 1)
  }
}

function cycleConfidence() {
  if (!scanResult.value) return
  const levels = ['low', 'medium', 'high']
  const current = scanResult.value.confidence || 'medium'
  const index = levels.indexOf(current.toLowerCase())
  const next = levels[(index + 1) % levels.length]
  scanResult.value.confidence = next
}


const mealTypes = [
  { label: 'Breakfast', value: 'breakfast', icon: '/icons/breakfast.svg' },
  { label: 'Lunch', value: 'lunch', icon: '/icons/lunch.svg' },
  { label: 'Dinner', value: 'dinner', icon: '/icons/dinner.svg' },
  { label: 'Snack', value: 'snack', icon: '/icons/snack.svg' },
]

const todayMeals = computed(() => {
  const today = new Date().toDateString()
  return meals.value.filter(m => new Date(m.date).toDateString() === today)
})

const todayCalories = computed(() =>
  todayMeals.value.reduce((sum, m) => sum + (m.calories || 0), 0)
)

const todayProtein = computed(() =>
  todayMeals.value.reduce((sum, m) => sum + (m.protein || 0), 0)
)

const todayCarbs = computed(() =>
  todayMeals.value.reduce((sum, m) => sum + (m.carbs || 0), 0)
)

const todayFat = computed(() =>
  todayMeals.value.reduce((sum, m) => sum + (m.fat || 0), 0)
)

// Load meals from database on mount
onMounted(async () => {
  await loadMeals()
})

async function loadMeals() {
  isLoading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const dbMeals = await mealsApi.getMeals('guest', today)
    meals.value = dbMeals.map(m => ({
      id: m.id,
      type: m.meal_type,
      typeLabel: mealTypes.find(mt => mt.value === m.meal_type)?.label,
      typeIcon: mealTypes.find(mt => mt.value === m.meal_type)?.icon,
      note: m.note,
      image: m.image_path,
      date: m.logged_at,
      time: new Date(m.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: m.name,
      calories: m.calories || 0,
      protein: m.protein || 0,
      carbs: m.carbs || 0,
      fat: m.fat || 0,
    }))
  } catch (err) {
    console.error('Failed to load meals:', err)
  } finally {
    isLoading.value = false
  }
}

function openUpload() {
  showUpload.value = true
}

function closeUpload() {
  showUpload.value = false
  previewUrl.value = null
  selectedFile.value = null
  mealNote.value = ''
  mealType.value = 'lunch'
  scanResult.value = null
  scanError.value = null
  isScanning.value = false
  newItem.value = ''
}

function onFileSelect(event) {
  const file = event.target.files[0]
  if (file) processFile(file)
}

function onDrop(event) {
  event.preventDefault()
  dragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) processFile(file)
}

function onDragOver(event) {
  event.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function processFile(file) {
  if (!file.type.startsWith('image/')) return
  selectedFile.value = file
  scanResult.value = null
  scanError.value = null
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
    scanMealPhoto(e.target.result)
  }
  reader.readAsDataURL(file)
}

async function scanMealPhoto(base64Data) {
  isScanning.value = true
  scanError.value = null
  try {
    const result = await aiApi.scanMeal(base64Data, mealType.value)
    scanResult.value = result
    if (result.name && !mealNote.value) {
      mealNote.value = result.name
    }
  } catch (err) {
    scanError.value = err.message || 'Failed to analyze meal'
  } finally {
    isScanning.value = false
  }
}

async function retryScan() {
  if (previewUrl.value) {
    await scanMealPhoto(previewUrl.value)
  }
}

async function saveMeal() {
  if (!previewUrl.value || isSaving.value) return

  isSaving.value = true
  try {
    const savedMeal = await mealsApi.saveMeal({
      mealType: mealType.value,
      name: scanResult.value?.name || mealNote.value || null,
      note: mealNote.value,
      image: previewUrl.value,
      calories: scanResult.value?.calories || 0,
      protein: scanResult.value?.protein || 0,
      carbs: scanResult.value?.carbs || 0,
      fat: scanResult.value?.fat || 0,
    })

    meals.value.unshift({
      id: savedMeal.id,
      type: savedMeal.meal_type,
      typeLabel: mealTypes.find(m => m.value === savedMeal.meal_type)?.label,
      typeIcon: mealTypes.find(m => m.value === savedMeal.meal_type)?.icon,
      note: savedMeal.note,
      image: savedMeal.image_path,
      date: savedMeal.logged_at,
      time: new Date(savedMeal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      name: savedMeal.name,
      calories: savedMeal.calories || 0,
      protein: savedMeal.protein || 0,
      carbs: savedMeal.carbs || 0,
      fat: savedMeal.fat || 0,
    })

    closeUpload()
  } catch (err) {
    console.error('Failed to save meal:', err)
  } finally {
    isSaving.value = false
  }
}

async function removeMeal(id) {
  try {
    await mealsApi.deleteMeal(id)
    meals.value = meals.value.filter(m => m.id !== id)
  } catch (err) {
    console.error('Failed to delete meal:', err)
    meals.value = meals.value.filter(m => m.id !== id)
  }
}
</script>

<template>
  <div class="tracker-page">
    <!-- Header -->
    <div class="tracker-header">
      <div>
        <h1><img src="/pan-food.png" alt="" class="header-icon" /> Meal Tracker</h1>
        <p class="subtitle">Track your meals by snapping a photo</p>
      </div>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-number">{{ todayMeals.length }}</span>
          <span class="stat-label">Meals</span>
        </div>
        <div class="stat-card">
          <span class="stat-number cal">{{ todayCalories }}</span>
          <span class="stat-label">Calories</span>
        </div>
        <div class="stat-card">
          <span class="stat-number prot">{{ todayProtein }}g</span>
          <span class="stat-label">Protein</span>
        </div>
        <div class="stat-card">
          <span class="stat-number carb">{{ todayCarbs }}g</span>
          <span class="stat-label">Carbs</span>
        </div>
        <div class="stat-card">
          <span class="stat-number fats">{{ todayFat }}g</span>
          <span class="stat-label">Fat</span>
        </div>
      </div>
    </div>

    <!-- Add meal button -->
    <button class="add-meal-btn" @click="openUpload">
      <span class="plus">+</span>
      <span>Log a meal</span>
    </button>

    <!-- Upload modal -->
    <Transition name="modal">
      <div v-if="showUpload" class="modal-overlay">
        <div class="modal-card">
          <button class="modal-close" @click="closeUpload">✕</button>
          <h2>Add Meal</h2>

          <!-- Meal type selector -->
          <div class="type-selector">
            <button
              v-for="type in mealTypes"
              :key="type.value"
              class="type-btn"
              :class="{ active: mealType === type.value }"
              @click="mealType = type.value"
            >
              <img :src="type.icon" alt="" class="type-icon" />
              {{ type.label }}
            </button>
          </div>

          <!-- Drop zone -->
          <div
            v-if="!previewUrl"
            class="drop-zone"
            :class="{ 'drag-over': dragOver }"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              @change="onFileSelect"
            />
            <div class="drop-content">
              <img src="/icons/camera.svg" alt="" class="drop-icon-img" />
              <p class="drop-text">Tap to take a photo or upload</p>
              <p class="drop-hint">or drag & drop an image here</p>
            </div>
          </div>

          <!-- Preview -->
          <div v-else class="preview-container">
            <img :src="previewUrl" alt="Meal preview" class="preview-img" />
            <button class="change-photo" @click="previewUrl = null; selectedFile = null; scanResult = null; scanError = null">
              Change photo
            </button>

            <!-- Scanning indicator -->
            <div v-if="isScanning" class="scan-status scanning">
              <div class="scan-spinner"></div>
              <span>Analyzing your meal...</span>
            </div>

            <!-- Scan error -->
            <div v-else-if="scanError" class="scan-status error">
              <span>⚠️ {{ scanError }}</span>
              <button class="retry-btn" @click="retryScan">Retry</button>
            </div>

            <!-- Scan results -->
            <div v-else-if="scanResult" class="scan-results">
              <div class="scan-header">
                <input v-model="scanResult.name" class="scan-meal-name-input" placeholder="Meal name" />
                <button
                  v-if="scanResult.confidence"
                  class="confidence-badge btn-badge"
                  :class="scanResult.confidence"
                  @click="cycleConfidence"
                  title="Change confidence level"
                >
                  {{ scanResult.confidence }}
                  <span class="badge-icon">⟳</span>
                </button>
              </div>
              <p v-if="scanResult.description" class="scan-description">{{ scanResult.description }}</p>
              
              <div v-if="scanResult.description" class="scan-divider"></div>

              <!-- Items detected -->
              <div class="scan-items-wrapper">
                <div v-if="scanResult.items && scanResult.items.length" class="scan-items">
                  <span v-for="(item, i) in scanResult.items" :key="i" class="item-tag">
                    {{ item }}
                    <button class="remove-item-btn" @click="removeItem(i)">×</button>
                  </span>
                </div>
                <div class="add-item-row">
                  <input
                    v-model="newItem"
                    type="text"
                    class="add-item-input"
                    placeholder="Add item..."
                    @keydown.enter.prevent="addItem"
                  />
                  <button class="add-item-btn" @click="addItem">+</button>
                </div>
              </div>

              <div class="scan-divider"></div>

              <!-- Macro bars -->
              <div class="macro-grid">
                <div class="macro-item calories">
                  <div class="macro-top">
                    <span class="macro-label">Calories</span>
                    <div class="macro-input-group">
                      <input v-model.number="scanResult.calories" type="number" class="macro-input" />
                      <span class="unit">kcal</span>
                    </div>
                  </div>
                </div>
                <div class="macro-item protein">
                  <div class="macro-top">
                    <span class="macro-label">Protein</span>
                    <div class="macro-input-group">
                      <input v-model.number="scanResult.protein" type="number" class="macro-input" />
                      <span class="unit">g</span>
                    </div>
                  </div>
                </div>
                <div class="macro-item carbs">
                  <div class="macro-top">
                    <span class="macro-label">Carbs</span>
                    <div class="macro-input-group">
                      <input v-model.number="scanResult.carbs" type="number" class="macro-input" />
                      <span class="unit">g</span>
                    </div>
                  </div>
                </div>
                <div class="macro-item fat">
                  <div class="macro-top">
                    <span class="macro-label">Fat</span>
                    <div class="macro-input-group">
                      <input v-model.number="scanResult.fat" type="number" class="macro-input" />
                      <span class="unit">g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Save -->
          <button
            class="save-btn"
            :disabled="!previewUrl || isScanning || isSaving"
            @click="saveMeal"
          >
            {{ isSaving ? 'Saving...' : isScanning ? 'Analyzing...' : scanResult ? 'Save Meal' : 'Save without analysis' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Today's meals -->
    <div class="meals-section">
      <h2 v-if="todayMeals.length">Today's Meals</h2>
      <div v-if="todayMeals.length" class="meals-grid">
        <div v-for="meal in todayMeals" :key="meal.id" class="meal-card">
          <div class="meal-img-wrapper">
            <img :src="meal.image" :alt="meal.typeLabel" />
          </div>
          <div class="meal-info">
            <div class="meal-top">
              <span class="meal-type">
                <img :src="meal.typeIcon" alt="" class="meal-type-icon" />
                {{ meal.typeLabel }}
              </span>
              <span class="meal-time">{{ meal.time }}</span>
            </div>
            <p v-if="meal.name" class="meal-name-text">{{ meal.name }}</p>
            <p v-else-if="meal.note" class="meal-note-text">{{ meal.note }}</p>
            <div v-if="meal.calories" class="meal-macros-inline">
              <span class="macro-tag cal">{{ meal.calories }} kcal</span>
              <span class="macro-tag prot">{{ meal.protein }}g P</span>
              <span class="macro-tag carb">{{ meal.carbs }}g C</span>
              <span class="macro-tag fats">{{ meal.fat }}g F</span>
            </div>
          </div>
          <button class="meal-delete" @click="removeMeal(meal.id)">
            <img src="/icons/trash.svg" alt="Delete" class="delete-icon" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <img src="/icons/photo.svg" alt="" class="empty-icon-img" />
        <p>No meals logged today</p>
        <p class="empty-hint">Tap "Log a meal" to get started!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tracker-page {
  min-height: 100vh;
  background: #f8faf8;
  padding: 32px 48px;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.tracker-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  width: 28px;
  height: 28px;
}

.subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #22c55e;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-number.cal { color: #f59e0b; }
.stat-number.prot { color: #3b82f6; }
.stat-number.carb { color: #8b5cf6; }
.stat-number.fats { color: #ef4444; }

/* Add button */
.add-meal-btn {
  width: 100%;
  padding: 16px;
  background: #ffffff;
  border: 2px dashed #bbf7d0;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #22c55e;
  transition: all 0.2s;
  margin-bottom: 32px;
}

.add-meal-btn:hover {
  background: #f0fdf4;
  border-color: #22c55e;
}

.add-meal-btn .plus {
  font-size: 1.4rem;
  font-weight: 700;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
  position: relative;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.modal-card h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #111827;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.95) translateY(10px);
}

/* Type selector */
.type-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.type-btn {
  flex: 1;
  min-width: 0;
  padding: 10px 8px;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.type-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.type-btn.active {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #166534;
}

/* Drop zone */
.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #22c55e;
  background: #f0fdf4;
}

.drop-icon-img {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto 12px;
}

.drop-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px;
}

.drop-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

/* Preview */
.preview-container {
  margin-bottom: 16px;
  text-align: center;
}

.preview-img {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 8px;
}

.change-photo {
  background: none;
  border: none;
  color: #22c55e;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
}

.change-photo:hover {
  text-decoration: underline;
}

/* Note input */
.meal-note {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #111827;
  background: #fafafa;
  outline: none;
  transition: all 0.2s;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.meal-note:focus {
  border-color: #22c55e;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.meal-note::placeholder {
  color: #9ca3af;
}

/* Save button */
.save-btn {
  width: 100%;
  padding: 13px;
  background: #22c55e;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.save-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* Meals section */
.meals-section {
  margin-top: 8px;
}

.meals-section h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.meals-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meal-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  transition: box-shadow 0.2s;
}

.meal-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.meal-img-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.meal-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meal-info {
  flex: 1;
  min-width: 0;
}

.meal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.meal-type {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 6px;
}

.meal-type-icon {
  width: 18px;
  height: 18px;
}

.meal-time {
  font-size: 0.8rem;
  color: #9ca3af;
}

.meal-note-text {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meal-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.4;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.delete-icon {
  width: 20px;
  height: 20px;
}

.meal-delete:hover {
  opacity: 1;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: #6b7280;
}

.empty-icon-img {
  width: 64px;
  height: 64px;
  display: block;
  margin: 0 auto 16px;
  opacity: 0.4;
}

.empty-state p {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.empty-hint {
  font-size: 0.85rem !important;
  font-weight: 400 !important;
  color: #9ca3af !important;
}

/* Scan status */
.scan-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 12px;
}

.scan-status.scanning {
  background: #f0fdf4;
  color: #166534;
}

.scan-status.error {
  background: #fef2f2;
  color: #dc2626;
  flex-direction: column;
  gap: 8px;
}

.retry-btn {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #b91c1c;
}

.scan-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid #bbf7d0;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Scan results */
.scan-results {
  margin-top: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.scan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.scan-meal-name-input {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  padding: 4px 8px;
  width: 100%;
  margin-right: 8px;
  background: transparent;
  transition: all 0.2s;
}

.scan-meal-name-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #22c55e;
  border-style: solid;
}

.scan-meal-name-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.scan-meal-name {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.macro-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.macro-input {
  width: 48px;
  padding: 2px 4px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: right;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #fff;
}

.macro-item.calories .macro-input { color: #f59e0b; }
.macro-item.protein .macro-input { color: #3b82f6; }
.macro-item.carbs .macro-input { color: #8b5cf6; }
.macro-item.fat .macro-input { color: #ef4444; }

.macro-input:focus {
  outline: none;
  border-color: #22c55e;
}

.unit {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.confidence-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-badge {
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-badge:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.badge-icon {
  font-size: 0.8rem;
  opacity: 0.8;
  font-weight: 700;
}

.confidence-badge.high {
  background: #dcfce7;
  color: #166534;
}

.confidence-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.confidence-badge.low {
  background: #fee2e2;
  color: #991b1b;
}

.scan-description {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 10px;
  line-height: 1.4;
}

.scan-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 16px 0;
  width: 100%;
}

.scan-items-wrapper {
  margin-bottom: 12px;
}

.scan-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.item-tag {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 6px 3px 10px;
  background: #f0fdf4;
  color: #166534;
  border-radius: 20px;
  border: 1px solid #bbf7d0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.remove-item-btn {
  background: none;
  border: none;
  color: #166534;
  font-size: 1rem;
  line-height: 1;
  padding: 0 4px;
  cursor: pointer;
  opacity: 0.6;
  border-radius: 50%;
}

.remove-item-btn:hover {
  opacity: 1;
  background: rgba(22, 101, 52, 0.1);
}

.add-item-row {
  display: flex;
  gap: 8px;
}

.add-item-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.8rem;
  background: #fff;
  color: #111827;
}

.add-item-input:focus {
  outline: none;
  border-color: #22c55e;
}

.add-item-btn {
  padding: 6px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-btn:hover {
  background: #dcfce7;
  border-color: #22c55e;
}

/* Macro grid */
.macro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.macro-item {
  padding: 8px 10px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
}

.macro-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.macro-label {
  font-size: 0.72rem;
  font-weight: 500;
  color: #6b7280;
}

.macro-value {
  font-size: 0.8rem;
  font-weight: 700;
}

.macro-item.calories .macro-value { color: #f59e0b; }
.macro-item.protein .macro-value { color: #3b82f6; }
.macro-item.carbs .macro-value { color: #8b5cf6; }
.macro-item.fat .macro-value { color: #ef4444; }

.macro-bar {
  height: 4px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.macro-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.macro-item.calories .macro-fill { background: #f59e0b; }
.macro-item.protein .macro-fill { background: #3b82f6; }
.macro-item.carbs .macro-fill { background: #8b5cf6; }
.macro-item.fat .macro-fill { background: #ef4444; }

/* Meal card macros */
.meal-name-text {
  font-size: 0.85rem;
  color: #111827;
  font-weight: 600;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meal-macros-inline {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.macro-tag {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.macro-tag.cal { background: #fef3c7; color: #92400e; }
.macro-tag.prot { background: #dbeafe; color: #1e40af; }
.macro-tag.carb { background: #ede9fe; color: #5b21b6; }
.macro-tag.fats { background: #fee2e2; color: #991b1b; }
</style>
