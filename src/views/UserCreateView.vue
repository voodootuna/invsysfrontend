<template>
  <AppLayout
    header-title="Add New User"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/users')"
    @logout-click="handleLogout"
  >
    <!-- Create Form -->
    <div class="px-6 py-6 pb-32">
      <form @submit.prevent="createUser" class="space-y-6">

        <!-- Create Header -->
        <BaseCard variant="default" padding="lg">
          <div class="flex items-start space-x-6 mb-6">
            <!-- User Avatar Preview -->
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 shadow-lg">
              {{ getUserInitials() }}
            </div>

            <!-- Create Status -->
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <BaseBadge variant="primary" size="sm">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Creating New User
                </BaseBadge>
              </div>
              <p class="text-xs text-slate-500 mb-3">Fill in the details to add a new user to the system</p>
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

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Password *</label>
              <BaseInput
                v-model="form.password"
                type="password"
                placeholder="Enter password (min 8 characters)"
                :error="errors.password"
                required
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
            :disabled="!canCreate || createLoading"
          >
            <svg v-if="createLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ createLoading ? 'Creating User...' : 'Create User' }}
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="lg"
            full-width
            type="button"
            @click="$router.push('/users')"
            :disabled="createLoading"
          >
            Cancel
          </BaseButton>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'
import { useErrorStore } from '../stores/errorStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'UserCreateView',
  components: {
    AppLayout,
    BaseCard,
    BaseInput,
    BaseBadge,
    BaseButton,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const router = useRouter()
    const dashboardStore = useDashboardStore()
    const errorStore = useErrorStore()

    const createLoading = ref(false)

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

      if (!form.value.password) {
        errors.value.password = 'Password is required'
      } else if (form.value.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters'
      }

      if (!form.value.role) {
        errors.value.role = 'User role is required'
      }

      return Object.keys(errors.value).length === 0
    }

    const canCreate = computed(() => {
      return form.value.name.trim() &&
             form.value.email.trim() &&
             form.value.password.length >= 8 &&
             form.value.role
    })

    const createUser = async () => {
      if (!validateForm()) {
        return
      }

      createLoading.value = true
      errors.value = {}

      try {
        const userData = {
          name: form.value.name.trim(),
          email: form.value.email.trim(),
          password: form.value.password,
          role: form.value.role,
          is_active: true
        }

        if (form.value.phone.trim()) {
          userData.phone = form.value.phone.trim()
        }
        if (form.value.department.trim()) {
          userData.department = form.value.department.trim()
        }

        const response = await apiClient.post('/users', userData)

        // Show success message with auto-close
        errorStore.showSuccess('User created successfully', {
          autoClose: 3000
        })

        // Redirect to users list
        router.push('/users')

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
            title: 'Failed to Create User',
            showRetry: true,
            autoClose: 8000
          })
        }
        console.error('Failed to create user:', err)
      } finally {
        createLoading.value = false
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
      createLoading,
      form,
      errors,
      roles,
      navigationItems,
      canCreate,
      createUser,
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
