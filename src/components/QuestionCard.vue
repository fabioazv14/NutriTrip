<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  grid: {
    type: Boolean,
    default: false,
  },
  // For single: String | null, for multiple: Array | null
  selectedValue: {
    default: null,
  },
})

const emit = defineEmits(['select'])

// Single select
const selected = ref(props.multiple ? null : props.selectedValue)

// Multiple select
const selectedMultiple = ref(
  props.multiple && Array.isArray(props.selectedValue)
    ? [...props.selectedValue]
    : []
)

watch(() => props.selectedValue, (val) => {
  if (props.multiple) {
    selectedMultiple.value = Array.isArray(val) ? [...val] : []
  } else {
    selected.value = val
  }
})

function isActive(option) {
  if (props.multiple) {
    return selectedMultiple.value.includes(option.value)
  }
  return selected.value === option.value
}

function handleSelect(option) {
  if (props.multiple) {
    if (option.exclusive) {
      // Exclusive option: deselect everything else, toggle this one
      if (selectedMultiple.value.includes(option.value)) {
        selectedMultiple.value = []
      } else {
        selectedMultiple.value = [option.value]
      }
    } else {
      // Non-exclusive option: remove any exclusive options first
      const exclusiveValues = props.options.filter(o => o.exclusive).map(o => o.value)
      selectedMultiple.value = selectedMultiple.value.filter(v => !exclusiveValues.includes(v))

      const idx = selectedMultiple.value.indexOf(option.value)
      if (idx === -1) {
        selectedMultiple.value.push(option.value)
      } else {
        selectedMultiple.value.splice(idx, 1)
      }
    }
    emit('select', [...selectedMultiple.value])
  } else {
    selected.value = option.value
    emit('select', option)
  }
}
</script>

<template>
  <div class="question-card">
    <h2 class="question-text">{{ question }}</h2>
    <p v-if="multiple" class="hint">Select all that apply</p>
    <div class="options" :class="{ 'options-grid': grid }">
      <button
        v-for="(option, index) in options"
        :key="index"
        class="option-btn"
        :class="{ active: isActive(option) }"
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
  margin-bottom: 8px;
  line-height: 1.4;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 24px;
}

.question-card:not(:has(.hint)) .question-text {
  margin-bottom: 32px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.options-grid .option-btn {
  padding: 16px 12px;
  font-size: 0.92rem;
  text-align: center;
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