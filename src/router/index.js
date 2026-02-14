import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../views/Onboarding.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/questionnaire',
    name: 'Questionnaire',
    component: () => import('../views/Questionnaire.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { hideNavbar: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/meals',
    name: 'MealTracker',
    component: () => import('../views/MealTracker.vue'),
  },
  {
    path: '/chatbot',
    name: 'Chatbot',
    component: () => import('../views/Chatbot.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const hasCompletedQuestionnaire = localStorage.getItem('hasCompletedQuestionnaire') === 'true'

  // Restricted routes if not authenticated
  const protectedRoutes = ['Dashboard', 'MealTracker', 'Chatbot', 'Questionnaire']
  if (protectedRoutes.includes(to.name) && !isAuthenticated) {
    return next('/login')
  }

  // Restricted routes if authenticated
  if (isAuthenticated) {
    if (to.name === 'Login' || to.name === 'Register' || to.name === 'Home') {
      return next('/dashboard')
    }
    // Prevent re-taking questionnaire if already completed
    if (to.name === 'Questionnaire' && hasCompletedQuestionnaire) {
      return next('/dashboard')
    }
  }

  next()
})

export default router
