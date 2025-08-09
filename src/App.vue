<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Loading from '@/components/Loading.vue'

const authStore = useAuthStore()
const isInitializing = ref(true)

onMounted(async () => {
  // Initialize authentication state
  if (authStore.accessToken) {
    await authStore.getCurrentUser()
  }
  isInitializing.value = false
})
</script>

<template>
  <div id="app">
    <Loading v-if="isInitializing" />
    <RouterView v-else />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
}

#app {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
