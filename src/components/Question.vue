<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import QuestionCard from './QuestionCard.vue'
import { questions } from '@/data/questions'

const router = useRouter()

const currentIndex = ref(0)
const answers = ref({})
const answered = ref(false)
const swiping = ref(false)
const showCard = ref(true)
const finishing = ref(false)
const direction = ref('forward') // 'forward' or 'back'

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)
const isFirstQuestion = computed(() => currentIndex.value === 0)
const savedAnswer = computed(() => {
  const ans = answers.value[currentIndex.value]
  if (!ans) return null
  // For multiple: ans is an array of values
  // For single: ans is { label, value }
  if (Array.isArray(ans)) return ans
  return ans.value
})

function handleAnswer(option) {
  // option is either { label, value } (single) or [...values] (multiple)
  answers.value[currentIndex.value] = option
  answered.value = true
  // For multiple, consider answered if at least 1 selected
  if (Array.isArray(option) && option.length === 0) {
    answered.value = false
  }
  console.log('Selected:', option)
}

function nextQuestion() {
  if (swiping.value) return

  if (!isLastQuestion.value) {
    direction.value = 'forward'
    swiping.value = true
    showCard.value = false

    setTimeout(async () => {
      currentIndex.value++
      // Restore previous answer if it exists
      answered.value = !!answers.value[currentIndex.value]
      await nextTick()
      showCard.value = true
      swiping.value = false
    }, 400)
  } else {
    finishing.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }
}

function prevQuestion() {
  if (swiping.value || isFirstQuestion.value) return

  direction.value = 'back'
  swiping.value = true
  showCard.value = false

  setTimeout(async () => {
    currentIndex.value--
    answered.value = !!answers.value[currentIndex.value]
    await nextTick()
    showCard.value = true
    swiping.value = false
  }, 400)
}
</script>

<template>
  <div class="question" :class="{ 'exit-animation': finishing }">
    <!-- Prev arrow — full-height bar on the left -->
    <button
      v-if="!isFirstQuestion && !finishing"
      class="prev-bar"
      @click="prevQuestion"
    >
      <span>‹</span>
    </button>

    <div class="question-wrapper">
      <!-- Progress -->
      <div class="progress">
        <span>{{ currentIndex + 1 }} / {{ questions.length }}</span>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: ((currentIndex + 1) / questions.length) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <!-- Card with swipe animation -->
      <Transition :name="direction === 'forward' ? 'swipe-forward' : 'swipe-back'" mode="out-in">
        <QuestionCard
          v-if="showCard"
          :key="currentIndex"
          :question="currentQuestion.question"
          :options="currentQuestion.options"
          :multiple="currentQuestion.multiple || false"
          :selected-value="savedAnswer"
          @select="handleAnswer"
        />
      </Transition>
    </div>

    <!-- Next arrow — full-height bar on the right -->
    <button
      v-if="answered && !finishing"
      class="next-bar"
      @click="nextQuestion"
    >
      <span v-if="!isLastQuestion">›</span>
      <span v-else>✓</span>
    </button>
  </div>
</template>

<style scoped>
.question {
  background-color: #d7ffe9;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Exit animation — whole screen slides up and fades */
.question.exit-animation {
  transform: translateY(-100%);
  opacity: 0;
}

.question-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 500px;
  padding: 16px;
}

/* Progress */
.progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.progress span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #166534;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #22c55e;
  border-radius: 100px;
  transition: width 0.4s ease;
}

/* Forward swipe — leave: flies left, enter: comes from right */
.swipe-forward-leave-active,
.swipe-forward-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.swipe-forward-leave-to {
  transform: translateX(-120%) rotate(-8deg);
  opacity: 0;
}

.swipe-forward-enter-from {
  transform: translateX(100%) rotate(5deg);
  opacity: 0;
}

/* Back swipe — leave: flies right, enter: comes from left */
.swipe-back-leave-active,
.swipe-back-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.swipe-back-leave-to {
  transform: translateX(120%) rotate(8deg);
  opacity: 0;
}

.swipe-back-enter-from {
  transform: translateX(-100%) rotate(-5deg);
  opacity: 0;
}

/* Shared bar styles */
.next-bar,
.prev-bar {
  position: fixed;
  top: 0;
  width: 100px;
  height: 100vh;
  background: rgba(34, 197, 94, 0.15);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: rgba(34, 197, 94, 0.5);
  transition: all 0.3s ease;
}

.next-bar:hover,
.prev-bar:hover {
  background: rgba(34, 197, 94, 0.95);
  color: #ffffff;
}

.next-bar:active,
.prev-bar:active {
  background: #16a34a;
}

/* Right bar */
.next-bar {
  right: 0;
  animation: slideInRight 0.3s ease;
}

/* Left bar */
.prev-bar {
  left: 0;
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
