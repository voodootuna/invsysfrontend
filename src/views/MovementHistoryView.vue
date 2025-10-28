<template>
  <AppLayout
    header-title="Movement History"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/')"
    @logout-click="handleLogout"
  >
    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <LoadingState title="Loading movement history..." />
      </BaseCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <ErrorState
          title="Failed to load movements"
          :message="error"
          @retry="loadMovements"
        />
      </BaseCard>
    </div>

    <!-- Movement History -->
    <div v-else>
      <!-- Search and Filters Section -->
      <div class="px-6 py-4 bg-white/60 border-b border-slate-100">
        <div class="space-y-3">
          <!-- Search Input -->
          <BaseSearch
            v-model="searchQuery"
            placeholder="Search movements, equipment, or users..."
            @search="handleSearch"
          />

          <!-- Filter Pills -->
          <div class="flex items-center space-x-2 overflow-x-auto">
            <button
              v-for="filter in movementTypeFilters"
              :key="filter.key"
              @click="handleMovementTypeFilter(filter.key)"
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap',
                activeMovementType === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Movement Count -->
      <div class="px-6 py-3 bg-slate-50/50">
        <p class="text-sm text-slate-600">
          Showing <span class="font-semibold text-dark">{{ from }}</span> - <span class="font-semibold text-dark">{{ to }}</span> of <span class="font-semibold text-dark">{{ total }}</span> movements
        </p>
      </div>

      <!-- Movement List -->
      <div class="px-6 py-4 space-y-3">
        <!-- Empty State -->
        <div v-if="movements.length === 0 && !loading" class="text-center py-12">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          <p class="text-slate-500 text-sm">No movement history found</p>
          <p class="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
        </div>

        <!-- Enhanced Visual Movement Cards -->
        <div v-else class="space-y-3">
          <div
            v-for="movement in movements"
            :key="movement.id"
            class="bg-gradient-to-r from-white to-slate-50/30 rounded-xl p-3 shadow-sm border border-slate-100/60 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center space-x-3">
              <!-- Enhanced Equipment Image -->
              <div class="w-11 h-11 rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                <img
                  v-if="movement.equipment?.photo_url"
                  :src="movement.equipment.photo_url"
                  :alt="movement.equipment.name"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                >
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>

              <!-- Enhanced Movement Details -->
              <div class="flex-1 min-w-0">
                <!-- Top Row: Equipment Name, Badge & Time -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2 min-w-0">
                    <h3 class="font-bold text-dark text-sm">{{ movement.equipment?.name || 'Equipment' }}</h3>
                    <BaseBadge :variant="getMovementTypeVariant(movement.movement_type)" size="xs">
                      {{ formatMovementType(movement.movement_type) }}
                    </BaseBadge>
                  </div>
                  <span class="text-xs text-slate-400 font-medium flex-shrink-0 ml-2">{{ formatTimeAgo(movement.moved_at) }}</span>
                </div>

                <!-- Visual Movement Flow -->
                <div class="flex items-center space-x-2 mb-2">
                  <!-- From Location -->
                  <div class="flex-1 min-w-0 bg-slate-50 rounded-md px-2 py-1">
                    <div class="text-xs text-slate-500">From</div>
                    <div class="text-xs text-slate-700 font-semibold">{{ getFromText(movement) }}</div>
                  </div>

                  <!-- Arrow -->
                  <div class="flex-shrink-0">
                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>

                  <!-- To Location -->
                  <div class="flex-1 min-w-0 bg-accent/10 rounded-md px-2 py-1">
                    <div class="text-xs text-accent font-medium">To</div>
                    <div class="text-xs text-accent font-bold">{{ getToText(movement) }}</div>
                  </div>
                </div>

                <!-- Bottom Row: Serial, Moved By & Reason -->
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span class="font-medium">{{ movement.equipment?.serial_number || 'No S/N' }}</span>
                  <div class="flex items-center space-x-2">
                    <span v-if="movement.moved_by">by {{ movement.moved_by.name }}</span>
                    <span v-if="(movement.notes || movement.request?.reason) && movement.moved_by" class="text-slate-300">•</span>
                    <span v-if="movement.notes || movement.request?.reason" class="italic">
                      "{{ (movement.notes || movement.request?.reason).substring(0, 30) }}{{ (movement.notes || movement.request?.reason).length > 30 ? '...' : '' }}"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="movements.length > 0">
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

