<template>
  <!-- Loading State -->
  <div v-if="loading" class="space-y-3">
    <div
      v-for="i in 3"
      :key="i"
      class="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg animate-pulse"
    >
      <div class="w-6 h-6 bg-slate-200 rounded-md"></div>
      <div class="flex-1 space-y-2">
        <div class="h-3 bg-slate-200 rounded w-3/4"></div>
        <div class="h-2 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="text-center py-6">
    <div class="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-2">
      <svg class="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <p class="text-sm text-slate-600 mb-2">{{ error }}</p>
    <BaseButton
      variant="outline"
      size="sm"
      @click="$emit('retry')"
    >
      Retry
    </BaseButton>
  </div>

  <!-- Well-Organized Movement History -->
  <div v-else-if="movements && movements.length > 0" class="space-y-3">
    <div
      v-for="movement in movements"
      :key="movement.id"
      class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
    >
      <!-- Top Row: Badge, Date & Executor -->
      <div class="flex items-center justify-between mb-3">
        <div :class="getMovementBadgeClasses(movement.movement_type)" class="px-3 py-1 rounded-full text-xs font-bold">
          {{ formatMovementType(movement.movement_type) }}
        </div>

        <div class="text-right">
          <div class="text-xs text-slate-500 font-medium">{{ formatTimeAgo(movement.moved_at) }}</div>
          <div v-if="movement.moved_by" class="text-xs text-slate-400">by {{ movement.moved_by.name }}</div>
        </div>
      </div>

      <!-- Movement Flow Section -->
      <div class="grid grid-cols-5 gap-2 items-center">
        <!-- From Section -->
        <div class="col-span-2">
          <div class="text-xs text-slate-500 font-medium mb-1">From</div>
          <div class="text-sm font-semibold text-slate-700 leading-tight">
            {{ getFromText(movement) }}
          </div>
        </div>

        <!-- Arrow Section -->
        <div class="col-span-1 flex justify-center">
          <div class="bg-primary/10 p-2 rounded-full">
            <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </div>
        </div>

        <!-- To Section -->
        <div class="col-span-2">
          <div class="text-xs text-slate-500 font-medium mb-1">To</div>
          <div class="text-sm font-semibold text-slate-700 leading-tight">
            {{ getToText(movement) }}
          </div>
        </div>
      </div>

      <!-- Notes Section (if present) -->
      <div v-if="movement.notes || movement.request?.reason" class="mt-3 pt-3 border-t border-slate-100">
        <div class="text-xs text-slate-500 font-medium mb-1">Notes</div>
        <p class="text-xs text-slate-600 italic leading-relaxed">
          "{{ movement.notes || movement.request?.reason }}"
        </p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else class="text-center py-6">
    <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <p class="text-sm text-slate-500">No movement history</p>
    <p class="text-xs text-slate-400">This equipment hasn't been moved yet</p>
  </div>
</template>

<script>
import BaseButton from '../ui/BaseButton.vue'

export default {
  name: 'HistoryTimeline',
  components: {
    BaseButton
  },
  emits: ['retry'],
  props: {
    movements: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  methods: {
    getMovementBadgeClasses(movementType) {
      const baseClasses = 'text-white'

      switch (movementType) {
        case 'admin_assigned':
        case 'request_approved':
          return `${baseClasses} bg-green-500`
        case 'admin_transferred':
          return `${baseClasses} bg-blue-500`
        case 'admin_returned':
          return `${baseClasses} bg-orange-500`
        case 'request_denied':
          return `${baseClasses} bg-red-500`
        default:
          return `${baseClasses} bg-slate-500`
      }
    },

    formatMovementType(type) {
      const labels = {
        'admin_assigned': 'Assigned',
        'admin_transferred': 'Transferred',
        'admin_returned': 'Returned',
        'request_approved': 'Approved',
        'request_denied': 'Denied'
      }
      return labels[type] || type
    },

    getFromText(movement) {
      if (movement.from?.user) {
        return `${movement.from.user.name} @ ${movement.from?.location?.name || 'Unknown'}`
      }
      return movement.from?.location?.name || 'Warehouse'
    },

    getToText(movement) {
      if (movement.to?.user) {
        return `${movement.to.user.name} @ ${movement.to?.location?.name || 'Unknown'}`
      }
      return movement.to?.location?.name || 'Warehouse'
    },

    formatTimeAgo(dateString) {
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
        if (days === 1) return '1 day ago'
        if (days < 30) return `${days} days ago`

        // Format as date for older entries
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
    }
  }
}
</script>