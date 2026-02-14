<template>
  <div class="question" :class="{ 'exit-animation': finishing }">
    <div class="progress">
      <span>{{ currentIndex + 1 }} / {{ questions.length }}</span>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: ((currentIndex + 1) / questions.length) * 100 + '%' }"
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

      <!-- Card with conditional animation -->
      <Transition 
        :name="transitionName" 
        mode="out-in"
        @after-leave="afterLeave"
        @after-enter="afterEnter"
      >
        <QuestionCard
          v-if="showCard"
          :key="currentIndex"
          :question="currentQuestion.question"
          :options="currentQuestion.options"
          :multiple="currentQuestion.multiple || false"
          :selected-value="savedAnswer"
          :grid="grid"
          :switching="isSwitch"
          @select="handleAnswer"
          @select2="handleSexAnswer"
        />
      </Transition>

      <!-- Next arrow - hidden for switch questions -->
      <button
        v-if="answered && !finishing && !isSwitch"
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

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import QuestionCard from './QuestionCard.vue'
import { questions } from '@/data/questions'

const router = useRouter()

const currentIndex = ref(0)
const gridIndex = ref([0])
const answers = ref({})
const answered = ref(false)
const swiping = ref(false)
const showCard = ref(true)
const finishing = ref(false)
const direction = ref('forward') // 'forward' or 'back'
const isTransitioning = ref(false)

const currentQuestion = computed(() => questions[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.length - 1)
const isFirstQuestion = computed(() => currentIndex.value === 0)
const grid = computed(() => gridIndex.value.includes(currentIndex.value))
const isSwitch = computed(() => questions[currentIndex.value]?.switching === true)

// Define o nome da transição baseado no tipo (switch ou normal) e direção
const transitionName = computed(() => {
  if (isSwitch.value || questions[currentIndex.value -1]?.switching === true) {
    // Para perguntas switch, usamos flip
    return direction.value === 'forward' ? 'flip-forward' : (questions[currentIndex.value -1] ? 'flip-back' : 'swipe-back')
  } else {
    // Para perguntas normais, usamos swipe
    return direction.value === 'forward' ? 'swipe-forward' : 'swipe-back'
  }
})

const savedAnswer = computed(() => {
  const ans = answers.value[currentIndex.value]
  if (!ans) return null
  // For multiple: ans is an array of values
  // For single: ans is { label, value }
  if (Array.isArray(ans)) return ans
  return ans.value
})

function handleAnswer(option) {
  answers.value[currentIndex.value] = option
  answered.value = true
  if (Array.isArray(option) && option.length === 0) {
    answered.value = false
  }
  console.log('Selected:', option)
}

function handleSexAnswer(option) {
  if (isTransitioning.value) return

  answers.value[currentIndex.value] = option
  answered.value = true
  
  // Avança automaticamente com animação de flip
  direction.value = 'forward'
  isTransitioning.value = true
  showCard.value = false

  setTimeout(async () => {
    currentIndex.value++
    answered.value = !!answers.value[currentIndex.value]
    await nextTick()
    showCard.value = true
  }, 400)
}

function nextQuestion() {
  if (isTransitioning.value) return

  if (!isLastQuestion.value) {
    direction.value = 'forward'
    isTransitioning.value = true
    showCard.value = false

    setTimeout(async () => {
      currentIndex.value++
      answered.value = !!answers.value[currentIndex.value]
      await nextTick()
      showCard.value = true
    }, 400)
  } else {
    // Save profile to localStorage before navigating
    const profile = {
      goal: answers.value[0]?.value || null,
      diet: Array.isArray(answers.value[1]) ? answers.value[1] : (answers.value[1]?.value ? [answers.value[1].value] : null),
      allergies: Array.isArray(answers.value[2]) ? answers.value[2] : (answers.value[2]?.value ? [answers.value[2].value] : null),
      budget: answers.value[3]?.value || null,
    }
    localStorage.setItem('nutritrip_profile', JSON.stringify(profile))

    finishing.value = true
    setTimeout(() => {
      localStorage.setItem('hasCompletedQuestionnaire', 'true')
      router.push('/dashboard')
    }, 800)
  }
}

function prevQuestion() {
  if (isTransitioning.value || isFirstQuestion.value) return

  direction.value = 'back'
  isTransitioning.value = true
  showCard.value = false

  setTimeout(async () => {
    currentIndex.value--
    answered.value = !!answers.value[currentIndex.value]
    await nextTick()
    showCard.value = true
  }, 400)
}

function afterLeave() {
  // Quando a animação de saída termina, podemos fazer algo se necessário
}

function afterEnter() {
  // Quando a animação de entrada termina, liberamos o estado de transição
  isTransitioning.value = false
}
</script>

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

/* ========== ANIMAÇÕES ========== */

/* Swipe animations (para perguntas normais) */
.swipe-forward-leave-active,
.swipe-forward-enter-active,
.swipe-back-leave-active,
.swipe-back-enter-active {
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

.swipe-back-leave-to {
  transform: translateX(120%) rotate(8deg);
  opacity: 0;
}

.swipe-back-enter-from {
  transform: translateX(-100%) rotate(-5deg);
  opacity: 0;
}

/* Flip animations (para perguntas switch) - HORIZONTAL (rotateY) */
.flip-forward-leave-active,
.flip-forward-enter-active,
.flip-back-leave-active,
.flip-back-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  perspective: 1200px;
}

/* FLIP PARA A FRENTE (avançar) */
.flip-forward-leave-to {
  transform: rotateY(90deg) scale(0.8);
  opacity: 0;
}

.flip-forward-enter-from {
  transform: rotateY(-90deg) scale(0.8);
  opacity: 0;
}

/* FLIP PARA TRÁS (voltar) */
.flip-back-leave-to {
  transform: rotateY(-90deg) scale(0.8);
  opacity: 0;
}

.flip-back-enter-from {
  transform: rotateY(90deg) scale(0.8);
  opacity: 0;
}

/* Efeito de profundidade adicional (opcional) */
.flip-forward-leave-active,
.flip-forward-enter-active,
.flip-back-leave-active,
.flip-back-enter-active {
  filter: brightness(1);
}

.flip-forward-leave-to,
.flip-forward-enter-from,
.flip-back-leave-to,
.flip-back-enter-from {
  filter: brightness(0.9);
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