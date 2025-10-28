<template>
  <AppLayout
    header-title="Movement Requests"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/')"
    @logout-click="handleLogout"
  >
    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <LoadingState title="Loading requests..." />
      </BaseCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <ErrorState
          title="Failed to load requests"
          :message="error"
          @retry="loadRequests"
        />
      </BaseCard>
    </div>

    <!-- Request List -->
    <div v-else>
      <!-- Filter Tabs -->
      <div class="px-6 py-4 bg-white/60 border-b border-slate-100">
        <RequestFilterTabs
          :active-filter="activeFilter"
          :counts="filterCounts"
          @filter-change="handleFilterChange"
        />
      </div>

      <!-- Search Section -->
      <div class="px-6 py-4 bg-white/30 border-b border-slate-100">
        <BaseSearch
          v-model="searchQuery"
          placeholder="Search requests, equipment, or users..."
          @search="handleSearch"
        />
      </div>

      <!-- Request Count -->
      <div class="px-6 py-3 bg-slate-50/50">
        <p class="text-sm text-slate-600">
          Showing <span class="font-semibold text-dark">{{ from }}</span> - <span class="font-semibold text-dark">{{ to }}</span> of <span class="font-semibold text-dark">{{ total }}</span> requests
        </p>
      </div>

      <!-- Request Cards -->
      <div class="px-6 py-4 space-y-3">
        <!-- Empty State -->
        <div v-if="requests.length === 0" class="py-12 text-center">
          <svg class="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="text-lg font-semibold text-slate-600 mb-2">No Requests Found</h3>
          <p class="text-sm text-slate-400">{{ getEmptyStateMessage() }}</p>
        </div>

        <!-- Request Cards List -->
        <RequestMovementCard
          v-for="request in requests"
          :key="request.id"
          :request="request"
          :current-user="currentUser"
          @approve="handleApprove"
          @deny="handleDeny"
          @override="handleOverride"
        />
      </div>

      <!-- Pagination -->
      <div v-if="requests.length > 0">
        <BasePagination
          :current-page="currentPage"
          :last-page="lastPage"
          :total="total"
          :from="from"
          :to="to"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'
