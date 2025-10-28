<template>
  <BaseCard
    variant="default"
    padding="lg"
    class="card-hover"
    @click="handleCardClick"
  >
    <div class="space-y-4">
      <!-- Request Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <!-- User Avatar -->
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-semibold text-sm">
              {{ getUserInitials(request.to_user?.name) }}
            </div>

            <!-- User Info -->
            <div>
              <h3 class="font-semibold text-dark">{{ request.to_user?.name || 'Unknown User' }}</h3>
              <p class="text-xs text-slate-500">{{ request.to_user?.role || 'Employee' }}</p>
            </div>
          </div>

          <!-- Equipment Info -->
          <div class="ml-13">
            <p class="text-sm font-medium text-slate-700 mb-1">
              Requesting: <span class="text-dark">{{ request.equipment?.name || 'Equipment' }}</span>
            </p>
            <p class="text-xs text-slate-500">
              {{ request.equipment?.type || 'Type not specified' }}
              <span v-if="request.equipment?.serial_number" class="ml-2">
                • SN: {{ request.equipment.serial_number }}
              </span>
            </p>
          </div>
        </div>

        <!-- Status Badge -->
        <BaseBadge
          :variant="getStatusVariant(request.status)"
          size="sm"
        >
          {{ getStatusLabel(request.status) }}
        </BaseBadge>
      </div>

      <!-- Request Details -->
      <div class="bg-slate-50 rounded-xl p-3">
        <div class="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>Request Date</span>
          <span>{{ formatDate(request.created_at) }}</span>
        </div>

        <div v-if="request.to_location" class="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>To Location</span>
          <span>{{ request.to_location.name }}</span>
        </div>

        <div v-if="request.reason" class="mt-2">
          <p class="text-xs text-slate-700 leading-relaxed">
            <span class="font-medium">Reason:</span> {{ request.reason }}
          </p>
        </div>
      </div>

      <!-- Action Buttons (Admin Only) -->
      <div
        v-if="canTakeActions && request.status === 'pending'"
        class="flex space-x-3"
        @click.stop
      >
        <BaseButton
          variant="success"
          size="sm"
          @click="$emit('approve', request.id)"
          class="flex-1"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Approve
        </BaseButton>

        <BaseButton
          variant="danger"
          size="sm"
          @click="$emit('deny', request.id)"
          class="flex-1"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Deny
        </BaseButton>
      </div>

      <!-- Cancel Button (User's Own Pending Requests) -->
      <div
        v-else-if="canCancel && request.status === 'pending'"
        class="flex"
        @click.stop
      >
        <BaseButton
          variant="secondary"
          size="sm"
          @click="$emit('cancel', request.id)"
          class="flex-1"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Cancel Request
        </BaseButton>
      </div>

      <!-- Processed Info (Approved/Denied/Cancelled) -->
      <div v-else-if="request.status !== 'pending' && (request.processed_by || request.processed_at)">
        <div class="bg-slate-50 rounded-xl p-3">
          <div class="flex items-center justify-between text-xs text-slate-600">
            <span>{{ getProcessedLabel(request.status) }} by</span>
            <div class="text-right">
              <div class="font-medium text-slate-700">{{ request.processed_by?.name || 'Admin' }}</div>
              <div class="text-slate-500">{{ formatDate(request.processed_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script>
import { computed } from 'vue'
import BaseCard from '../ui/BaseCard.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseButton from '../ui/BaseButton.vue'

export default {
  name: 'RequestCard',
  components: {
    BaseCard,
    BaseBadge,
    BaseButton
  },
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
  emits: ['approve', 'deny', 'cancel', 'view-details'],
  setup(props) {
    const canTakeActions = computed(() => {
      return props.currentUser?.role === 'admin'
    })

    const canCancel = computed(() => {
      return props.currentUser?.id === props.request.to_user?.id
    })

    const getUserInitials = (name) => {
      if (!name) return '?'
      return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    }

    const getStatusVariant = (status) => {
      switch (status) {
        case 'pending':
          return 'warning'
        case 'approved':
          return 'success'
        case 'denied':
          return 'danger'
        case 'cancelled':
          return 'secondary'
        default:
          return 'default'
      }
    }

    const getStatusLabel = (status) => {
      switch (status) {
        case 'pending':
          return 'Pending'
        case 'approved':
          return 'Approved'
        case 'denied':
          return 'Denied'
        case 'cancelled':
          return 'Cancelled'
        default:
          return status || 'Unknown'
      }
    }

    const getProcessedLabel = (status) => {
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

    const formatDate = (dateString) => {
      if (!dateString) return ''

      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return dateString
      }
    }

    const handleCardClick = () => {
      // Emit view details for potential future detail view
      // For now, just log
      console.log('View request details:', props.request.id)
    }

    return {
      canTakeActions,
      canCancel,
      getUserInitials,
      getStatusVariant,
      getStatusLabel,
      getProcessedLabel,
      formatDate,
      handleCardClick
    }
  }
}
</script>