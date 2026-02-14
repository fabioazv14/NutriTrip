<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const showNavbar = computed(() => !route.meta.hideNavbar)
const isOnboarded = ref(false)

function checkOnboarded() {
  isOnboarded.value = !!localStorage.getItem('nutritrip_profile') || localStorage.getItem('isAuthenticated') === 'true'
}

function handleLogout() {
  localStorage.removeItem('nutritrip_profile')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('hasCompletedQuestionnaire')
  checkOnboarded()
  router.push('/')
}

onMounted(checkOnboarded)
watch(() => route.path, checkOnboarded)
</script>

<template>
  <nav v-if="showNavbar">
    <div class="nav-left">
      <RouterLink to="/" class="brand">🥗 NutriTrip</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/meals">Meals</RouterLink>
      <RouterLink to="/chatbot">Chatbot</RouterLink>
    </div>
    <div class="nav-right" v-if="!isOnboarded">
      <RouterLink to="/login" class="btn-login">Login</RouterLink>
      <RouterLink to="/register" class="btn-signup">Sign Up</RouterLink>
    </div>
    <div v-else class="nav-right">
       <button @click="handleLogout" class="btn-logout">Logout</button>
    </div>
  </nav>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style scoped>
.btn-logout {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
}
.btn-logout:hover {
  background: #f3f4f6;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  font-size: 1.2rem;
  font-weight: 700;
  color: #22c55e;
  letter-spacing: -0.5px;
  margin-right: 8px;
}

.nav-left a {
  text-decoration: none;
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 8px 4px;
  transition: color 0.2s;
  position: relative;
}

.nav-left a:hover {
  color: #111827;
}

.nav-left a.router-link-active {
  color: #22c55e;
  font-weight: 600;
}

.nav-left a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #22c55e;
  border-radius: 1px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-login {
  text-decoration: none;
  color: #22c55e;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 20px;
  border: 1.5px solid #22c55e;
  border-radius: 10px;
  transition: all 0.2s;
}

.btn-login:hover {
  background: #f0fdf4;
}

.btn-signup {
  text-decoration: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 20px;
  background: #22c55e;
  border: 1.5px solid #22c55e;
  border-radius: 10px;
  transition: all 0.2s;
}

.btn-signup:hover {
  background: #16a34a;
  border-color: #16a34a;
}

/* Brand link */
.brand {
  text-decoration: none;
}

.brand.router-link-active::after {
  display: none;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
