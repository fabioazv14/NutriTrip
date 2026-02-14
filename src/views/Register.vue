<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const error = ref('')

function handleRegister() {
  error.value = ''

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  // TODO: add real registration logic
  console.log('Register:', name.value, email.value, password.value)
  localStorage.setItem('isAuthenticated', 'true')
  router.push('/dashboard')
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <!-- Brand -->
      <div class="brand">
        <h1>Create account</h1>
        <p class="subtitle">Join NutriTrip — it's free!</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="input-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="John Doe"
            required
            autocomplete="name"
          />
        </div>

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
              placeholder="Min. 6 characters"
              required
              autocomplete="new-password"
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

        <div class="input-group">
          <label for="confirm-password">Confirm Password</label>
          <div class="password-wrapper">
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-pw"
              @click="showConfirm = !showConfirm"
            >
              {{ showConfirm ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-register">Sign Up</button>
      </form>

      <p class="login-text">
        Already have an account? <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%);
  padding: 24px;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.register-card {
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
.register-form {
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

/* Button */
.btn-register {
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

.btn-register:hover {
  background: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-register:active {
  transform: scale(0.98);
}

/* Login link */
.login-text {
  text-align: center;
  margin-top: 28px;
  font-size: 0.85rem;
  color: #6b7280;
}

.login-text a {
  color: #22c55e;
  font-weight: 600;
  text-decoration: none;
}

.login-text a:hover {
  text-decoration: underline;
}
</style>
