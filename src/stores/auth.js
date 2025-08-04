import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const API_BASE_URL = 'https://ai.kiut.uz'
  
  // State
  const accessToken = ref(localStorage.getItem('access_token'))
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  const authHeaders = computed(() => ({
    'Authorization': `Bearer ${accessToken.value}`
  }))

  // Actions
  async function login(username, password) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password
        }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        accessToken.value = data.access_token
        
        localStorage.setItem('access_token', data.access_token)
        
        // Get user info after successful login
        await getCurrentUser()
        
        return { success: true }
      } else {
        const errorData = await response.json()
        error.value = errorData.detail || 'Неверное имя пользователя или пароль'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = 'Ошибка подключения к серверу'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function refreshTokens() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // This will send the refresh token cookie automatically
      })
      
      if (response.ok) {
        const data = await response.json()
        accessToken.value = data.access_token
        
        localStorage.setItem('access_token', data.access_token)
        
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  async function getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/get-me`, {
        method: 'GET',
        headers: authHeaders.value,
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        user.value = userData
        return true
      } else if (response.status === 401) {
        // Try to refresh token if unauthorized
        const refreshSuccess = await refreshTokens()
        if (refreshSuccess) {
          return await getCurrentUser()
        }
        return false
      }
      return false
    } catch (error) {
      console.error('Get user error:', error)
      return false
    }
  }

  async function checkAuth() {
    if (!accessToken.value) {
      return await refreshTokens()
    }
    
    // Try to get current user info to validate token
    const userSuccess = await getCurrentUser()
    if (!userSuccess) {
      // Try to refresh tokens
      return await refreshTokens()
    }
    
    return true
  }

  async function logoutUser() {
    try {
      // Call logout endpoint to invalidate refresh token cookie on server
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include' // This will send the refresh token cookie automatically
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
    }
  }

  function logout() {
    accessToken.value = null
    user.value = null
    
    localStorage.removeItem('access_token')
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    accessToken,
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    authHeaders,
    
    // Actions
    login,
    refreshTokens,
    getCurrentUser,
    checkAuth,
    logout,
    logoutUser,
    clearError
  }
})
