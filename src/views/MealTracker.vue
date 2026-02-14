<script setup>
import { ref, computed } from 'vue'

const meals = ref([])
const showUpload = ref(false)
const dragOver = ref(false)
const previewUrl = ref(null)
const selectedFile = ref(null)
const mealType = ref('lunch')
const mealNote = ref('')

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

const caloriesCount = computed(() => todayMeals.value.length)

function openUpload() {
  showUpload.value = true
}

function closeUpload() {
  showUpload.value = false
  previewUrl.value = null
  selectedFile.value = null
  mealNote.value = ''
  mealType.value = 'lunch'
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
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function saveMeal() {
  if (!previewUrl.value) return

  meals.value.unshift({
    id: Date.now(),
    type: mealType.value,
    typeLabel: mealTypes.find(m => m.value === mealType.value)?.label,
    typeIcon: mealTypes.find(m => m.value === mealType.value)?.icon,
    note: mealNote.value,
    image: previewUrl.value,
    date: new Date().toISOString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })

  closeUpload()
}

function removeMeal(id) {
  meals.value = meals.value.filter(m => m.id !== id)
}
</script>

<template>
  <div class="tracker-page">
    <!-- Header -->
    <div class="tracker-header">
      <div>
        <h1><img src="/icons/meal-tracker.svg" alt="" class="header-icon" /> Meal Tracker</h1>
        <p class="subtitle">Track your meals by snapping a photo</p>
      </div>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-number">{{ todayMeals.length }}</span>
          <span class="stat-label">Meals today</span>
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
      <div v-if="showUpload" class="modal-overlay" @click.self="closeUpload">
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
            <button class="change-photo" @click="previewUrl = null; selectedFile = null">
              Change photo
            </button>
          </div>

          <!-- Note -->
          <input
            v-model="mealNote"
            type="text"
            class="meal-note"
            placeholder="Add a note (optional)..."
          />

          <!-- Save -->
          <button
            class="save-btn"
            :disabled="!previewUrl"
            @click="saveMeal"
          >
            Save Meal
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
            <p v-if="meal.note" class="meal-note-text">{{ meal.note }}</p>
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
  opacity: 0.5;
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
</style>
