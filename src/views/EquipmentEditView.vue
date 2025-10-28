<template>
  <AppLayout
    :header-title="`Edit ${equipment?.name || 'Equipment'}`"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/equipment')"
    @logout-click="handleLogout"
  >
    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <LoadingState title="Loading equipment..." />
      </BaseCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <ErrorState
          title="Failed to load equipment"
          :message="error"
          @retry="loadEquipment"
        />
      </BaseCard>
    </div>

    <!-- Edit Form -->
    <div v-else-if="equipment" class="px-6 py-6 pb-32">
      <form @submit.prevent="saveEquipment" class="space-y-6">

        <!-- Equipment Image & Header -->
        <BaseCard variant="default" padding="lg">
          <div class="flex items-start space-x-6 mb-6">
            <!-- Equipment Image -->
            <div class="w-24 h-24 rounded-2xl overflow-hidden shadow-lg bg-white flex-shrink-0">
              <img
                v-if="equipment.photo_url"
                :src="equipment.photo_url"
                :alt="equipment.name"
                class="w-full h-full object-cover"
              >
              <div
                v-else
                class="w-full h-full bg-slate-100 flex items-center justify-center"
              >
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
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
              <p class="text-xs text-slate-500">Make changes and save to update equipment details</p>
            </div>
          </div>
        </BaseCard>

        <!-- Basic Information -->
        <BaseCard variant="default" padding="lg">
          <h3 class="text-lg font-bold text-dark mb-4">Basic Information</h3>

          <div class="space-y-4">
            <!-- Equipment Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Equipment Name *</label>
              <BaseInput
                v-model="form.name"
                placeholder="Enter equipment name"
                :error="errors.name"
                required
              />
            </div>

            <!-- Serial Number & Type -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Serial Number</label>
                <BaseInput
                  v-model="form.serial_number"
                  placeholder="Enter serial number"
                  :error="errors.serial_number"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Equipment Type *</label>
                <BaseInput
                  v-model="form.type"
                  placeholder="Enter equipment type"
                  :error="errors.type"
                  required
                />
              </div>
            </div>

            <!-- Purchase Date -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
              <BaseInput
                v-model="form.purchase_date"
                type="date"
                :error="errors.purchase_date"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm text-dark resize-none"
                placeholder="Additional notes about this equipment..."
                :class="{ 'border-red-500': errors.notes }"
              ></textarea>
              <p v-if="errors.notes" class="text-xs text-red-500 mt-1">{{ errors.notes }}</p>
            </div>
          </div>
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
            {{ saveLoading ? 'Saving Changes...' : 'Save Changes' }}
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="lg"
            full-width
            type="button"
            @click="$router.push('/equipment')"
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
import { useRoute } from 'vue-router'
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
  name: 'EquipmentEditView',
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
    const route = useRoute()
    const dashboardStore = useDashboardStore()
    const errorStore = useErrorStore()

    const equipment = ref(null)
    const loading = ref(false)
    const saveLoading = ref(false)
    const error = ref(null)

    const form = ref({
      name: '',
      serial_number: '',
      type: '',
      purchase_date: '',
      notes: '',
      is_active: true
    })

    const errors = ref({})

    const equipmentId = computed(() => route.params.id)

    // Load equipment on mount
    onMounted(async () => {
      await loadEquipment()
    })

    const loadEquipment = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await apiClient.get(`/equipment/${equipmentId.value}`)
        equipment.value = response.data

        // Populate form with equipment data
        form.value = {
          name: equipment.value.name || '',
          serial_number: equipment.value.serial_number || '',
          type: equipment.value.type || '',
          purchase_date: equipment.value.purchase_date ? equipment.value.purchase_date.split('T')[0] : '',
          notes: equipment.value.notes || '',
          is_active: equipment.value.is_active !== undefined ? equipment.value.is_active : true
        }

      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load equipment'
        console.error('Failed to load equipment:', err)
      } finally {
        loading.value = false
      }
    }

    const validateForm = () => {
      errors.value = {}

      if (!form.value.name.trim()) {
        errors.value.name = 'Equipment name is required'
      }

      if (!form.value.type.trim()) {
        errors.value.type = 'Equipment type is required'
      }

      return Object.keys(errors.value).length === 0
    }

    const canSave = computed(() => {
      return form.value.name.trim() && form.value.type.trim()
    })

    const saveEquipment = async () => {
      if (!validateForm()) {
        return
      }

      saveLoading.value = true
      errors.value = {}

      try {
        const updateData = {
          name: form.value.name.trim(),
          serial_number: form.value.serial_number.trim() || null,
          type: form.value.type.trim(),
          purchase_date: form.value.purchase_date || null,
          notes: form.value.notes.trim() || null,
          is_active: form.value.is_active
        }

        await apiClient.put(`/equipment/${equipmentId.value}`, updateData)

        // Show success message with auto-close
        errorStore.showSuccess('Equipment updated successfully', {
          autoClose: 3000 // Auto-close after 3 seconds
        })

        // Reload equipment data to refresh the view
        await loadEquipment()

      } catch (err) {
        // Handle validation errors
        if (err.response?.status === 422) {
          errors.value = err.response.data.errors || {}
          // Also show global error for validation issues
          errorStore.showApiError(err, {
            title: 'Validation Error',
            showRetry: false,
            autoClose: 5000 // Auto-close after 5 seconds
          })
        } else {
          error.value = err.response?.data?.message || 'Failed to save equipment'
          errorStore.showApiError(err, {
            title: 'Failed to Save Equipment',
            showRetry: true,
            autoClose: 8000 // Auto-close after 8 seconds (longer for errors with retry)
          })
        }
        console.error('Failed to save equipment:', err)
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
      equipment,
      loading,
      saveLoading,
      error,
      form,
      errors,
      navigationItems,
      loadEquipment,
      canSave,
      saveEquipment
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