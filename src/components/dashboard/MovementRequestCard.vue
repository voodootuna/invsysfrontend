<template>
  <BaseCard
    :variant="cardVariant"
    padding="sm"
    class="shadow-sm"
  >
    <div class="flex items-center space-x-3 mb-3">
      <!-- Equipment Image -->
      <div class="w-16 h-16 rounded-xl overflow-hidden shadow-md bg-white p-1 flex-shrink-0">
        <img
          v-if="request.equipment.photo_url"
          :src="request.equipment.photo_url"
          :alt="request.equipment.name"
          class="w-full h-full object-cover rounded-lg"
        >
        <div v-else class="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
      </div>

      <!-- Request Details -->
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-dark text-sm">{{ request.equipment.name }}</h3>
        <p class="text-xs text-slate-500 mb-1">
          {{ fromLocation }} → {{ toLocation }}
        </p>
        <BaseBadge :variant="badgeVariant" size="sm">
          {{ request.movement_type || 'Request' }}
        </BaseBadge>
      </div>
    </div>

    <!-- Action Buttons (Admin Only) -->
    <div v-if="showActions" class="grid grid-cols-3 gap-1">
      <BaseButton
        variant="accent"
        size="sm"
        @click="$emit('approve', request)"
      >
        Approve
      </BaseButton>
      <BaseButton
        variant="outline"
        size="sm"
        @click="$emit('override', request)"
      >
        Override
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        @click="$emit('deny', request)"
      >
        Deny
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script>
import BaseCard from '../ui/BaseCard.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'

export default {
  name: 'MovementRequestCard',
  components: {
    BaseCard,
    BaseButton,
    BaseBadge
  },
  emits: ['approve', 'deny', 'override'],
  props: {
    request: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    cardVariant() {
      // Different background based on request type
      const typeVariants = {
        'transfer': 'default',
        'return': 'gradient',
        'assignment': 'default'
      }
      return typeVariants[this.request.movement_type] || 'default'
    },
    badgeVariant() {
      const typeVariants = {
        'transfer': 'primary',
        'return': 'warning',
        'assignment': 'accent'
      }
      return typeVariants[this.request.movement_type] || 'primary'
    },
    fromLocation() {
      if (this.request.from_user) {
        return `${this.request.from_user.name} @ ${this.request.from_location.name}`
      }
      return this.request.from_location?.name || 'Warehouse'
    },
    toLocation() {
      if (this.request.to_user) {
        return `${this.request.to_user.name} @ ${this.request.to_location.name}`
      }
      return this.request.to_location?.name || 'Warehouse'
    }
  }
}
</script>