import { defineStore } from 'pinia'
import { dashboardService } from '../services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    // Dashboard stats
    stats: {
      available: 0,
      assigned: 0,
      pending: 0
    },

    // Movement requests
    movementRequests: [],

    // Available equipment
    availableEquipment: [],

    // Recent activity
    recentActivity: [],

    // Loading states
    loading: {
      stats: false,
      requests: false,
      equipment: false,
      activity: false
    },

    // Error states
    errors: {
      stats: null,
      requests: null,
      equipment: null,
      activity: null
    }
  }),

  getters: {
    // Get formatted stats for display
    formattedStats: (state) => ({
      available: state.stats.available.toString(),
      assigned: state.stats.assigned.toString(),
      pending: state.stats.pending.toString()
    }),

    // Check if any data is loading
    isLoading: (state) => {
      return Object.values(state.loading).some(loading => loading)
    },

    // Get pending requests count for navigation badge
    pendingRequestsCount: (state) => {
      return state.movementRequests.length
    }
  },

  actions: {
    // Load all dashboard data
    async loadDashboardData() {
      await Promise.all([
        this.loadStats(),
        this.loadMovementRequests(),
        this.loadAvailableEquipment(),
        this.loadRecentActivity()
      ])
    },

    // Load equipment statistics
    async loadStats() {
      this.loading.stats = true
      this.errors.stats = null

      try {
        const stats = await dashboardService.getEquipmentStats()
        this.stats = stats
      } catch (error) {
        this.errors.stats = error.message
        console.error('Failed to load dashboard stats:', error)
      } finally {
        this.loading.stats = false
      }
    },

    // Load movement requests
    async loadMovementRequests() {
      this.loading.requests = true
      this.errors.requests = null

      try {
        const response = await dashboardService.getMovementRequests()
        this.movementRequests = response.data || []
      } catch (error) {
        this.errors.requests = error.message
        console.error('Failed to load movement requests:', error)
      } finally {
        this.loading.requests = false
      }
    },

    // Load available equipment
    async loadAvailableEquipment() {
      this.loading.equipment = true
      this.errors.equipment = null

      try {
        const response = await dashboardService.getAvailableEquipment()
        this.availableEquipment = response.data || []
      } catch (error) {
        this.errors.equipment = error.message
        console.error('Failed to load available equipment:', error)
      } finally {
        this.loading.equipment = false
      }
    },

    // Load recent activity
    async loadRecentActivity() {
      this.loading.activity = true
      this.errors.activity = null

      try {
        const response = await dashboardService.getRecentActivity()
        this.recentActivity = response.data || []
      } catch (error) {
        this.errors.activity = error.message
        console.error('Failed to load recent activity:', error)
      } finally {
        this.loading.activity = false
      }
    },

    // Approve a movement request
    async approveRequest(requestId) {
      try {
        await dashboardService.approveRequest(requestId)

        // Remove from local state
        this.movementRequests = this.movementRequests.filter(
          request => request.id !== requestId
        )

        // Refresh data to get updated stats
        this.loadStats()
        this.loadAvailableEquipment()
        this.loadRecentActivity()

      } catch (error) {
        console.error('Failed to approve request:', error)
        throw error
      }
    },

    // Deny a movement request
    async denyRequest(requestId, reason = '') {
      try {
        await dashboardService.denyRequest(requestId, reason)

        // Remove from local state
        this.movementRequests = this.movementRequests.filter(
          request => request.id !== requestId
        )

      } catch (error) {
        console.error('Failed to deny request:', error)
        throw error
      }
    },

    // Refresh all data
    async refreshData() {
      await this.loadDashboardData()
    },

    // Clear all errors
    clearErrors() {
      this.errors = {
        stats: null,
        requests: null,
        equipment: null,
        activity: null
      }
    }
  }
})

export default useDashboardStore