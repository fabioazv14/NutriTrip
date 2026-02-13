<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showNavbar = computed(() => !route.meta.hideNavbar)
</script>

<template>
  <nav v-if="showNavbar">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/login">Login</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
nav {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: #f5f5f5;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

nav a.router-link-active {
  color: #42b883;
  font-weight: 700;
}
</style>
