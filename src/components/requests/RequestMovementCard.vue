<template>
  <div :class="getCardClasses()">
    <div class="flex items-center space-x-3 mb-3">
      <!-- Equipment Image -->
      <div class="w-16 h-16 rounded-xl overflow-hidden shadow-md bg-white p-1 flex-shrink-0">
        <img
          v-if="request.equipment?.photo_url"
          :src="request.equipment.photo_url"
          :alt="request.equipment.name"
          class="w-full h-full object-cover rounded-lg"
        >
        <div
          v-else
          class="w-full h-full bg-slate-100 flex items-center justify-center rounded-lg"
        >
          <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
      </div>

      <!-- Request Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-bold text-dark text-sm">{{ request.equipment?.name || 'Equipment' }}</h3>

          <!-- Combined Smart Badge -->
          <div class="flex items-center space-x-1">
            <span
              v-if="isUrgent"
              class="px-2 py-0.5 bg-danger text-white text-xs font-bold rounded-full"
            >
              Urgent
            </span>
            <span :class="getSmartBadgeClasses()">
              {{ getSmartBadgeText() }}
            </span>
          </div>
        </div>

        <!-- From/To Movement -->
        <p class="text-xs text-slate-500">{{ getMovementText() }}</p>

        <!-- Requested by and time -->
        <p class="text-xs text-slate-400 mt-1">
          Requested by {{ request.to_user?.name || 'Unknown User' }} • {{ formatTimeAgo(request.created_at) }}
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="canTakeActions && request.status === 'pending'" class="grid grid-cols-3 gap-1">
      <button
        @click="$emit('approve', request.id)"
        class="gradient-accent text-white font-medium py-1.5 px-2 rounded-lg text-xs card-hover"
      >
        Approve
      </button>
      <button
        @click="$emit('override', request.id)"
        class="bg-primary/10 hover:bg-primary/20 text-primary font-medium py-1.5 px-2 rounded-lg text-xs card-hover"
      >
        Override
      </button>
      <button
        @click="$emit('deny', request.id)"
        class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 px-2 rounded-lg text-xs card-hover"
      >
        Deny
      </button>
    </div>

  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'RequestMovementCard',
  props: {
    request: {
      type: Object,
      required: true
    },
    currentUser: {
      type: Object,
      default: null
    }
  },
  emits: ['approve', 'deny', 'override'],
  setup(props) {
    const canTakeActions = computed(() => {
      return props.currentUser?.role === 'admin'
    })

    const isUrgent = computed(() => {
      // Check if request reason contains urgent keywords
      const reason = props.request.reason?.toLowerCase() || ''
      return reason.includes('urgent') || reason.includes('emergency')
    })

    const getCardClasses = () => {
      const baseClasses = 'rounded-2xl p-3 border border-slate-100 shadow-sm'

      // Different gradient backgrounds based on request type
      const requestType = getRequestType()
      switch (requestType) {
        case 'return':
          return `bg-gradient-to-r from-white to-orange-50 border-orange-100 ${baseClasses}`
        case 'assignment':
          return `bg-gradient-to-r from-white to-slate-50 ${baseClasses}`
        case 'transfer':
        default:
          return `bg-gradient-to-r from-white to-slate-50 ${baseClasses}`
      }
    }

    const getRequestType = () => {
      // Determine request type based on from/to locations and users
      const fromLocation = props.request.from_location
      const toLocation = props.request.to_location
      const fromUser = props.request.from_user
      const toUser = props.request.to_user

      // Return: from user to warehouse
      if (fromUser && toLocation?.type === 'warehouse') {
        return 'return'
      }

      // Assignment: from warehouse to user
      if (fromLocation?.type === 'warehouse' && toUser) {
        return 'assignment'
      }

      // Transfer: from user to user (different users)
      if (fromUser && toUser && fromUser.id !== toUser.id) {
        return 'transfer'
      }

      // Default to assignment for warehouse -> user
      return 'assignment'
    }

    const getRequestTypeLabel = () => {
      const type = getRequestType()
      switch (type) {
        case 'return':
          return 'Return'
        case 'transfer':
          return 'Transfer'
        case 'assignment':
        default:
          return 'Assignment'
      }
    }

    // Smart badge that combines status and type information
    const getSmartBadgeClasses = () => {
      const baseClasses = 'px-2 py-1 text-xs font-bold rounded-full'
      const status = props.request.status

      switch (status) {
        case 'pending':
          // Use request type colors for pending requests
          const type = getRequestType()
          switch (type) {
            case 'return':
              return `${baseClasses} bg-orange-500 text-white`
            case 'transfer':
              return `${baseClasses} bg-blue-500 text-white`
            case 'assignment':
            default:
              return `${baseClasses} bg-green-500 text-white`
          }
        case 'approved':
          return `${baseClasses} bg-green-600 text-white`
        case 'denied':
          return `${baseClasses} bg-red-500 text-white`
        case 'cancelled':
          return `${baseClasses} bg-gray-500 text-white`
        default:
          return `${baseClasses} bg-blue-500 text-white`
      }
    }

    const getSmartBadgeText = () => {
      const status = props.request.status

      if (status === 'pending') {
        // Show request type for pending requests
        return getRequestTypeLabel()
      } else {
        // Show status for processed requests
        switch (status) {
          case 'approved':
            return 'Approved'
          case 'denied':
            return 'Denied'
          case 'cancelled':
            return 'Cancelled'
          default:
            return 'Processed'
        }
      }
    }

    const getMovementText = () => {
      const fromUser = props.request.from_user
      const toUser = props.request.to_user
      const fromLocation = props.request.from_location
      const toLocation = props.request.to_location

      const fromText = fromUser
        ? `${fromUser.name} @ ${fromLocation?.name || 'Unknown Location'}`
        : (fromLocation?.name || 'Warehouse')

      const toText = toUser
        ? `${toUser.name} @ ${toLocation?.name || 'Unknown Location'}`
        : (toLocation?.name || 'Warehouse')

      return `${fromText} → ${toText}`
    }

    const formatTimeAgo = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 60) {
        return `${diffInMinutes}min ago`
      } else if (diffInMinutes < 1440) { // 24 hours
        const hours = Math.floor(diffInMinutes / 60)
        return `${hours}h ago`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        return `${days}d ago`
      }
    }


    return {
      canTakeActions,
      isUrgent,
      getCardClasses,
      getRequestType,
      getRequestTypeLabel,
      getSmartBadgeClasses,
      getSmartBadgeText,
      getMovementText,
      formatTimeAgo
    }
  }
}
</script>