import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BasePagination from '../components/ui/BasePagination.vue'
import BaseSearch from '../components/ui/BaseSearch.vue'
import LoadingState from '../components/ui/LoadingState.vue'
import ErrorState from '../components/ui/ErrorState.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'MovementHistoryView',
  components: {
    AppLayout,
    BaseCard,
    BaseBadge,
    BasePagination,
    BaseSearch,
    LoadingState,
    ErrorState,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const dashboardStore = useDashboardStore()
    const movements = ref([])
    const loading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const activeMovementType = ref('all')

    // Pagination state
    const currentPage = ref(1)
    const lastPage = ref(1)
    const total = ref(0)
    const perPage = ref(20)
    const from = ref(0)
    const to = ref(0)

    const movementTypeFilters = [
      { key: 'all', label: 'All Types' },
      { key: 'request_approved', label: 'Approved Requests' },
      { key: 'admin_assigned', label: 'Admin Assignments' },
      { key: 'admin_transferred', label: 'Admin Transfers' },
      { key: 'admin_returned', label: 'Admin Returns' },
    ]

    onMounted(async () => {
      await loadMovements()
    })

    const loadMovements = async (page = 1) => {
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

        if (activeMovementType.value && activeMovementType.value !== 'all') {
          params.movement_type = activeMovementType.value
        }

        const response = await apiClient.get('/movements', { params })
        movements.value = response.data || []

        // Update pagination metadata
        if (response.meta) {
          currentPage.value = response.meta.current_page
          lastPage.value = response.meta.last_page
          total.value = response.meta.total
          from.value = response.meta.from || 0
          to.value = response.meta.to || 0
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load movement history'
        console.error('Failed to load movements:', err)
      } finally {
        loading.value = false
      }
    }

    const handlePageChange = (page) => {
      loadMovements(page)
    }

    const handleSearch = (query) => {
      searchQuery.value = query
      loadMovements(1) // Reset to page 1 on search
    }

    const handleMovementTypeFilter = (type) => {
      activeMovementType.value = type
      loadMovements(1) // Reset to page 1 on filter change
    }

    const getMovementTypeVariant = (type) => {
      const variants = {
        'request_approved': 'accent',
        'admin_assigned': 'primary',
        'admin_transferred': 'warning',
        'admin_returned': 'secondary',
        'request_denied': 'danger'
      }
      return variants[type] || 'primary'
    }

    const formatMovementType = (type) => {
      const labels = {
        'request_approved': 'Approved',
        'admin_assigned': 'Assigned',
        'admin_transferred': 'Transferred',
        'admin_returned': 'Returned',
        'request_denied': 'Denied'
      }
      return labels[type] || type
    }

    const getFromText = (movement) => {
      if (movement.from?.user) {
        return `${movement.from.user.name} @ ${movement.from?.location?.name || 'Unknown'}`
      }
      return movement.from?.location?.name || 'Warehouse'
    }

    const getToText = (movement) => {
      if (movement.to?.user) {
        return `${movement.to.user.name} @ ${movement.to?.location?.name || 'Unknown'}`
      }
      return movement.to?.location?.name || 'Warehouse'
    }

    const formatTimeAgo = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 60) {
        return `${diffInMinutes}min ago`
      } else if (diffInMinutes < 1440) { // 24 hours
        const hours = Math.floor(diffInMinutes / 60)
        return `${hours}h ago`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        if (days === 1) return '1 day ago'
        if (days < 30) return `${days} days ago`

        // Format as date for older entries
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
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
      movements,
      loading,
      error,
      searchQuery,
      activeMovementType,
      currentPage,
      lastPage,
      total,
      perPage,
      from,
      to,
      movementTypeFilters,
      navigationItems,
      loadMovements,
      handlePageChange,
      handleSearch,
      handleMovementTypeFilter,
      getMovementTypeVariant,
      formatMovementType,
      getFromText,
      getToText,
      formatTimeAgo
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