import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', {
  state: () => ({
    // Current error notification
    currentError: null,

    // Error history for debugging
    errorHistory: []
  }),

  getters: {
    hasError: (state) => !!state.currentError,

    // Get the most recent errors for debugging
    recentErrors: (state) => {
      return state.errorHistory.slice(-10) // Last 10 errors
    }
  },

  actions: {
    // Show a general error notification
    showError(message, options = {}) {
      const error = {
        id: Date.now() + Math.random(),
        title: options.title || 'Error',
        message: message,
        details: options.details || null,
        showRetry: options.showRetry || false,
        showDetails: options.showDetails || false,
        autoClose: options.autoClose || 0,
        timestamp: new Date().toISOString(),
        ...options
      }

      this.currentError = error
      this.errorHistory.push(error)

      // Limit error history to prevent memory issues
      if (this.errorHistory.length > 50) {
        this.errorHistory = this.errorHistory.slice(-25)
      }

      return error.id
    },

    // Show API error with automatic parsing
    showApiError(error, options = {}) {
      let message = 'An unexpected error occurred'
      let details = null
      let title = options.title || 'API Error'

      // Parse different error types
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const data = error.response.data

        switch (status) {
          case 400:
            title = 'Invalid Request'
            message = data.message || 'The request was invalid'
            break
          case 401:
            title = 'Authentication Required'
            message = 'Please log in to continue'
            break
          case 403:
            title = 'Access Denied'
            message = 'You do not have permission to perform this action'
            break
          case 404:
            title = 'Not Found'
            message = data.message || 'The requested resource was not found'
            break
          case 422:
            title = 'Validation Error'
            message = data.message || 'Please check your input and try again'
            // Include validation details
            if (data.errors) {
              const validationErrors = Object.entries(data.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n')
              details = validationErrors
            }
            break
          case 429:
            title = 'Too Many Requests'
            message = 'Please wait a moment before trying again'
            break
          case 500:
            title = 'Server Error'
            message = 'A server error occurred. Please try again later'
            break
          default:
            title = `Error ${status}`
            message = data.message || `HTTP ${status} error occurred`
        }

        // Add technical details for debugging
        if (import.meta.env.DEV) {
          details = details || `${error.config?.method?.toUpperCase()} ${error.config?.url}\nStatus: ${status}\nResponse: ${JSON.stringify(data, null, 2)}`
        }

      } else if (error.request) {
        // Network error
        title = 'Network Error'
        message = 'Unable to connect to the server. Please check your internet connection'

        if (import.meta.env.DEV) {
          details = `Network request failed\nURL: ${error.config?.url}`
        }

      } else {
        // Client-side error
        title = 'Application Error'
        message = error.message || 'An unexpected error occurred'

        if (import.meta.env.DEV) {
          details = error.stack || error.toString()
        }
      }

      return this.showError(message, {
        title,
        details,
        showDetails: !!details,
        showRetry: options.showRetry !== false, // Default to true
        ...options
      })
    },

    // Show success notification (positive feedback)
    showSuccess(message, options = {}) {
      return this.showError(message, {
        title: options.title || 'Success',
        type: 'success',
        autoClose: options.autoClose || 3000, // Auto-close success messages
        ...options
      })
    },

    // Show warning notification
    showWarning(message, options = {}) {
      return this.showError(message, {
        title: options.title || 'Warning',
        type: 'warning',
        autoClose: options.autoClose || 5000,
        ...options
      })
    },

    // Clear the current error
    clearError() {
      this.currentError = null
    },

    // Clear all errors (including history)
    clearAllErrors() {
      this.currentError = null
      this.errorHistory = []
    },

    // Handle global unhandled errors
    handleGlobalError(error, info = '') {
      console.error('Global error:', error, info)

      return this.showError('An unexpected error occurred in the application', {
        title: 'Application Error',
        details: import.meta.env.DEV ? `${info}\n${error.stack || error.toString()}` : null,
        showDetails: import.meta.env.DEV,
        showRetry: true
      })
    }
  }
})

export default useErrorStore