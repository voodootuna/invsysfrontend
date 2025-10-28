<template>
  <AppLayout
    header-title="Assign Equipment"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/')"
    @logout-click="handleLogout"
  >
    <div class="px-6 py-6 pb-32 space-y-6">

      <!-- Equipment Preview Section -->
      <div class="flex items-start space-x-4 mb-6">
        <!-- Equipment Image -->
        <div class="relative w-24 h-24 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
          <img
            v-if="selectedEquipment && selectedEquipment.photo_url"
            :src="selectedEquipment.photo_url"
            :alt="selectedEquipment.name"
            class="w-full h-full object-cover"
          >
          <div
            v-if="!selectedEquipment"
            class="absolute inset-0 bg-slate-500/80 backdrop-blur-sm flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>

        <!-- Equipment Details -->
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg text-dark mb-2">
            {{ selectedEquipment ? selectedEquipment.name : 'Select equipment from dropdown' }}
          </h3>

          <div v-if="selectedEquipment" class="grid grid-cols-1 gap-2">
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Type:</span>
              <span class="text-sm font-semibold text-dark">{{ selectedEquipment.type || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Serial:</span>
              <span class="text-sm font-semibold text-dark">{{ selectedEquipment.serial_number || '-' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Location:</span>
              <span class="text-sm font-semibold text-dark">{{ getCurrentLocation() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-slate-500 font-medium">Status:</span>
              <BaseBadge variant="accent" size="sm">Available</BaseBadge>
            </div>
          </div>

          <div v-else class="text-sm text-slate-500">Equipment details will appear here</div>
        </div>
      </div>

      <!-- Equipment Dropdown -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-dark mb-2">Available Equipment</label>
        <select
          v-model="selectedEquipmentId"
          @change="handleEquipmentSelection"
          class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary custom-select text-dark"
        >
          <option value="">Select equipment to assign...</option>
          <option
            v-for="equipment in availableEquipment"
            :key="equipment.id"
            :value="equipment.id"
          >
            {{ equipment.name }} ({{ equipment.serial_number }}) - {{ getEquipmentLocation(equipment) }}
          </option>
        </select>
      </div>

      <!-- Assignment Form Section -->
      <div v-if="selectedEquipment" class="space-y-4">
        <!-- Assign To -->
        <div>
          <label class="block text-sm font-semibold text-dark mb-2">Assign To</label>
          <select
            v-model="form.userId"
            class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary custom-select text-dark"
          >
            <option value="">Select user...</option>
            <option
              v-for="user in users"
              :key="user.id"
              :value="user.id"
            >
              {{ user.name }} ({{ user.role }})
            </option>
          </select>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-semibold text-dark mb-2">Destination Location</label>
          <LocationSearchInput
            v-model="form.locationId"
            placeholder="Search or create location..."
            @location-selected="handleLocationSelected"
            @location-created="handleLocationCreated"
          />
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-sm font-semibold text-dark mb-2">Reason</label>
          <textarea
            v-model="form.reason"
            class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-dark resize-none"
            rows="3"
            placeholder="Why is this equipment being assigned? (e.g., New project requirements, equipment repair, etc.)"
          ></textarea>
        </div>
      </div>

      <!-- Assignment Actions -->
      <div v-if="selectedEquipment" class="grid grid-cols-2 gap-3 mt-6">
        <BaseButton
          variant="secondary"
          size="lg"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="lg"
          :disabled="!canSubmit || loading"
          @click="handleAssign"
        >
          <svg v-if="loading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ loading ? 'Assigning...' : 'Assign Equipment' }}
        </BaseButton>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import LocationSearchInput from '../components/ui/LocationSearchInput.vue'
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'AssignEquipmentView',
  components: {
    AppLayout,
    BaseButton,
    BaseBadge,
    LocationSearchInput,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const route = useRoute()
    const dashboardStore = useDashboardStore()
    const selectedEquipmentId = ref('')
    const selectedEquipment = ref(null)
    const availableEquipment = ref([])
    const users = ref([])
    const locations = ref([])
    const loading = ref(false)

    const form = ref({
      userId: '',
      locationId: '',
      reason: ''
    })

    // Load data on mount
    onMounted(async () => {
      await Promise.all([
        loadAvailableEquipment(),
        loadUsers(),
        loadLocations()
      ])

      // Check if equipmentId is passed as query parameter
      if (route.query.equipmentId) {
        selectedEquipmentId.value = route.query.equipmentId
        handleEquipmentSelection()
      }
    })

    const loadAvailableEquipment = async () => {
      try {
        const response = await apiClient.get('/equipment')
        // Filter for available equipment (no assignment or assigned to warehouse with user: null)
        availableEquipment.value = response.data?.filter(item => {
          return !item.current_assignment ||
                 (item.current_assignment && !item.current_assignment.user)
        }) || []
      } catch (error) {
        console.error('Failed to load equipment:', error)
      }
    }

    const loadUsers = async () => {
      try {
        const response = await apiClient.get('/users')
        users.value = response.data || []
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    }

    const loadLocations = async () => {
      try {
        const response = await apiClient.get('/locations')
        locations.value = response.data || []
      } catch (error) {
        console.error('Failed to load locations:', error)
      }
    }

    const handleEquipmentSelection = () => {
      if (selectedEquipmentId.value) {
        selectedEquipment.value = availableEquipment.value.find(
          eq => eq.id === parseInt(selectedEquipmentId.value)
        )
      } else {
        selectedEquipment.value = null
      }

      // Reset form when equipment changes
      form.value = {
        userId: '',
        locationId: '',
        reason: ''
      }
    }

    const getCurrentLocation = () => {
      if (!selectedEquipment.value) return '-'
      return selectedEquipment.value.current_location?.name || 'Warehouse'
    }

    const getEquipmentLocation = (equipment) => {
      return equipment.current_location?.name || 'Warehouse'
    }

    const canSubmit = computed(() => {
      return selectedEquipment.value &&
             form.value.userId &&
             form.value.locationId &&
             form.value.reason.trim()
    })

    const handleCancel = () => {
      selectedEquipmentId.value = ''
      selectedEquipment.value = null
      form.value = {
        userId: '',
        locationId: '',
        reason: ''
      }
    }

    const handleAssign = async () => {
      if (!canSubmit.value) return

      loading.value = true

      try {
        await apiClient.post('/movements', {
          equipment_item_id: selectedEquipment.value.id,
          to_user_id: form.value.userId,
          to_location_id: form.value.locationId,
          movement_type: 'direct_assignment',
          notes: form.value.reason
        })

        // Success - redirect to dashboard
        window.location.href = '/'
      } catch (error) {
        console.error('Assignment failed:', error)
        alert('Failed to assign equipment. Please try again.')
      } finally {
        loading.value = false
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

    const handleLocationSelected = (location) => {
      console.log('Location selected:', location)
      // Location ID is already set via v-model
    }

    const handleLocationCreated = (location) => {
      console.log('Location created:', location)
      // Add newly created location to the locations list
      locations.value.push(location)
    }

    return {
      selectedEquipmentId,
      selectedEquipment,
      availableEquipment,
      users,
      locations,
      form,
      loading,
      canSubmit,
      navigationItems,
      handleEquipmentSelection,
      getCurrentLocation,
      getEquipmentLocation,
      handleCancel,
      handleAssign,
      handleLocationSelected,
      handleLocationCreated
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
.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>