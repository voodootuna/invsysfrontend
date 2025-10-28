<template>
  <div class="flex space-x-2 overflow-x-auto scrollbar-hide">
    <!-- All Tab -->
    <button
      @click="$emit('filter-change', 'all')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
        activeFilter === 'all'
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      ]"
    >
      <span>All</span>
      <BaseBadge
        :variant="activeFilter === 'all' ? 'light' : 'light-outline'"
        size="xs"
      >
        {{ counts.all }}
      </BaseBadge>
    </button>

    <!-- Pending Tab -->
    <button
      @click="$emit('filter-change', 'pending')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
        activeFilter === 'pending'
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      ]"
    >
      <span>Pending</span>
      <BaseBadge
        :variant="activeFilter === 'pending' ? 'light' : 'light-outline'"
        size="xs"
      >
        {{ counts.pending }}
      </BaseBadge>
    </button>

    <!-- Approved Tab -->
    <button
      @click="$emit('filter-change', 'approved')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
        activeFilter === 'approved'
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      ]"
    >
      <span>Approved</span>
      <BaseBadge
        :variant="activeFilter === 'approved' ? 'light' : 'light-outline'"
        size="xs"
      >
        {{ counts.approved }}
      </BaseBadge>
    </button>

    <!-- Denied Tab -->
    <button
      @click="$emit('filter-change', 'denied')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
        activeFilter === 'denied'
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      ]"
    >
      <span>Denied</span>
      <BaseBadge
        :variant="activeFilter === 'denied' ? 'light' : 'light-outline'"
        size="xs"
      >
        {{ counts.denied }}
      </BaseBadge>
    </button>

    <!-- Cancelled Tab -->
    <button
      @click="$emit('filter-change', 'cancelled')"
      :class="[
        'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all',
        activeFilter === 'cancelled'
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      ]"
    >
      <span>Cancelled</span>
      <BaseBadge
        :variant="activeFilter === 'cancelled' ? 'light' : 'light-outline'"
        size="xs"
      >
        {{ counts.cancelled || 0 }}
      </BaseBadge>
    </button>
  </div>
</template>

<script>
import BaseBadge from '../ui/BaseBadge.vue'

export default {
  name: 'FilterTabs',
  components: {
    BaseBadge
  },
  props: {
    activeFilter: {
      type: String,
      required: true
    },
    counts: {
      type: Object,
      required: true
    }
  },
  emits: ['filter-change']
}
</script>