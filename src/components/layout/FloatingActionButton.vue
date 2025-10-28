<template>
  <button
    :class="buttonClasses"
    @click="$emit('click')"
    :aria-label="ariaLabel"
  >
    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
    </svg>
  </button>
</template>

<script>
export default {
  name: 'FloatingActionButton',
  emits: ['click'],
  props: {
    icon: {
      type: String,
      default: 'PlusIcon'
    },
    position: {
      type: String,
      default: 'bottom-right',
      validator: (value) => ['bottom-right', 'bottom-left', 'bottom-center'].includes(value)
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    ariaLabel: {
      type: String,
      default: 'Add new item'
    }
  },
  computed: {
    buttonClasses() {
      const baseClasses = 'fixed rounded-2xl shadow-2xl flex items-center justify-center z-30 card-hover transition-transform hover:scale-105'

      const positionClasses = {
        'bottom-right': 'bottom-32 right-6',
        'bottom-left': 'bottom-32 left-6',
        'bottom-center': 'bottom-32 left-1/2 transform -translate-x-1/2'
      }

      const variantClasses = {
        primary: 'gradient-primary',
        accent: 'gradient-accent'
      }

      const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-16 h-16'
      }

      return [
        baseClasses,
        positionClasses[this.position],
        variantClasses[this.variant],
        sizeClasses[this.size]
      ].join(' ')
    }
  }
}
</script>