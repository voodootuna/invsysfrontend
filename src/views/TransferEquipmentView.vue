<template>
  <AppLayout
    header-title="Transfer Equipment"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push(`/equipment/${equipmentId}`)"
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

    <!-- Transfer Form -->
    <div v-else-if="equipment" class="px-6 py-6 pb-32 space-y-6">

      <!-- Current Equipment Info -->
      <BaseCard variant="default" padding="lg">
        <h3 class="text-lg font-bold text-dark mb-4">Equipment to Transfer</h3>

        <div class="flex items-start space-x-4">
          <!-- Equipment Image -->
          <div class="w-16 h-16 rounded-xl overflow-hidden shadow-md bg-slate-100 flex-shrink-0">
            <img
              v-if="equipment.photo_url"
              :src="equipment.photo_url"
              :alt="equipment.name"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>

          <!-- Equipment Details -->
          <div class="flex-1">
            <h4 class="font-bold text-dark text-lg">{{ equipment.name }}</h4>
            <div class="space-y-1 mt-2">
              <p class="text-sm text-slate-600">
                <span class="font-medium">Serial:</span> {{ equipment.serial_number || 'N/A' }}
              </p>
              <p class="text-sm text-slate-600">
                <span class="font-medium">Type:</span> {{ equipment.type }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Current Assignment Info -->
      <BaseCard variant="default" padding="lg">
        <h3 class="text-lg font-bold text-dark mb-4">Current Assignment</h3>

        <div v-if="equipment.current_assignment" class="bg-slate-50 rounded-xl p-4">
          <!-- Current User -->
          <div v-if="equipment.current_assignment.user" class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span class="text-sm font-bold text-white">
                {{ getUserInitials(equipment.current_assignment.user.name) }}
              </span>
            </div>
            <div>
              <p class="font-semibold text-dark">{{ equipment.current_assignment.user.name }}</p>
              <p class="text-xs text-slate-500">{{ equipment.current_assignment.user.role }}</p>
            </div>
          </div>

          <!-- Current Location -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-dark">{{ equipment.current_assignment.location.name }}</p>
              <p class="text-xs text-slate-500">{{ equipment.current_assignment.location.type }}</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Transfer Form -->
      <BaseCard variant="default" padding="lg">
        <h3 class="text-lg font-bold text-dark mb-4">Transfer To</h3>

        <form @submit.prevent="submitTransfer" class="space-y-4">
          <!-- Select User -->
          <div>
            <label class="block text-sm font-medium text-dark mb-2">
              Assign to User
            </label>
            <select
              v-model="transferForm.to_user_id"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select a user...</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
                :disabled="user.id === equipment.current_assignment?.user?.id"
              >
                {{ user.name }} ({{ user.role }})
              </option>
            </select>
          </div>

          <!-- Select Location -->
          <div>
            <label class="block text-sm font-medium text-dark mb-2">
              Location
            </label>
            <select
              v-model="transferForm.to_location_id"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select a location...</option>
              <option
                v-for="location in availableLocations"
                :key="location.id"
                :value="location.id"
              >
                {{ location.name }} ({{ location.type }})
              </option>
            </select>
          </div>

          <!-- Transfer Notes -->
          <div>
            <label class="block text-sm font-medium text-dark mb-2">
              Transfer Notes
            </label>
            <textarea
              v-model="transferForm.notes"
              class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows="3"
              placeholder="Optional notes about this transfer..."
            ></textarea>
          </div>

          <!-- Submit Buttons -->
          <div class="flex space-x-3 pt-4">
            <BaseButton
              type="button"
              variant="outline"
              size="lg"
              full-width
              @click="$router.push(`/equipment/${equipmentId}`)"
            >
              Cancel
            </BaseButton>

            <BaseButton
              type="submit"
              variant="warning"
              size="lg"
              full-width
              :disabled="submitting"
            >
              {{ submitting ? 'Transferring...' : 'Transfer Equipment' }}
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
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
import BaseButton from '../components/ui/BaseButton.vue'
import LoadingState from '../components/ui/LoadingState.vue'
import ErrorState from '../components/ui/ErrorState.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'TransferEquipmentView',
  components: {
    AppLayout,
    BaseCard,
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
    const router = useRouter()
    const dashboardStore = useDashboardStore()

    const equipment = ref(null)
    const availableUsers = ref([])
    const availableLocations = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    const error = ref(null)

    const equipmentId = computed(() => route.params.id)

    const transferForm = ref({
      to_user_id: '',
      to_location_id: '',
      notes: ''
    })

    onMounted(async () => {
      await Promise.all([
        loadEquipment(),
        loadUsers(),
        loadLocations()
      ])
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

    const loadUsers = async () => {
      try {
        const response = await apiClient.get('/users')
        availableUsers.value = response.data || []
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    }

    const loadLocations = async () => {
      try {
        const response = await apiClient.get('/locations')
        availableLocations.value = response.data || []
      } catch (err) {
        console.error('Failed to load locations:', err)
      }
    }

    const getUserInitials = (name) => {
      return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }

    const submitTransfer = async () => {
      submitting.value = true

      try {
        const transferData = {
          equipment_item_id: parseInt(equipmentId.value),
          to_user_id: parseInt(transferForm.value.to_user_id),
          to_location_id: parseInt(transferForm.value.to_location_id),
          movement_type: 'direct_assignment',
          notes: transferForm.value.notes || null
        }

        await apiClient.post('/movements', transferData)

        // Redirect back to equipment detail with success
        router.push(`/equipment/${equipmentId.value}`)

      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to transfer equipment'
        console.error('Transfer failed:', err)
      } finally {
        submitting.value = false
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
      availableUsers,
      availableLocations,
      loading,
      submitting,
      error,
      equipmentId,
      transferForm,
      navigationItems,
      loadEquipment,
      getUserInitials,
      submitTransfer
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