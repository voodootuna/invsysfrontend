import axios from 'axios'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token_expires_at')
      localStorage.removeItem('user_data')
      // Don't redirect here - let the router handle it
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      console.error('Network error - check if Laravel server is running')
    }

    return Promise.reject(error)
  }
)

// Authentication methods
export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password })

    if (response.token) {
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('token_expires_at', response.token_expires_at)
      localStorage.setItem('user_data', JSON.stringify(response.user))
    }

    return response
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token_expires_at')
      localStorage.removeItem('user_data')
    }
  },

  async getCurrentUser() {
    return await apiClient.get('/auth/user')
  },

  isAuthenticated() {
    const token = localStorage.getItem('auth_token')
    const expires = localStorage.getItem('token_expires_at')

    if (!token || !expires) return false

    return new Date(expires) > new Date()
  },

  getUser() {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }
}

export default apiClient