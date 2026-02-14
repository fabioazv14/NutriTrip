<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showNavbar = computed(() => !route.meta.hideNavbar)
</script>

<template>
  <nav v-if="showNavbar">
    <div class="nav-left">
      <span class="brand">🥗 NutriTrip</span>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/meals">Meals</RouterLink>
      <RouterLink to="/chatbot">Chatbot</RouterLink>
    </div>
    <div class="nav-right">
      <RouterLink to="/login" class="btn-login">Login</RouterLink>
      <RouterLink to="/register" class="btn-signup">Sign Up</RouterLink>
    </div>
  </nav>
  <RouterView />
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
</style>
