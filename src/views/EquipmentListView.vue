<template>
  <AppLayout
    header-title="Equipment Inventory"
    :show-back-button="true"
    :navigation-items="navigationItems"
    :show-fab="true"
    fab-icon="PlusIcon"
    fab-variant="primary"
    @back-click="$router.push('/')"
    @logout-click="handleLogout"
    @fab-click="$router.push('/equipment/create')"
  >
    <!-- Search and Filter Section -->
    <div class="px-6 py-4 bg-white/60 border-b border-slate-100">
      <div class="flex items-center space-x-3">
        <!-- Search Input -->
        <div class="flex-1">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Search equipment..."
            @search="handleSearch"
          />
        </div>

        <!-- Filter Button -->
        <button class="p-2.5 bg-white border border-slate-200 rounded-xl">
          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
        </button>
      </div>

      <!-- Quick Filter Pills -->
      <div class="flex items-center space-x-2 mt-3 overflow-x-auto">
        <button
          v-for="filter in filters"
          :key="filter.key"
          @click="handleFilterChange(filter.key)"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap',
            activeFilter === filter.key
              ? 'bg-primary text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Equipment Count -->
    <div class="px-6 py-3 bg-slate-50/50">
      <p class="text-sm text-slate-600">
        Showing <span class="font-semibold text-dark">{{ from }}</span> - <span class="font-semibold text-dark">{{ to }}</span> of <span class="font-semibold text-dark">{{ total }}</span> equipment items
      </p>
    </div>

    <!-- Equipment List -->
    <div class="px-6 py-4 space-y-3">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 animate-pulse">
          <div class="flex items-center space-x-3">
            <div class="w-16 h-16 bg-slate-200 rounded-xl"></div>
            <div class="flex-1">
              <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Items -->
      <div v-else>
        <div
          v-for="item in equipment"
          :key="item.id"
          class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100"
        >
        <div class="flex items-center space-x-3">
          <!-- Equipment Image -->
          <div class="w-16 h-16 rounded-xl overflow-hidden shadow-sm bg-white flex-shrink-0">
            <img
              v-if="item.photo_url"
              :src="item.photo_url"
              :alt="item.name"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full bg-slate-100 flex items-center justify-center"
            >
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>

          <!-- Equipment Details -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-dark text-sm">{{ item.name }}</h3>
            <p class="text-xs text-slate-500">{{ item.serial_number }} • {{ item.type }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <BaseBadge :variant="getStatusVariant(item)" size="sm">
                {{ getStatusText(item) }}
              </BaseBadge>
              <span class="text-xs text-slate-400">{{ getLocationText(item) }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2">
            <button
              @click="editEquipment(item)"
              class="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Edit"
            >
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="viewEquipment(item)"
              class="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="View Details"
            >
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

        <!-- Empty State -->
        <div v-if="equipment.length === 0 && !loading" class="text-center py-12">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <p class="text-slate-500 text-sm">No equipment found</p>
          <p class="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && equipment.length > 0">
      <BasePagination
        :current-page="currentPage"
        :last-page="lastPage"
        :total="total"
        :from="from"
        :to="to"
        @page-change="handlePageChange"
      />
    </div>
  </AppLayout>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BasePagination from '../components/ui/BasePagination.vue'
import BaseSearch from '../components/ui/BaseSearch.vue'
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'EquipmentListView',
  components: {
    AppLayout,
    BaseBadge,
    BasePagination,
    BaseSearch,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const router = useRouter()
    const dashboardStore = useDashboardStore()
    const equipment = ref([])
    const searchQuery = ref('')
    const activeFilter = ref('all')
    const loading = ref(false)

    // Pagination state
    const currentPage = ref(1)
    const lastPage = ref(1)
    const total = ref(0)
    const perPage = ref(15)
    const from = ref(0)
    const to = ref(0)

    const filters = [
      { key: 'all', label: 'All' },
      { key: 'available', label: 'Available' },
      { key: 'assigned', label: 'Assigned' },
      { key: 'obsolete', label: 'Obsolete' },
      { key: 'warehouse', label: 'Warehouse' }
    ]

    // Load equipment data
    onMounted(async () => {
      await loadEquipment()
    })

    const loadEquipment = async (page = 1) => {
      loading.value = true
      try {
        const params = {
          page,
          per_page: perPage.value
        }

        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }

        if (activeFilter.value && activeFilter.value !== 'all') {
          params.status_filter = activeFilter.value
        }

        const response = await apiClient.get('/equipment', { params })
        equipment.value = response.data || []

        // Update pagination metadata
        if (response.meta) {
          currentPage.value = response.meta.current_page
          lastPage.value = response.meta.last_page
          total.value = response.meta.total
          from.value = response.meta.from || 0
          to.value = response.meta.to || 0
        }
      } catch (error) {
        console.error('Failed to load equipment:', error)
      } finally {
        loading.value = false
      }
    }

    const handlePageChange = (page) => {
      loadEquipment(page)
    }

    const handleSearch = (query) => {
      searchQuery.value = query
      loadEquipment(1) // Reset to page 1 on search
    }

    const handleFilterChange = (filterKey) => {
      activeFilter.value = filterKey
      loadEquipment(1) // Reset to page 1 on filter change
    }

    const getStatusVariant = (item) => {
      if (!item.is_active) return 'secondary'
      if (!item.current_assignment || (item.current_assignment && !item.current_assignment.user)) {
        return 'accent' // Available
      }
      return 'primary' // Assigned
    }

    const getStatusText = (item) => {
      if (!item.is_active) return 'Obsolete'
      if (!item.current_assignment || (item.current_assignment && !item.current_assignment.user)) {
        return 'Available'
      }
      return 'Assigned'
    }

    const getLocationText = (item) => {
      if (item.current_assignment?.location) {
        const location = item.current_assignment.location.name
        if (item.current_assignment.user) {
          return `${item.current_assignment.user.name} @ ${location}`
        }
        return location
      }
      return 'Unknown Location'
    }

    const viewEquipment = (item) => {
      router.push(`/equipment/${item.id}`)
    }

    const editEquipment = (item) => {
      router.push(`/equipment/${item.id}/edit`)
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
      equipment,
      searchQuery,
      activeFilter,
      filters,
      loading,
      currentPage,
      lastPage,
      total,
      perPage,
      from,
      to,
      navigationItems,
      getStatusVariant,
      getStatusText,
      getLocationText,
      viewEquipment,
      editEquipment,
      handlePageChange,
      handleSearch,
      handleFilterChange
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

<style scoped>
.card-hover {
  transition: all 0.2s ease-in-out;
}

.card-hover:active {
  transform: scale(0.98);
}
</style>