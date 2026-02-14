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

export default router
