<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select'])
const selected = ref(null)

function handleSelect(option) {
  selected.value = option.value
  emit('select', option)
}
</script>

<template>
  <div class="question-card">
    <h2 class="question-text">{{ question }}</h2>
    <div class="options">
      <button
        v-for="(option, index) in options"
        :key="index"
        class="option-btn"
        :class="{ active: selected === option.value }"
        @click="handleSelect(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 36px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.question-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 32px;
  line-height: 1.4;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  width: 100%;
  padding: 14px 20px;
  background: #f0fdf4;
  color: #166534;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #bbf7d0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  background: #dcfce7;
  border-color: #22c55e;
}

.option-btn.active {
  background: #22c55e;
  color: #ffffff;
  border-color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.option-btn:active {
  transform: scale(0.97);
}
</style>