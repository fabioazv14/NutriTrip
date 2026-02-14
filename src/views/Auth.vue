<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services/api'

const router = useRouter()
const isLogin = ref(true) // Toggle between Login and Register
const error = ref('')

// Login State
const loginEmail = ref('')
const loginPassword = ref('')
const showLoginPassword = ref(false)

// Register State
const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const confirmPassword = ref('')
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

async function handleLogin() {
  error.value = ''
  try {
    const response = await authApi.login(loginEmail.value, loginPassword.value)
    
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('nutritrip_profile', JSON.stringify(response))
    window.dispatchEvent(new Event('storage')) // Force update if needed
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message
  }
}

async function handleRegister() {
  error.value = ''

  if (registerPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }

  if (registerPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  try {
    // Missing fields in UI: dob, genero. Using defaults for now.
    const response = await authApi.signup({
      nome: registerName.value,
      email: registerEmail.value,
      password: registerPassword.value,
      dob: '2000-01-01',
      genero: 'O'
    })

    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('nutritrip_profile', JSON.stringify(response))
    window.dispatchEvent(new Event('storage')) // Force update if needed
    // Redirect to Questionnaire on sign up
    router.push('/questionnaire')
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Registration failed'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Brand -->
      <div class="brand">
        <span class="logo">🥗 NutriTrip</span>
        <h1>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h1>
        <p class="subtitle">
          {{ isLogin ? 'Sign in to continue to your dashboard.' : 'Join NutriTrip to start your journey!' }}
        </p>
      </div>

      <!-- Toggle Buttons -->
      <div class="auth-toggle">
        <button 
          :class="['toggle-btn', { active: isLogin }]" 
          @click="isLogin = true"
        >
          Login
        </button>
        <button 
          :class="['toggle-btn', { active: !isLogin }]" 
          @click="isLogin = false"
        >
          Sign Up
        </button>
      </div>

      <!-- Error -->
      <div v-if="!isLogin && error" class="error-msg">{{ error }}</div>

      <!-- Login Form -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label for="login-email">Email</label>
          <input
            id="login-email"
            v-model="loginEmail"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="input-group">
          <label for="login-password">Password</label>
          <div class="password-wrapper">
            <input
              id="login-password"
              v-model="loginPassword"
              :type="showLoginPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-pw"
              @click="showLoginPassword = !showLoginPassword"
            >
              {{ showLoginPassword ? '🙈' : '👁️' }}
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

        <button type="submit" class="btn-primary">Sign In</button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label for="reg-name">Full Name</label>
          <input
            id="reg-name"
            v-model="registerName"
            type="text"
            placeholder="John Doe"
            required
            autocomplete="name"
          />
        </div>

        <div class="input-group">
          <label for="reg-email">Email</label>
          <input
            id="reg-email"
            v-model="registerEmail"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="input-group">
          <label for="reg-password">Password</label>
          <div class="password-wrapper">
            <input
              id="reg-password"
              v-model="registerPassword"
              :type="showRegisterPassword ? 'text' : 'password'"
              placeholder="Min. 6 characters"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-pw"
              @click="showRegisterPassword = !showRegisterPassword"
            >
              {{ showRegisterPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div class="input-group">
          <label for="confirm-password">Confirm Password</label>
          <div class="password-wrapper">
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-pw"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary">Sign Up</button>
      </form>
      
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
  padding: 24px;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.auth-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

/* Brand */
.brand {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: #22c55e;
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Toggle */
.auth-toggle {
  display: flex;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Error */
.error-msg {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 20px;
  text-align: center;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.input-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  background: #fafafa;
  outline: none;
  transition: all 0.2s ease;
}

.input-group input:focus {
  border-color: #22c55e;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
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

/* Options */
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

/* Button */
.btn-primary {
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
  margin-top: 8px;
}

.btn-primary:hover {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
