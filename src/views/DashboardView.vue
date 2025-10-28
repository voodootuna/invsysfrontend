<template>
  <AppLayout
    header-title="Admin Dashboard"
    user-name="Admin User"
    :navigation-items="navigationItems"
    @logout-click="handleLogout"
    @fab-click="handleFabClick"
  >

    <!-- Dashboard Content -->
    <div class="px-6 py-6 pb-32 space-y-6">

      <!-- Dashboard Stats Cards -->
      <div class="grid grid-cols-3 gap-4">
        <template v-if="dashboardStore.loading.stats">
          <BaseCard v-for="i in 3" :key="i" variant="default" padding="md">
            <LoadingState title="Loading stats..." />
          </BaseCard>
        </template>
        <template v-else-if="dashboardStore.errors.stats">
          <BaseCard v-for="i in 3" :key="i" variant="default" padding="md">
            <ErrorState
              title="Stats Error"
              :message="dashboardStore.errors.stats"
              @retry="dashboardStore.loadStats"
            />
          </BaseCard>
        </template>
        <template v-else>
          <StatCard
            icon-type="check"
            :value="dashboardStore.formattedStats.available"
            label="Available"
            variant="accent"
          />
          <StatCard
            icon-type="box"
            :value="dashboardStore.formattedStats.assigned"
            label="Assigned"
            variant="primary"
          />
          <StatCard
            icon-type="clock"
            :value="dashboardStore.pendingRequestsCount"
            label="Pending"
            variant="warning"
          />
        </template>
      </div>

      <!-- Quick Actions -->
      <div>
        <h2 class="text-lg font-bold text-dark mb-4">Quick Actions</h2>
        <QuickActionGrid />
      </div>

      <!-- Movement Requests Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-dark">Movement Requests</h2>
          <router-link to="/requests" class="text-primary font-semibold text-sm hover:text-primary-dark">
            View all
          </router-link>
        </div>

        <!-- Movement Requests Grid -->
        <div v-if="dashboardStore.loading.requests" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BaseCard v-for="i in 2" :key="i" variant="default" padding="sm">
            <LoadingState title="Loading requests..." />
          </BaseCard>
        </div>
        <div v-else-if="dashboardStore.errors.requests" class="grid grid-cols-1 gap-3">
          <BaseCard variant="default" padding="md">
            <ErrorState
              title="Requests Error"
              :message="dashboardStore.errors.requests"
              @retry="dashboardStore.loadMovementRequests"
            />
          </BaseCard>
        </div>
        <div v-else-if="dashboardStore.movementRequests.length === 0" class="text-center py-8">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-slate-500 text-sm">No pending requests</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MovementRequestCard
            v-for="request in dashboardStore.movementRequests"
            :key="request.id"
            :request="request"
            @approve="handleApprove"
            @deny="handleDeny"
            @override="handleOverride"
          />
        </div>
      </div>

      <!-- Available Equipment -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-dark">Available Equipment</h2>
          <router-link to="/equipment" class="text-primary font-semibold text-sm hover:text-primary-dark">
            View all
          </router-link>
        </div>

        <div v-if="dashboardStore.loading.equipment">
          <BaseCard variant="default" padding="md">
            <LoadingState title="Loading equipment..." />
          </BaseCard>
        </div>
        <div v-else-if="dashboardStore.errors.equipment">
          <BaseCard variant="default" padding="md">
            <ErrorState
              title="Equipment Error"
              :message="dashboardStore.errors.equipment"
              @retry="dashboardStore.loadAvailableEquipment"
            />
          </BaseCard>
        </div>
        <EquipmentGrid
          v-else
          :equipment-list="dashboardStore.availableEquipment"
          @equipment-click="handleEquipmentClick"
          @assign-click="handleAssignClick"
        />
      </div>

      <!-- Recent Activity -->
      <div v-if="dashboardStore.loading.activity">
        <BaseCard variant="default" padding="md">
          <LoadingState title="Loading activity..." />
        </BaseCard>
      </div>
      <div v-else-if="dashboardStore.errors.activity">
        <BaseCard variant="default" padding="md">
          <ErrorState
            title="Activity Error"
            :message="dashboardStore.errors.activity"
            @retry="dashboardStore.loadRecentActivity"
          />
        </BaseCard>
      </div>
      <ActivityFeed v-else :activities="dashboardStore.recentActivity" />
    </div>

    <!-- Test Modal -->
    <BaseModal
      :show="showModal"
      title="Test Modal"
      @close="showModal = false"
    >
      <p class="text-slate-600">This is a test modal to verify the BaseModal component is working correctly.</p>

      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" @click="showModal = false">OK</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script>
import { onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboardStore'
import { authService } from '../services/apiService'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import ErrorState from '../components/ui/ErrorState.vue'
import LoadingState from '../components/ui/LoadingState.vue'

// Dashboard Components
import StatCard from '../components/dashboard/StatCard.vue'
import QuickActionGrid from '../components/dashboard/QuickActionGrid.vue'
import MovementRequestCard from '../components/dashboard/MovementRequestCard.vue'
import EquipmentGrid from '../components/dashboard/EquipmentGrid.vue'
import ActivityFeed from '../components/dashboard/ActivityFeed.vue'

// Import icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'DashboardView',
  components: {
    AppLayout,
    BaseButton,
    BaseCard,
    BaseModal,
    ErrorState,
    LoadingState,
    StatCard,
    QuickActionGrid,
    MovementRequestCard,
    EquipmentGrid,
    ActivityFeed,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const dashboardStore = useDashboardStore()

    // Load dashboard data on component mount
    onMounted(async () => {
      await dashboardStore.loadDashboardData()
    })

    return {
      dashboardStore
    }
  },
  data() {
    return {
      showModal: false
    }
  },
  computed: {
    navigationItems() {
      return [
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
          badge: this.dashboardStore?.pendingRequestsCount || 0
        },
        {
          name: 'users',
          to: '/users',
          label: 'Users',
          icon: UsersIcon,
          badge: 0
        }
      ]
    }
  },
  methods: {
    async handleLogout() {
      try {
        await authService.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Force logout even if API call fails
        this.$router.push('/login')
      }
    },
    handleFabClick() {
      console.log('FAB clicked - Quick equipment request')
    },
    async handleApprove(request) {
      try {
        await this.dashboardStore.approveRequest(request.id)
        console.log('Request approved:', request)
      } catch (error) {
        console.error('Failed to approve request:', error)
        // TODO: Show error toast/notification
      }
    },
    async handleDeny(request) {
      try {
        await this.dashboardStore.denyRequest(request.id, 'Denied by admin')
        console.log('Request denied:', request)
      } catch (error) {
        console.error('Failed to deny request:', error)
        // TODO: Show error toast/notification
      }
    },
    handleOverride(request) {
      console.log('Override request:', request)
      // TODO: Implement override functionality
    },
    handleEquipmentClick(equipment) {
      this.$router.push(`/equipment/${equipment.id}`)
    },
    handleAssignClick(equipment) {
      this.$router.push({
        path: '/assign',
        query: { equipmentId: equipment.id }
      })
    }
  }
}
</script>