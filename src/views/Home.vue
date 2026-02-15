<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function getStarted() {
  const profile = localStorage.getItem('nutritrip_profile')
  if (profile) {
    router.push('/dashboard')
  } else {
    router.push('/onboarding')
  }
}
</script>

<template>
  <div class="landing">
    <img src="/NutriTrip.png" alt="NutriTrip Logo" class="bg-logo" aria-hidden="true" />
    <!-- Nav -->
    <header class="landing-nav">
      <img src="/NutriTripBanner.png" alt="NutriTrip Logo" class="logo" />
      <div class="nav-actions">
        <RouterLink to="/login" class="nav-link">Log in</RouterLink>
        <RouterLink to="/register" class="nav-btn">Sign up</RouterLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="badge">✨ AI-Powered Nutrition</div>
        <h1>Your personal <span class="highlight">nutrition</span> companion</h1>
        <p class="hero-desc">
          Track your meals, get AI-powered nutrition advice, and build healthier eating habits — all in one place.
        </p>
        <div class="hero-actions">
          <button class="cta-primary" @click="getStarted">
            Get Started — It's Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <RouterLink to="/login" class="cta-secondary">I already have an account</RouterLink>
        </div>
      </div>

      <!-- Feature illustration -->
      <div class="hero-visual">
        <div class="feature-cards">
          <div class="fcard fcard-1">
            <div class="fcard-icon"><img src="/icons/camera.svg" alt="Camera Icon" /></div>
            <span>Snap your meals</span>
          </div>
          <div class="fcard fcard-2">
            <div class="fcard-icon"><img src="/user-robot.png" alt="Robot Icon" /></div>
            <span>AI nutrition advice</span>
          </div>
          <div class="fcard fcard-3">
            <div class="fcard-icon"><img src="/pan-food.png" alt="Food Icon" /></div>
            <span>Meals ideas</span>
          </div>
          <div class="fcard fcard-4">
            <div class="fcard-icon"><img src="/icons/target.svg" alt="Target Icon" /></div>
            <span>Reach your goals</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="feature">
        <div class="feature-icon">
          <img src="/icons/camera.svg" alt="" />
        </div>
        <h3>Meal Tracking</h3>
        <p>Snap a photo of your meals and keep a visual food diary. Simple, fast, and effective.</p>
      </div>
      <div class="feature">
        <div class="feature-icon ai-icon">
          <img src="/pan-food.png" alt="" />
        </div>
        <h3>AI Chatbot</h3>
        <p>Ask our AI assistant for meal ideas, nutrition tips, and personalized recommendations.</p>
      </div>
      <div class="feature">
        <div class="feature-icon goal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3>Personalized Goals</h3>
        <p>Set your dietary goals, preferences, and budget — we tailor everything to you.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <p>NutriTrip © 2026 · Built with 💚</p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

/* Nav */
.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.landing-nav img {
  height: 32px;
}

.logo {
  font-size: 1.3rem;
  font-weight: 800;
  color: #22c55e;
  letter-spacing: -0.5px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  text-decoration: none;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #111827;
}

.nav-btn {
  text-decoration: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 22px;
  background: #22c55e;
  border-radius: 10px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #16a34a;
}

/* Hero */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 48px 80px;
  gap: 60px;
}

.hero-content {
  flex: 1;
  max-width: 540px;
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  background: #f0fdf4;
  color: #166534;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 20px;
  border: 1px solid #bbf7d0;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 3.2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
  margin: 0 0 20px;
  letter-spacing: -1px;
}

.highlight {
  color: #22c55e;
}

.hero-desc {
  font-size: 1.15rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #22c55e;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);
}

.cta-primary:hover {
  background: #16a34a;
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  transform: translateY(-1px);
}

.cta-primary:active {
  transform: translateY(0);
}

.cta-secondary {
  text-decoration: none;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s;
}

.cta-secondary:hover {
  color: #22c55e;
}

/* Hero visual */
.hero-visual {
  flex: 1;
  max-width: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
}

.fcard {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  transition: all 0.3s;
  animation: floatIn 0.6s ease backwards;
}
.fcard img {
  width: 28px;
  height: 28px;
}

.fcard:hover {
  border-color: #22c55e;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.1);
  transform: translateY(-4px);
}

.fcard-1 { animation-delay: 0.1s; }
.fcard-2 { animation-delay: 0.2s; }
.fcard-3 { animation-delay: 0.3s; }
.fcard-4 { animation-delay: 0.4s; }

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fcard-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  background: #f0fdf4;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fcard span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

/* Features section */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 48px 80px;
  background: #f8faf8;
}

.feature {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 32px 28px;
  text-align: center;
  transition: all 0.2s;
}

.feature:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.feature-icon {
  width: 52px;
  height: 52px;
  background: #f0fdf4;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.feature-icon img,
.feature-icon svg {
  width: 24px;
  height: 24px;
}

.ai-icon {
  background: #eef2ff;
}

.goal-icon {
  background: #f0fdf4;
}

.feature h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.feature p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Footer */
.landing-footer {
  text-align: center;
  padding: 24px;
  color: #9ca3af;
  font-size: 0.8rem;
}

.landing-footer p {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .landing-nav {
    padding: 16px 20px;
  }

  .hero {
    flex-direction: column;
    padding: 40px 20px 60px;
    text-align: center;
  }

  .hero h1 {
    font-size: 2.2rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    max-width: 340px;
  }

  .features {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }
}
/* Big background logo */
.bg-logo {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  opacity: 0.07;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

</style>