import { useErrorStore } from '../stores/errorStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import LoadingState from '../components/ui/LoadingState.vue'
import ErrorState from '../components/ui/ErrorState.vue'
import BasePagination from '../components/ui/BasePagination.vue'
import BaseSearch from '../components/ui/BaseSearch.vue'
import RequestFilterTabs from '../components/requests/RequestFilterTabs.vue'
import RequestMovementCard from '../components/requests/RequestMovementCard.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'RequestListView',
  components: {
    AppLayout,
    BaseCard,
    LoadingState,
    ErrorState,
    BasePagination,
    BaseSearch,
    RequestFilterTabs,
    RequestMovementCard,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const dashboardStore = useDashboardStore()
    const errorStore = useErrorStore()

    const requests = ref([])
    const loading = ref(false)
    const error = ref(null)
    const activeFilter = ref('all')
    const currentUser = ref(null)
    const searchQuery = ref('')

    // Pagination state
    const currentPage = ref(1)
    const lastPage = ref(1)
    const total = ref(0)
    const perPage = ref(10)
    const from = ref(0)
    const to = ref(0)

    onMounted(async () => {
      await Promise.all([
        loadRequests(),
        loadCurrentUser()
      ])
    })

    const loadRequests = async (page = 1) => {
      loading.value = true
      error.value = null

      try {
        const params = {
          page,
          per_page: perPage.value
        }

        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }

        if (activeFilter.value && activeFilter.value !== 'all') {
          // For request types, we need to filter server-side if backend supports it
          // For now, we'll handle filtering client-side as the backend doesn't have type filters
        }

        const response = await apiClient.get('/requests', { params })
        requests.value = response.data || []

        // Update pagination metadata
        if (response.meta) {
          currentPage.value = response.meta.current_page
          lastPage.value = response.meta.last_page
          total.value = response.meta.total
          from.value = response.meta.from || 0
          to.value = response.meta.to || 0
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load requests'
        console.error('Failed to load requests:', err)
      } finally {
        loading.value = false
      }
    }

    const loadCurrentUser = async () => {
      try {
        const response = await apiClient.get('/auth/user')
        currentUser.value = response.user
      } catch (err) {
        console.error('Failed to load current user:', err)
      }
    }

    // Helper function to determine request type
    const getRequestType = (request) => {
      const fromLocation = request.from_location
      const toLocation = request.to_location
      const fromUser = request.from_user
      const toUser = request.to_user

      // Return: from user to warehouse
      if (fromUser && toLocation?.type === 'warehouse') {
        return 'returns'
      }

      // Assignment: from warehouse to user
      if (fromLocation?.type === 'warehouse' && toUser) {
        return 'assignments'
      }

      // Transfer: from user to user (different users)
      if (fromUser && toUser && fromUser.id !== toUser.id) {
        return 'transfers'
      }

      // Default to assignments for warehouse -> user
      return 'assignments'
    }

    // Client-side filter for request types (since backend pagination doesn't support type filters yet)
    const filteredRequests = computed(() => {
      if (activeFilter.value === 'all') {
        return requests.value
      }

      return requests.value.filter(request => {
        return getRequestType(request) === activeFilter.value
      })
    })

    const handlePageChange = (page) => {
      loadRequests(page)
    }

    const handleSearch = (query) => {
      searchQuery.value = query
      loadRequests(1) // Reset to page 1 on search
    }

    const filterCounts = computed(() => {
      const counts = {
        all: requests.value.length,
        transfers: 0,
        returns: 0,
        assignments: 0
      }

      requests.value.forEach(request => {
        const type = getRequestType(request)
        if (counts[type] !== undefined) {
          counts[type]++
        }
      })

      return counts
    })

    const handleFilterChange = (filter) => {
      activeFilter.value = filter
      // For now, we don't reload from server for type filters since backend doesn't support them
      // The filteredRequests computed will handle the filtering client-side
    }

    const getEmptyStateMessage = () => {
      if (activeFilter.value === 'all') {
        return 'No equipment movement requests found'
      }
      const filterLabels = {
        transfers: 'transfer requests',
        returns: 'return requests',
        assignments: 'assignment requests'
      }
      return `No ${filterLabels[activeFilter.value] || 'requests'} found`
    }

    // Request actions
    const handleApprove = async (requestId) => {
      try {
        await apiClient.post(`/requests/${requestId}/approve`)

        errorStore.showSuccess('Request approved successfully', {
          autoClose: 3000
        })

        // Reload requests to get updated data
        await loadRequests(currentPage.value)

        // Update dashboard store
        await dashboardStore.loadDashboardData()
      } catch (err) {
        errorStore.showApiError(err, {
          title: 'Failed to Approve Request',
          showRetry: true,
          autoClose: 8000
        })
        console.error('Failed to approve request:', err)
      }
    }

    const handleDeny = async (requestId) => {
      try {
        await apiClient.post(`/requests/${requestId}/deny`, {
          admin_notes: 'Request denied via UI'
        })

        errorStore.showSuccess('Request denied successfully', {
          autoClose: 3000
        })

        // Reload requests to get updated data
        await loadRequests(currentPage.value)

        // Update dashboard store
        await dashboardStore.loadDashboardData()
      } catch (err) {
        errorStore.showApiError(err, {
          title: 'Failed to Deny Request',
          showRetry: true,
          autoClose: 8000
        })
        console.error('Failed to deny request:', err)
      }
    }

    const handleCancel = async (requestId) => {
      try {
        await apiClient.put(`/requests/${requestId}`, {
          status: 'cancelled'
        })

        errorStore.showSuccess('Request cancelled successfully', {
          autoClose: 3000
        })

        // Reload requests to get updated data
        await loadRequests(currentPage.value)

        // Update dashboard store
        await dashboardStore.loadDashboardData()
      } catch (err) {
        errorStore.showApiError(err, {
          title: 'Failed to Cancel Request',
          showRetry: true,
          autoClose: 8000
        })
        console.error('Failed to cancel request:', err)
      }
    }

    const handleOverride = async (requestId) => {
      try {
        // For now, just log - override functionality can be implemented later
        console.log('Override request:', requestId)

        errorStore.showSuccess('Override functionality coming soon', {
          autoClose: 3000
        })
      } catch (err) {
        errorStore.showApiError(err, {
          title: 'Failed to Override Request',
          showRetry: true,
          autoClose: 8000
        })
        console.error('Failed to override request:', err)
      }
    }

    const handleViewDetails = (requestId) => {
      // Navigate to request detail view (to be implemented later)
      console.log('View request details:', requestId)
    }

    const navigationItems = computed(() => [
      {
        name: 'dashboard',
        to: '/',
        label: 'Dashboard',
        icon: DashboardIcon,
        badge: 0
      },
      {
        name: 'equipment',
        to: '/equipment',
        label: 'Inventory',
        icon: InventoryIcon,
        badge: 0
      },
      {
        name: 'requests',
        to: '/requests',
        label: 'Requests',
        icon: RequestIcon,
        badge: dashboardStore?.pendingRequestsCount || 0
      },
      {
        name: 'users',
        to: '/users',
        label: 'Users',
        icon: UsersIcon,
        badge: 0
      }
    ])

    return {
      requests,
      loading,
      error,
      activeFilter,
      currentUser,
      searchQuery,
      currentPage,
      lastPage,
      total,
      perPage,
      from,
      to,
      filteredRequests,
      filterCounts,
      navigationItems,
      loadRequests,
      handleFilterChange,
      handlePageChange,
      handleSearch,
      handleApprove,
      handleDeny,
      handleCancel,
      handleOverride,
      handleViewDetails,
      getEmptyStateMessage
    }
  },
  methods: {
    async handleLogout() {
      try {
        await authService.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        this.$router.push('/login')
      }
    }
  }
}
</script>