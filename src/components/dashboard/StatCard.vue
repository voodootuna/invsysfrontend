<template>
  <BaseCard variant="default" padding="md">
    <div class="flex flex-col items-center text-center">
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md"
        :class="iconClasses"
      >
        <!-- Available Icon (Check) -->
        <svg v-if="iconType === 'check'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <!-- Assigned Icon (Box) -->
        <svg v-else-if="iconType === 'box'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <!-- Pending Icon (Clock) -->
        <svg v-else-if="iconType === 'clock'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div class="text-2xl font-bold text-dark mb-1">{{ value }}</div>
      <div class="text-xs text-slate-500 font-medium">{{ label }}</div>
    </div>
  </BaseCard>
</template>

<script>
import BaseCard from '../ui/BaseCard.vue'

export default {
  name: 'StatCard',
  components: {
    BaseCard
  },
  props: {
    iconType: {
      type: String,
      required: true,
      validator: (value) => ['check', 'box', 'clock'].includes(value)
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent', 'warning'].includes(value)
    }
  },
  computed: {
    iconClasses() {
      const variants = {
        primary: 'gradient-primary',
        accent: 'gradient-accent',
        warning: 'gradient-warning'
      }
      return variants[this.variant]
    }
  }
}
</script>