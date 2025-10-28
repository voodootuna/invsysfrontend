<template>
  <AppLayout
    :header-title="`Edit ${user?.name || 'User'}`"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/users')"
    @logout-click="handleLogout"
  >
    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <LoadingState title="Loading user..." />
      </BaseCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <ErrorState
          title="Failed to load user"
          :message="error"
          @retry="loadUser"
        />
      </BaseCard>
    </div>

    <!-- Edit Form -->
    <div v-else-if="user" class="px-6 py-6 pb-32">
      <form @submit.prevent="saveUser" class="space-y-6">

        <!-- User Avatar & Header -->
        <BaseCard variant="default" padding="lg">
          <div class="flex items-start space-x-6 mb-6">
            <!-- User Avatar -->
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-lg">
              {{ getUserInitials() }}
            </div>

            <!-- Edit Status -->
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <BaseBadge variant="warning" size="sm">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Editing Mode
                  </BaseBadge>
                </div>

                <!-- Active Status Switch -->
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-medium text-slate-600">Active</span>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="form.is_active"
                      class="sr-only peer"
                    />
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <p class="text-xs text-slate-500">Make changes and save to update user details</p>
            </div>
          </div>
        </BaseCard>

        <!-- Basic Information -->
        <BaseCard variant="default" padding="lg">
          <h3 class="text-lg font-bold text-dark mb-4">Basic Information</h3>

          <div class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
              <BaseInput
                v-model="form.name"
                placeholder="Enter full name"
                :error="errors.name"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
              <BaseInput
                v-model="form.email"
                type="email"
                placeholder="Enter email address"
                :error="errors.email"
                required
              />
            </div>

            <!-- Password (Optional for edit) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                New Password
                <span class="text-xs text-slate-400">(Leave blank to keep current password)</span>
              </label>
              <BaseInput
                v-model="form.password"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                :error="errors.password"
              />
            </div>

            <!-- Phone & Department -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <BaseInput
                  v-model="form.phone"
                  type="tel"
                  placeholder="Enter phone number"
                  :error="errors.phone"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <BaseInput
                  v-model="form.department"
                  placeholder="Enter department"
                  :error="errors.department"
                />
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Role Selection -->
        <BaseCard variant="default" padding="lg">
          <h3 class="text-lg font-bold text-dark mb-4">User Role *</h3>

          <div class="space-y-3">
            <label
              v-for="role in roles"
              :key="role.value"
              class="flex items-start p-4 bg-white border-2 rounded-2xl cursor-pointer transition-all"
              :class="form.role === role.value ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'"
            >
              <input
                type="radio"
                v-model="form.role"
                :value="role.value"
                class="mt-1 text-primary focus:ring-primary"
              />
              <div class="ml-3 flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-dark text-sm">{{ role.label }}</span>
                  <BaseBadge :variant="role.variant" size="sm">
                    {{ role.badge }}
                  </BaseBadge>
                </div>
                <p class="text-xs text-slate-500 mt-1">{{ role.description }}</p>
              </div>
            </label>
          </div>
          <p v-if="errors.role" class="text-xs text-red-500 mt-2">{{ errors.role }}</p>
        </BaseCard>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            type="submit"
            :disabled="!canSave || saveLoading"
          >
            <svg v-if="saveLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ saveLoading ? 'Saving...' : 'Save Changes' }}
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="lg"
            full-width
            type="button"
            @click="$router.push('/users')"
            :disabled="saveLoading"
          >
            Cancel
          </BaseButton>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'
import { useErrorStore } from '../stores/errorStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import LoadingState from '../components/ui/LoadingState.vue'
import ErrorState from '../components/ui/ErrorState.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'UserEditView',
  components: {
    AppLayout,
    BaseCard,
    BaseInput,
    BaseBadge,
    BaseButton,
    LoadingState,
    ErrorState,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const dashboardStore = useDashboardStore()
    const errorStore = useErrorStore()

    const loading = ref(false)
    const saveLoading = ref(false)
    const error = ref(null)
    const user = ref(null)

    const form = ref({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      phone: '',
      department: '',
      is_active: true
    })

    const errors = ref({})

    const roles = [
      {
        value: 'admin',
        label: 'Administrator',
        badge: 'Admin',
        variant: 'danger',
        description: 'Full system access, can manage all users and equipment'
      },
      {
        value: 'employee',
        label: 'Employee',
        badge: 'Staff',
        variant: 'primary',
        description: 'Can request and be assigned equipment, limited management access'
      },
      {
        value: 'contractor',
        label: 'Contractor',
        badge: 'External',
        variant: 'accent',
        description: 'Temporary access for external workers, equipment assignment only'
      }
    ]

    const loadUser = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await apiClient.get(`/users/${route.params.id}`)
        user.value = response.data

        // Populate form with user data
        form.value = {
          name: user.value.name,
          email: user.value.email,
          password: '', // Never populate password
          role: user.value.role,
          phone: user.value.phone || '',
          department: user.value.department || '',
          is_active: user.value.is_active
        }
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load user'
        console.error('Failed to load user:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadUser()
    })

    const getUserInitials = () => {
      if (!form.value.name) return '?'
      const parts = form.value.name.trim().split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return form.value.name.substring(0, 2).toUpperCase()
    }

    const validateForm = () => {
      errors.value = {}

      if (!form.value.name.trim()) {
        errors.value.name = 'Full name is required'
      }

      if (!form.value.email.trim()) {
        errors.value.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Invalid email format'
      }

      // Only validate password if it's being changed
      if (form.value.password && form.value.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters'
      }

      if (!form.value.role) {
        errors.value.role = 'User role is required'
      }

      return Object.keys(errors.value).length === 0
    }

    const canSave = computed(() => {
      return form.value.name.trim() &&
             form.value.email.trim() &&
             form.value.role &&
             (!form.value.password || form.value.password.length >= 8)
    })

    const saveUser = async () => {
      if (!validateForm()) {
        return
      }

      saveLoading.value = true
      errors.value = {}

      try {
        const userData = {
          name: form.value.name.trim(),
          email: form.value.email.trim(),
          role: form.value.role,
          is_active: form.value.is_active
        }

        // Only include password if it's being changed
        if (form.value.password) {
          userData.password = form.value.password
        }

        if (form.value.phone.trim()) {
          userData.phone = form.value.phone.trim()
        }
        if (form.value.department.trim()) {
          userData.department = form.value.department.trim()
        }

        await apiClient.put(`/users/${route.params.id}`, userData)

        // Show success message
        errorStore.showSuccess('User updated successfully', {
          autoClose: 3000
        })

        // Stay on the page after successful update
        await loadUser()

      } catch (err) {
        // Handle validation errors
        if (err.response?.status === 422) {
          errors.value = err.response.data.errors || {}
          errorStore.showApiError(err, {
            title: 'Validation Error',
            showRetry: false,
            autoClose: 5000
          })
        } else {
          errorStore.showApiError(err, {
            title: 'Failed to Update User',
            showRetry: true,
            autoClose: 8000
          })
        }
        console.error('Failed to update user:', err)
      } finally {
        saveLoading.value = false
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
      loading,
      saveLoading,
      error,
      user,
      form,
      errors,
      roles,
      navigationItems,
      canSave,
      loadUser,
      saveUser,
      getUserInitials
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
