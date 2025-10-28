<template>
  <AppLayout
    header-title="User Management"
    :show-back-button="true"
    :navigation-items="navigationItems"
    :show-fab="true"
    fab-icon="PlusIcon"
    fab-variant="primary"
    @back-click="$router.push('/')"
    @logout-click="handleLogout"
    @fab-click="$router.push('/users/create')"
  >
    <!-- Search and Filter Section -->
    <div class="px-6 py-4 bg-white/60 border-b border-slate-100">
      <div class="flex items-center space-x-3">
        <!-- Search Input -->
        <div class="flex-1">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Search users..."
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

    <!-- User Count -->
    <div class="px-6 py-3 bg-slate-50/50">
      <p class="text-sm text-slate-600">
        Showing <span class="font-semibold text-dark">{{ users.length }}</span> users
      </p>
    </div>

    <!-- User List -->
    <div class="px-6 py-4 space-y-3">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 animate-pulse">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-slate-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Items -->
      <div v-else>
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div class="flex items-center space-x-3">
            <!-- User Avatar -->
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {{ getUserInitials(user.name) }}
            </div>

            <!-- User Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h3 class="font-bold text-dark text-sm">{{ user.name }}</h3>
                <BaseBadge :variant="getRoleVariant(user.role)" size="sm">
                  {{ getRoleLabel(user.role) }}
                </BaseBadge>
              </div>
              <p class="text-xs text-slate-500">{{ user.email }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span v-if="user.phone" class="text-xs text-slate-400">{{ user.phone }}</span>
                <span v-if="user.department" class="text-xs text-slate-400">• {{ user.department }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button
                @click="editUser(user)"
                class="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                title="Edit"
              >
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="viewUser(user)"
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
        <div v-if="filteredUsers.length === 0 && !loading" class="text-center py-12">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="text-slate-500 text-sm">No users found</p>
          <p class="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
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
import BaseSearch from '../components/ui/BaseSearch.vue'
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'UserListView',
  components: {
    AppLayout,
    BaseBadge,
    BaseSearch,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const router = useRouter()
    const dashboardStore = useDashboardStore()
    const users = ref([])
    const searchQuery = ref('')
    const activeFilter = ref('all')
    const loading = ref(false)

    const filters = [
      { key: 'all', label: 'All' },
      { key: 'admin', label: 'Admins' },
      { key: 'employee', label: 'Employees' },
      { key: 'contractor', label: 'Contractors' },
      { key: 'active', label: 'Active' }
    ]

    // Load users data
    onMounted(async () => {
      await loadUsers()
    })

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await apiClient.get('/users')
        users.value = response.data || []
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        loading.value = false
      }
    }

    const filteredUsers = computed(() => {
      let filtered = users.value

      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.phone && user.phone.toLowerCase().includes(query)) ||
          (user.department && user.department.toLowerCase().includes(query))
        )
      }

      // Apply role filter
      if (activeFilter.value && activeFilter.value !== 'all' && activeFilter.value !== 'active') {
        filtered = filtered.filter(user => user.role === activeFilter.value)
      }

      // Active filter
      if (activeFilter.value === 'active') {
        filtered = filtered.filter(user => user.is_active)
      }

      return filtered
    })

    const handleSearch = (query) => {
      searchQuery.value = query
    }

    const handleFilterChange = (filterKey) => {
      activeFilter.value = filterKey
    }

    const getUserInitials = (name) => {
      if (!name) return '?'
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }

    const getRoleVariant = (role) => {
      const variants = {
        admin: 'danger',
        employee: 'primary',
        contractor: 'accent'
      }
      return variants[role] || 'secondary'
    }

    const getRoleLabel = (role) => {
      const labels = {
        admin: 'Admin',
        employee: 'Employee',
        contractor: 'Contractor'
      }
      return labels[role] || role
    }

    const viewUser = (user) => {
      router.push(`/users/${user.id}`)
    }

    const editUser = (user) => {
      router.push(`/users/${user.id}/edit`)
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
      users,
      searchQuery,
      activeFilter,
      filters,
      loading,
      filteredUsers,
      navigationItems,
      getUserInitials,
      getRoleVariant,
      getRoleLabel,
      viewUser,
      editUser,
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
