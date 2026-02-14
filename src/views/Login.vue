<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { authApi } from '@/services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const user = await authApi.login(email.value, password.value)
    
    // Store user data and auth state
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify(user))
    
    // Set a default profile if none exists, to satisfy the app's onboarding check
    if (!localStorage.getItem('nutritrip_profile')) {
      const defaultProfile = {
        goal: 'maintain',
        diet: [],
        allergies: [],
        budget: 'medium'
      }
      localStorage.setItem('nutritrip_profile', JSON.stringify(defaultProfile))
    }
    
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Brand -->
      <div class="brand">
        <h1>Sign in</h1>
        <p class="subtitle">Welcome back! Sign in to continue.</p>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-pw"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot">Forgot password?</a>
        </div>
        
        <button type="submit" class="btn-login" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="signup-text">
        Don't have an account? <RouterLink to="/register">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
  padding: 24px;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.login-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 44px 36px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

/* Brand */
.brand {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.brand h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 12px;
  background-color: #fef2f2;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #fee2e2;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.825rem;
  font-weight: 600;
  color: #374151;
}

.input-group input[type="email"],
.input-group input[type="password"],
.input-group input[type="text"] {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  background: #fafafa;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  border-color: #22c55e;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input-group input::placeholder {
  color: #9ca3af;
}

/* Password toggle */
.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 48px;
}

.toggle-pw {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

/* Options row */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.825rem;
  color: #6b7280;
  cursor: pointer;
}

.remember input[type="checkbox"] {
  accent-color: #22c55e;
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.forgot {
  font-size: 0.825rem;
  color: #22c55e;
  text-decoration: none;
  font-weight: 500;
}

.forgot:hover {
  text-decoration: underline;
}

/* Button */
.btn-login {
  width: 100%;
  padding: 13px;
  background: #22c55e;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.2px;
}

.btn-login:hover {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-login:active {
  transform: scale(0.98);
}

/* Signup */
.signup-text {
  text-align: center;
  margin-top: 28px;
  font-size: 0.85rem;
  color: #6b7280;
}

.signup-text a {
  color: #22c55e;
  font-weight: 600;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}
</style>
