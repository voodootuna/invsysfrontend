<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script>
export default {
  name: 'BaseBadge',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent', 'warning', 'danger', 'secondary', 'success', 'light', 'light-outline'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
    }
  },
  computed: {
    badgeClasses() {
      const baseClasses = 'inline-flex items-center font-bold rounded-full'

      const variantClasses = {
        primary: 'bg-primary text-white',
        accent: 'bg-accent text-white',
        warning: 'bg-warning text-white',
        danger: 'bg-danger text-white',
        secondary: 'bg-slate-100 text-slate-600',
        success: 'bg-accent text-white',
        light: 'bg-white/20 text-white',
        'light-outline': 'border border-white/30 text-white/70'
      }

      const sizeClasses = {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm'
      }

      return [
        baseClasses,
        variantClasses[this.variant],
        sizeClasses[this.size]
      ].join(' ')
    }
  }
}
</script>