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

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)

function handleAnswer(option) {
  answers.value[currentIndex.value] = option
  answered.value = true
  console.log('Selected:', option)
}

function nextQuestion() {
  if (swiping.value) return

  if (!isLastQuestion.value) {
    swiping.value = true
    showCard.value = false

    setTimeout(async () => {
      currentIndex.value++
      answered.value = false
      await nextTick()
      showCard.value = true
      swiping.value = false
    }, 400)
  } else {
    // Last question — trigger exit animation then go to dashboard
    finishing.value = true
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }
}
</script>

<template>
  <div class="question" :class="{ 'exit-animation': finishing }">
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
      <Transition name="swipe" mode="out-in">
        <QuestionCard
          v-if="showCard"
          :key="currentIndex"
          :question="currentQuestion.question"
          :options="currentQuestion.options"
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

/* Swipe animation — leave: card flies out to the left */
.swipe-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.swipe-leave-to {
  transform: translateX(-120%) rotate(-8deg);
  opacity: 0;
}

/* Swipe animation — enter: new card slides in from the right */
.swipe-enter-active {
  transition: all 0.4s cubic-bezier(0.0, 0, 0.2, 1);
}

.swipe-enter-from {
  transform: translateX(100%) rotate(5deg);
  opacity: 0;
}

/* Next bar — full height, right side */
.next-bar {
  position: fixed;
  right: 0;
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
  animation: slideIn 0.3s ease;
}

.next-bar:hover {
  background: rgba(34, 197, 94, 0.95);
  color: #ffffff;
}

.next-bar:active {
  background: #16a34a;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
