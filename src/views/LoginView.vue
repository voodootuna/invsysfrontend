<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Login Card -->
      <BaseCard variant="glass" padding="lg" class="shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-dark mb-2">Welcome Back</h1>
          <p class="text-slate-500">Sign in to your equipment tracking account</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-dark mb-2">
              Email Address
            </label>
            <BaseInput
              id="email"
              v-model="form.email"
              type="email"
              placeholder="admin@test.com"
              :error="errors.email"
              required
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-dark mb-2">
              Password
            </label>
            <BaseInput
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Enter your password"
              :error="errors.password"
              required
            />
          </div>

          <!-- Error Message -->
          <div v-if="errors.general" class="p-4 bg-danger/10 border border-danger/20 rounded-xl">
            <p class="text-danger text-sm font-medium">{{ errors.general }}</p>
          </div>

          <!-- Login Button -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full"
            :disabled="loading"
          >
            <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </BaseButton>
        </form>

        <!-- Test Credentials -->
        <div class="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 class="text-sm font-semibold text-dark mb-2">Test Credentials:</h3>
          <div class="space-y-1 text-xs text-slate-600">
            <p><strong>Email:</strong> admin@test.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
          <button
            type="button"
            @click="fillTestCredentials"
            class="mt-2 text-primary text-xs font-medium hover:text-primary-dark"
          >
            Use Test Credentials
          </button>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script>
import { authService } from '../services/apiService'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'

export default {
  name: 'LoginView',
  components: {
    BaseCard,
    BaseInput,
    BaseButton
  },
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      errors: {
        email: '',
        password: '',
        general: ''
      },
      loading: false
    }
  },
  mounted() {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      this.$router.push('/')
    }
  },
  methods: {
    async handleLogin() {
      // Clear previous errors
      this.clearErrors()

      // Basic validation
      if (!this.form.email) {
        this.errors.email = 'Email is required'
        return
      }
      if (!this.form.password) {
        this.errors.password = 'Password is required'
        return
      }

      this.loading = true

      try {
        await authService.login(this.form.email, this.form.password)

        // Redirect to dashboard
        this.$router.push('/')
      } catch (error) {
        console.error('Login error:', error)

        if (error.response?.status === 401) {
          this.errors.general = 'Invalid email or password'
        } else if (error.response?.data?.message) {
          this.errors.general = error.response.data.message
        } else {
          this.errors.general = 'Login failed. Please check your credentials and try again.'
        }
      } finally {
        this.loading = false
      }
    },

    fillTestCredentials() {
      this.form.email = 'admin@test.com'
      this.form.password = 'password'
      this.clearErrors()
    },

    clearErrors() {
      this.errors = {
        email: '',
        password: '',
        general: ''
      }
    }
  }
}
</script>