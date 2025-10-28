import apiClient from './apiService'

export const dashboardService = {
  // Get dashboard summary data
  async getDashboardData() {
    return await apiClient.get('/admin/dashboard')
  },

  // Get equipment statistics
  async getEquipmentStats() {
    const equipment = await apiClient.get('/equipment')

    // Calculate stats from equipment data
    const stats = {
      available: 0,
      assigned: 0,
      pending: 0
    }

    if (equipment.data && Array.isArray(equipment.data)) {
      equipment.data.forEach(item => {
        // Available: no assignment or assigned to warehouse (user: null)
        if (!item.current_assignment || (item.current_assignment && !item.current_assignment.user)) {
          stats.available++
        } else {
          stats.assigned++
        }
      })
    }

    return stats
  },

  // Get pending movement requests
  async getMovementRequests() {
    return await apiClient.get('/requests?status=pending')
  },

  // Get available equipment
  async getAvailableEquipment() {
    const response = await apiClient.get('/equipment')

    // Filter for available equipment (no assignment or assigned to warehouse with user: null)
    if (response.data && Array.isArray(response.data)) {
      const available = response.data.filter(item => {
        return !item.current_assignment ||
               (item.current_assignment && !item.current_assignment.user)
      })
      return { data: available }
    }

    return { data: [] }
  },

  // Get recent activity/movements
  async getRecentActivity() {
    return await apiClient.get('/movements?limit=10')
  },

  // Approve movement request
  async approveRequest(requestId) {
    return await apiClient.put(`/requests/${requestId}/approve`)
  },

  // Deny movement request
  async denyRequest(requestId, reason = '') {
    return await apiClient.put(`/requests/${requestId}/deny`, { reason })
  },

  // Get pending requests count for badge
  async getPendingRequestsCount() {
    const response = await this.getMovementRequests() // Already filtered to pending only
    return response.data ? response.data.length : 0
  }
}

export default dashboardService