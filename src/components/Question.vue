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
const direction = ref('forward')

// Filter questions based on showIf conditions
const visibleQuestions = computed(() =>
  questions.filter(q => !q.showIf || q.showIf(answers.value))
)

const currentQuestion = computed(() => visibleQuestions.value[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === visibleQuestions.value.length - 1)
const isFirstQuestion = computed(() => currentIndex.value === 0)

const savedAnswer = computed(() => {
  const realIndex = questions.indexOf(currentQuestion.value)
  const ans = answers.value[realIndex]
  if (!ans) return null
  if (Array.isArray(ans)) return ans
  return ans.value
})

function handleAnswer(option) {
  const realIndex = questions.indexOf(currentQuestion.value)
  answers.value[realIndex] = option
  answered.value = true
  if (Array.isArray(option) && option.length === 0) {
    answered.value = false
  }
}

function nextQuestion() {
  if (swiping.value) return

  if (!isLastQuestion.value) {
    direction.value = 'forward'
    swiping.value = true
    showCard.value = false

    setTimeout(async () => {
      currentIndex.value++
      const realIndex = questions.indexOf(visibleQuestions.value[currentIndex.value])
      answered.value = !!answers.value[realIndex]
      await nextTick()
      showCard.value = true
      swiping.value = false
    }, 400)
  } else {
    // Save profile

    const profile = {
      goal: answers.value[0]?.value || null,
      sex: answers.value[1]?.value || null,
      gender: answers.value[2]?.value || null,
      diet: Array.isArray(answers.value[3]) ? answers.value[3] : (answers.value[3]?.value ? [answers.value[3].value] : null),
      allergies: Array.isArray(answers.value[4]) ? answers.value[4] : (answers.value[4]?.value ? [answers.value[4].value] : null),
      budget: answers.value[5]?.value || null,
      menstrualCycle: answers.value[6]?.value || null,
      pregnantOrBreastfeeding: answers.value[7]?.value || 'no',
    }
    localStorage.setItem('nutritrip_profile', JSON.stringify(profile))

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
    const realIndex = questions.indexOf(visibleQuestions.value[currentIndex.value])
    answered.value = !!answers.value[realIndex]
    await nextTick()
    showCard.value = true
    swiping.value = false
  }, 400)
}
</script>

<template>
  <div class="question" :class="{ 'exit-animation': finishing }">
    <div class="progress">
      <span>{{ currentIndex + 1 }} / {{ visibleQuestions.length }}</span>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: ((currentIndex + 1) / visibleQuestions.length) * 100 + '%' }"
        ></div>
      </div>
    </div>

    <div class="card-row">
      <!-- Prev arrow -->
      <button
        v-if="!isFirstQuestion && !finishing"
        class="arrow-btn prev"
        @click="prevQuestion"
      >
        ‹
      </button>
      <div v-else class="arrow-placeholder"></div>

      <!-- Card -->
      <Transition :name="direction === 'forward' ? 'swipe-forward' : 'swipe-back'" mode="out-in">
        <QuestionCard
          v-if="showCard"
          :key="currentIndex"
          :question="currentQuestion.question"
          :options="currentQuestion.options"
          :multiple="currentQuestion.multiple || false"
          :grid="currentQuestion.grid || false"
          :selected-value="savedAnswer"
          @select="handleAnswer"
        />
      </Transition>

      <!-- Next arrow -->
      <button
        v-if="answered && !finishing"
        class="arrow-btn next"
        @click="nextQuestion"
      >
        <span v-if="!isLastQuestion">›</span>
        <span v-else>✓</span>
      </button>
      <div v-else class="arrow-placeholder"></div>
    </div>
  </div>
</template>

<style scoped>
.question {
  background-color: #d7ffe9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px;
  gap: 24px;
}

/* Exit animation */
.question.exit-animation {
  transform: translateY(-100%);
  opacity: 0;
}

/* Progress */
.progress {
  width: 100%;
  max-width: 500px;
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

/* Card row: arrow — card — arrow */
.card-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 650px;
  justify-content: center;
}

/* Arrow buttons */
.arrow-btn {
  width: 56px;
  min-width: 56px;
  height: 80px;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.15);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(34, 197, 94, 0.5);
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}

.arrow-btn:hover {
  background: #22c55e;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.arrow-btn:active {
  background: #16a34a;
  transform: scale(0.93);
}

.arrow-btn.next {
  animation: fadeIn 0.3s ease;
}

.arrow-btn.prev {
  animation: fadeIn 0.3s ease;
}

/* Placeholder to keep card centered when arrow is hidden */
.arrow-placeholder {
  width: 56px;
  min-width: 56px;
  flex-shrink: 0;
}

/* Forward swipe */
.swipe-forward-leave-active,
.swipe-forward-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.swipe-forward-leave-to {
  transform: translateX(-120%);
  opacity: 0;
}

.swipe-forward-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

/* Back swipe */
.swipe-back-leave-active,
.swipe-back-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.swipe-back-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

.swipe-back-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
