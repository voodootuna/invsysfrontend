<template>
  <BaseCard>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-dark">Recent Activity</h2>
      <router-link to="/movements" class="text-primary font-semibold text-sm hover:text-primary-dark">
        View all
      </router-link>
    </div>

    <div class="space-y-3">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl"
      >
        <!-- Activity Icon -->
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
             :class="getActivityIconClass(activity.type)">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="activity.type === 'assignment'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            <path v-else-if="activity.type === 'return'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        </div>

        <!-- Activity Details -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-dark">
            <span class="font-medium">{{ activity.equipment?.name || 'Unknown Equipment' }}</span>
            {{ getActivityText(activity) }}
            <span class="font-medium">{{ getActivityUser(activity) }}</span>
          </p>
          <div class="flex items-center space-x-2 mt-1">
            <p class="text-xs text-slate-500">{{ getActivityLocation(activity) }}</p>
            <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
            <p class="text-xs text-slate-500">{{ formatTime(activity.moved_at) }}</p>
          </div>
        </div>

        <!-- Status Badge -->
        <BaseBadge :variant="getStatusVariant(activity.type)" size="sm">
          {{ activity.type }}
        </BaseBadge>
      </div>

      <!-- Empty State -->
      <div v-if="activities.length === 0" class="text-center py-8">
        <svg class="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-slate-500 text-sm">No recent activity</p>
      </div>
    </div>
  </BaseCard>
</template>

<script>
import BaseCard from '../ui/BaseCard.vue'
import BaseBadge from '../ui/BaseBadge.vue'

export default {
  name: 'ActivityFeed',
  components: {
    BaseCard,
    BaseBadge
  },
  props: {
    activities: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getActivityIconClass(type) {
      const classes = {
        'assignment': 'bg-green-500',
        'return': 'bg-blue-500',
        'transfer': 'bg-purple-500',
        'maintenance': 'bg-orange-500'
      }
      return classes[type] || 'bg-gray-500'
    },
    getActivityText(activity) {
      const texts = {
        'assignment': 'was assigned to',
        'return': 'was returned by',
        'transfer': 'was transferred to',
        'maintenance': 'sent to maintenance by'
      }
      return texts[activity.type] || 'was moved by'
    },
    getStatusVariant(type) {
      const variants = {
        'assignment': 'accent',
        'return': 'primary',
        'transfer': 'secondary',
        'maintenance': 'warning'
      }
      return variants[type] || 'secondary'
    },
    getActivityUser(activity) {
      // For movements, we want to show the "to" user (who received the equipment)
      // If no "to" user, show the "from" user (who gave up the equipment)
      // If neither, show who moved it
      if (activity.to?.user?.name) {
        return activity.to.user.name
      }
      if (activity.from?.user?.name) {
        return activity.from.user.name
      }
      if (activity.moved_by?.name) {
        return activity.moved_by.name
      }
      return 'Unknown User'
    },
    getActivityLocation(activity) {
      // For movements, show the "to" location (where equipment ended up)
      if (activity.to?.location?.name) {
        return activity.to.location.name
      }
      if (activity.from?.location?.name) {
        return activity.from.location.name
      }
      return 'Unknown Location'
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))

      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return date.toLocaleDateString()
    }
  }
}
</script>