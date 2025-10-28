<template>
  <AppLayout
    :header-title="equipment?.name || 'Equipment Details'"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/equipment')"
    @logout-click="handleLogout"
  >
    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-6">
      <BaseCard variant="default" padding="lg">
        <LoadingState title="Loading equipment details..." />
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

    <!-- Equipment Detail Content -->
    <div v-else-if="equipment" class="px-6 py-6 pb-32 space-y-6">

      <!-- Equipment Image & Basic Info -->
      <BaseCard variant="default" padding="lg">
        <div class="flex items-start space-x-6">
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

          <!-- Basic Info -->
          <div class="flex-1">
            <h2 class="text-xl font-bold text-dark mb-2">{{ equipment.name }}</h2>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-slate-500">Serial:</span>
                <span class="text-sm font-medium text-dark">{{ equipment.serial_number || 'N/A' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-slate-500">Type:</span>
                <span class="text-sm font-medium text-dark">{{ equipment.type }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-slate-500">Status:</span>
                <BaseBadge :variant="getStatusVariant(equipment)" size="sm">
                  {{ getStatusText(equipment) }}
                </BaseBadge>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Current Assignment -->
      <BaseCard variant="default" padding="lg">
        <h3 class="text-lg font-bold text-dark mb-4">Current Assignment</h3>

        <div v-if="equipment.current_assignment" class="space-y-3">
          <!-- Assigned User -->
          <div v-if="equipment.current_assignment.user" class="flex items-center space-x-3">
            <div class="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span class="text-sm font-bold text-white">
                {{ getUserInitials(equipment.current_assignment.user.name) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-dark">{{ equipment.current_assignment.user.name }}</p>
              <p class="text-xs text-slate-500">{{ equipment.current_assignment.user.role }}</p>
            </div>
          </div>

          <!-- Location -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-dark">{{ equipment.current_assignment.location.name }}</p>
              <p class="text-xs text-slate-500">{{ equipment.current_assignment.location.type }}</p>
            </div>
          </div>

          <!-- Assignment Date -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-dark">{{ formatDate(equipment.current_assignment.assigned_at) }}</p>
              <p class="text-xs text-slate-500">Assignment Date</p>
            </div>
          </div>
        </div>

        <!-- No Assignment -->
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p class="text-slate-500 text-sm">Equipment not currently assigned</p>
          <p class="text-slate-400 text-xs">Available in warehouse</p>
        </div>
      </BaseCard>

      <!-- Movement History -->
      <BaseCard variant="default" padding="lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-dark">Movement History</h3>
          <button
            @click="loadHistory"
            class="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

        <!-- History Timeline -->
        <HistoryTimeline
          :movements="movements"
          :loading="historyLoading"
          :error="historyError"
          @retry="loadHistory"
        />
      </BaseCard>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <!-- Available Equipment Actions -->
        <template v-if="isEquipmentAvailable">
          <!-- Regular users can request equipment -->
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            @click="requestEquipment"
            v-if="canRequestEquipment"
          >
            Request Equipment
          </BaseButton>

          <!-- Admins can assign equipment directly -->
          <BaseButton
            variant="accent"
            size="lg"
            full-width
            @click="assignEquipment"
            v-if="canAssignEquipment"
          >
            Assign Equipment
          </BaseButton>
        </template>

        <!-- Assigned Equipment Actions -->
        <template v-if="isEquipmentAssigned">
          <BaseButton
            variant="warning"
            size="lg"
            full-width
            @click="transferEquipment"
            v-if="canTransferEquipment"
          >
            Transfer Equipment
          </BaseButton>

          <BaseButton
            variant="outline"
            size="lg"
            full-width
            @click="returnEquipment"
            v-if="canReturnEquipment"
            class="!bg-slate-600 !text-white !border-slate-700 hover:!bg-slate-700"
          >
            Return to Warehouse
          </BaseButton>
        </template>

      </div>
    </div>

    <!-- Return to Warehouse Confirmation Modal -->
    <BaseModal v-model="showReturnModal" title="Return to Warehouse">
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <div class="flex-1">
            <h3 class="text-lg font-semibold text-dark">Return Equipment to Warehouse?</h3>
            <p class="text-sm text-slate-600 mt-1">
              This will remove <strong>{{ equipment?.name }}</strong> from its current assignment and return it to the main warehouse.
            </p>

            <div v-if="equipment?.current_assignment?.user" class="mt-3 p-3 bg-slate-50 rounded-lg">
              <p class="text-xs text-slate-600">
                <strong>Currently assigned to:</strong> {{ equipment.current_assignment.user.name }}
              </p>
              <p class="text-xs text-slate-600">
                <strong>Location:</strong> {{ equipment.current_assignment.location.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 pt-4">
          <BaseButton
            variant="outline"
            size="md"
            full-width
            @click="cancelReturn"
            :disabled="returning"
          >
            Cancel
          </BaseButton>

          <BaseButton
            variant="warning"
            size="md"
            full-width
            @click="confirmReturn"
            :disabled="returning"
          >
            {{ returning ? 'Returning...' : 'Return to Warehouse' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Success/Error Notification -->
    <ErrorNotification
      :show="showNotification"
      :type="notificationType"
      :message="notificationMessage"
      :auto-close="5000"
      @close="closeNotification"
    />
  </AppLayout>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import LoadingState from '../components/ui/LoadingState.vue'
import ErrorState from '../components/ui/ErrorState.vue'
import ErrorNotification from '../components/ui/ErrorNotification.vue'
import HistoryTimeline from '../components/equipment/HistoryTimeline.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'EquipmentDetailView',
  components: {
    AppLayout,
    BaseCard,
    BaseBadge,
    BaseButton,
    BaseModal,
    LoadingState,
    ErrorState,
    ErrorNotification,
    HistoryTimeline,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const dashboardStore = useDashboardStore()

    const equipment = ref(null)
    const movements = ref([])
    const loading = ref(false)
    const historyLoading = ref(false)
    const error = ref(null)
    const historyError = ref(null)

    // Return to warehouse modal and notification
    const showReturnModal = ref(false)
    const returning = ref(false)
    const showNotification = ref(false)
    const notificationMessage = ref('')
    const notificationType = ref('success')

    const equipmentId = computed(() => route.params.id)

    // Load equipment and history on mount
    onMounted(async () => {
      await loadEquipment()
      await loadHistory()
    })

    const loadEquipment = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await apiClient.get(`/equipment/${equipmentId.value}`)
        equipment.value = response.data
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load equipment details'
        console.error('Failed to load equipment:', err)
      } finally {
        loading.value = false
      }
    }

    const loadHistory = async () => {
      historyLoading.value = true
      historyError.value = null

      try {
        const response = await apiClient.get(`/equipment/${equipmentId.value}/history`)
        movements.value = response.movements || []
      } catch (err) {
        historyError.value = err.response?.data?.message || 'Failed to load movement history'
        console.error('Failed to load history:', err)
      } finally {
        historyLoading.value = false
      }
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

    const getUserInitials = (name) => {
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Equipment status helpers
    const isEquipmentAvailable = computed(() => {
      return equipment.value && getStatusText(equipment.value) === 'Available'
    })

    const isEquipmentAssigned = computed(() => {
      return equipment.value && getStatusText(equipment.value) === 'Assigned'
    })

    // User role helper
    const currentUser = computed(() => {
      return authService.getUser()
    })

    const isAdmin = computed(() => {
      return currentUser.value?.role === 'admin'
    })

    // Action permissions (based on user role and equipment status)
    const canRequestEquipment = computed(() => {
      // Only regular users can request equipment, not admins
      return isEquipmentAvailable.value && !isAdmin.value
    })

    const canAssignEquipment = computed(() => {
      // Only admins can assign equipment directly
      return isEquipmentAvailable.value && isAdmin.value
    })

    const canTransferEquipment = computed(() => {
      // Only admins can transfer equipment
      return isEquipmentAssigned.value && isAdmin.value
    })

    const canReturnEquipment = computed(() => {
      // Only admins can return equipment to warehouse
      return isEquipmentAssigned.value && isAdmin.value
    })


    // Action methods
    const requestEquipment = () => {
      // TODO: Navigate to request creation
      console.log('Request equipment:', equipment.value)
    }

    const assignEquipment = () => {
      // TODO: Navigate to assignment flow
      console.log('Assign equipment:', equipment.value)
    }

    const transferEquipment = () => {
      router.push(`/equipment/${equipmentId.value}/transfer`)
    }

    const returnEquipment = () => {
      showReturnModal.value = true
    }

    const confirmReturn = async () => {
      returning.value = true

      try {
        // Get main warehouse location - assuming it has ID 1 or find by name
        const locationsResponse = await apiClient.get('/locations?type=warehouse')
        const warehouses = locationsResponse.data || []
        const mainWarehouse = warehouses.find(loc => loc.name.includes('Main')) || warehouses[0]

        if (!mainWarehouse) {
          throw new Error('No warehouse location found')
        }

        const returnData = {
          equipment_item_id: parseInt(equipmentId.value),
          to_user_id: null, // No user for warehouse
          to_location_id: mainWarehouse.id,
          movement_type: 'return_to_warehouse',
          notes: 'Returned to warehouse by admin'
        }

        await apiClient.post('/movements', returnData)

        // Close modal
        showReturnModal.value = false

        // Show success notification
        notificationType.value = 'success'
        notificationMessage.value = 'Equipment successfully returned to warehouse'
        showNotification.value = true

        // Reload equipment data to update assignment status
        await loadEquipment()
        // Reload movement history to show the new return movement
        await loadHistory()

      } catch (err) {
        notificationType.value = 'error'
        notificationMessage.value = err.response?.data?.message || 'Failed to return equipment'
        showNotification.value = true
        console.error('Return failed:', err)
      } finally {
        returning.value = false
      }
    }

    const cancelReturn = () => {
      showReturnModal.value = false
    }

    const closeNotification = () => {
      showNotification.value = false
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
      movements,
      loading,
      historyLoading,
      error,
      historyError,
      navigationItems,
      loadEquipment,
      loadHistory,
      getStatusVariant,
      getStatusText,
      getUserInitials,
      formatDate,
      isEquipmentAvailable,
      isEquipmentAssigned,
      currentUser,
      isAdmin,
      canRequestEquipment,
      canAssignEquipment,
      canTransferEquipment,
      canReturnEquipment,
      showReturnModal,
      returning,
      showNotification,
      notificationMessage,
      notificationType,
      requestEquipment,
      assignEquipment,
      transferEquipment,
      returnEquipment,
      confirmReturn,
      cancelReturn,
      closeNotification
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