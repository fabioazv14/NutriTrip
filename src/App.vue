<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const showNavbar = computed(() => !route.meta.hideNavbar)
const isOnboarded = ref(false)
const userName = ref('')
const showUserMenu = ref(false)

function checkUser() {
  // Check if user is authenticated first
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  isOnboarded.value = !!localStorage.getItem('nutritrip_profile')

  if (isAuthenticated) {
    const userData = localStorage.getItem('user')
    console.log('Raw user data from localStorage:', userData) // Debug log

    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        console.log('Parsed user object:', parsed) // Debug log

        // Priority 1: Check for 'nome' (Portuguese backend)
        if (parsed.nome) {
          userName.value = parsed.nome
        } else if (parsed.user && parsed.user.nome) {
          userName.value = parsed.user.nome
        }
        // Priority 2: Check for 'name' (English backend)
        else if (parsed.name) {
          userName.value = parsed.name
        } else if (parsed.user && parsed.user.name) {
          userName.value = parsed.user.name
        }
        // Fallback: Email
        else if (parsed.email) {
           userName.value = parsed.email.split('@')[0]
        }
        else if (parsed.user && parsed.user.email) {
           userName.value = parsed.user.email.split('@')[0]
        }
        else {
          console.log('Could not find name property in user object')
          userName.value = 'User'
        }
      } catch (e) {
        console.error('Error parsing user data', e)
        userName.value = 'User'
      }
    }
  } else {
    userName.value = ''
  }
}

onMounted(() => {
  checkUser()
  // Listen for storage events in case login happens in another tab
  window.addEventListener('storage', checkUser)
})

watch(() => route.path, checkUser)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleLogout() {
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('nutritrip_profile')
  isOnboarded.value = false
  userName.value = ''
  showUserMenu.value = false
  router.push('/login')
}
</script>

<template>
  <nav v-if="showNavbar">
    <div class="nav-left">
      <RouterLink :to="userName ? '/dashboard' : '/'" class="brand"><img src="../public/NutriTripBanner.png" alt="NutriTrip Logo" /></RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/meals">Meals</RouterLink>
      <RouterLink to="/chatbot">Chatbot</RouterLink>
    </div>
    <div class="nav-right" v-if="!userName">
      <RouterLink to="/login" class="btn-login">Login</RouterLink>
      <RouterLink to="/register" class="btn-signup">Sign Up</RouterLink>
    </div>
    <div class="nav-right user-menu-container" v-else>
      <div class="user-trigger" @click="toggleUserMenu">
        <span class="user-name">{{ userName }}</span>
        <span class="chevron">▼</span>
      </div>
      <div v-if="showUserMenu" class="user-dropdown">
        <button @click="handleLogout" class="btn-logout">Log Out</button>
      </div>
    </div>
  </nav>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style scoped>
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

.user-menu-container {
  position: relative;
  cursor: pointer;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  user-select: none;
}

.user-trigger:hover {
  background: #f3f4f6;
}

.user-name {
  font-weight: 500;
  color: #374151;
}

.chevron {
  font-size: 0.8rem;
  color: #6b7280;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 160px;
  padding: 4px;
  z-index: 50;
}

.btn-logout {
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: none;
  border: none;
  border-radius: 4px;
  color: #ef4444;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #fef2f2;
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
.brand img {
  height: 32px;
  width: auto;
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
