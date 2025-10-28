import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import AssignEquipmentView from '../views/AssignEquipmentView.vue'
import EquipmentListView from '../views/EquipmentListView.vue'
import EquipmentDetailView from '../views/EquipmentDetailView.vue'
import EquipmentEditView from '../views/EquipmentEditView.vue'
import EquipmentCreateView from '../views/EquipmentCreateView.vue'
import RequestListView from '../views/RequestListView.vue'
import MovementHistoryView from '../views/MovementHistoryView.vue'
import TransferEquipmentView from '../views/TransferEquipmentView.vue'
import UserListView from '../views/UserListView.vue'
import UserCreateView from '../views/UserCreateView.vue'
import UserEditView from '../views/UserEditView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/assign',
      name: 'assign-equipment',
      component: AssignEquipmentView,
      meta: { requiresAuth: true }
    },
    {
      path: '/equipment',
      name: 'equipment-list',
      component: EquipmentListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/equipment/create',
      name: 'equipment-create',
      component: EquipmentCreateView,
      meta: { requiresAuth: true }
    },
    {
      path: '/equipment/:id',
      name: 'equipment-detail',
      component: EquipmentDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/equipment/:id/edit',
      name: 'equipment-edit',
      component: EquipmentEditView,
      meta: { requiresAuth: true }
    },
    {
      path: '/equipment/:id/transfer',
      name: 'equipment-transfer',
      component: TransferEquipmentView,
      meta: { requiresAuth: true }
    },
    {
      path: '/requests',
      name: 'requests',
      component: RequestListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/movements',
      name: 'movements',
      component: MovementHistoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UserListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/create',
      name: 'user-create',
      component: UserCreateView,
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id/edit',
      name: 'user-edit',
      component: UserEditView,
      meta: { requiresAuth: true }
    },
    // Redirect to dashboard by default
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guard for authentication and data initialization
router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    next('/login')
  } else if (to.name === 'login' && isAuthenticated) {
    // Redirect to dashboard if user is already authenticated and trying to access login
    next('/')
  } else {
    // For authenticated routes, ensure dashboard store has request data for badges
    if (requiresAuth && isAuthenticated) {
      const dashboardStore = useDashboardStore()

      // Only load if we don't have data yet (to avoid unnecessary API calls)
      if (dashboardStore.movementRequests.length === 0 && !dashboardStore.loading.requests) {
        try {
          await dashboardStore.loadMovementRequests()
        } catch (error) {
          console.error('Failed to load request data for badges:', error)
          // Don't block navigation if this fails
        }
      }
    }

    next()
  }
})

export default router