<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Global Error Notification -->
    <ErrorNotification
      :show="errorStore.hasError"
      :title="errorStore.currentError?.title"
      :message="errorStore.currentError?.message || ''"
      :details="errorStore.currentError?.details"
      :show-retry="errorStore.currentError?.showRetry || false"
      :show-details="errorStore.currentError?.showDetails || false"
      :auto-close="errorStore.currentError?.autoClose || 0"
      :type="errorStore.currentError?.type || 'error'"
      @close="errorStore.clearError"
      @retry="handleErrorRetry"
    />

    <div class="w-full sm:max-w-2xl sm:mx-auto min-h-screen pb-20 relative sm:bg-white/50 sm:shadow-2xl">

      <!-- Header -->
      <AppHeader
        :title="headerTitle"
        :subtitle="headerSubtitle"
        :user-name="userName"
        :show-menu="showMenu"
        :show-back-button="showBackButton"
        @logout-click="$emit('logout-click')"
        @back-click="$emit('back-click')"
      />

      <!-- Main Content Area -->
      <main class="relative">
        <slot />
      </main>

      <!-- Floating Action Button -->
      <FloatingActionButton
        v-if="showFab"
        :icon="fabIcon"
        :variant="fabVariant"
        @click="$emit('fab-click')"
      />

      <!-- Bottom Navigation -->
      <BottomNavigation
        :nav-items="navigationItems"
      />
    </div>
  </div>
</template>

<script>
import { useErrorStore } from '../../stores/errorStore'
import AppHeader from './AppHeader.vue'
import BottomNavigation from './BottomNavigation.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import ErrorNotification from '../ui/ErrorNotification.vue'

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    BottomNavigation,
    FloatingActionButton,
    ErrorNotification
  },
  setup() {
    const errorStore = useErrorStore()

    const handleErrorRetry = () => {
      // Emit retry event to parent component
      // Or implement generic retry logic here
      console.log('Error retry requested')
      errorStore.clearError()
    }

    return {
      errorStore,
      handleErrorRetry
    }
  },
  emits: ['logout-click', 'fab-click', 'back-click'],
  props: {
    headerTitle: {
      type: String,
      default: 'Dashboard'
    },
    headerSubtitle: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: 'Admin User'
    },
    showMenu: {
      type: Boolean,
      default: false
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    showFab: {
      type: Boolean,
      default: true
    },
    fabIcon: {
      type: String,
      default: 'PlusIcon'
    },
    fabVariant: {
      type: String,
      default: 'primary'
    },
    navigationItems: {
      type: Array,
      default: () => [
        {
          name: 'dashboard',
          to: '/',
          label: 'Dashboard',
          icon: 'DashboardIcon',
          badge: 0
        },
        {
          name: 'equipment',
          to: '/equipment',
          label: 'Inventory',
          icon: 'InventoryIcon',
          badge: 0
        },
        {
          name: 'requests',
          to: '/requests',
          label: 'Requests',
          icon: 'RequestIcon',
          badge: 5
        },
        {
          name: 'reports',
          to: '/reports',
          label: 'Reports',
          icon: 'ReportIcon',
          badge: 0
        }
      ]
    }
  }
}
</script>