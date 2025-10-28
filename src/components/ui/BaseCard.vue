<template>
  <div
    :class="cardClasses"
    @click="clickable ? $emit('click', $event) : null"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  emits: ['click'],
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'glass', 'gradient'].includes(value)
    },
    padding: {
      type: String,
      default: 'md',
      validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: false
    },
    shadow: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    cardClasses() {
      const baseClasses = 'rounded-2xl border'

      const variantClasses = {
        default: 'bg-white/80 backdrop-blur-sm border-white/50',
        glass: 'glass border-white/20',
        gradient: 'bg-gradient-to-r from-white to-slate-50 border-slate-100'
      }

      const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
      }

      const shadowClass = this.shadow ? 'shadow-lg' : ''
      const clickableClass = this.clickable ? 'card-hover cursor-pointer' : ''

      return [
        baseClasses,
        variantClasses[this.variant],
        paddingClasses[this.padding],
        shadowClass,
        clickableClass
      ].join(' ')
    }
  }
}
</script>