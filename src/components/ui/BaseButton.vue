<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  emits: ['click'],
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'accent', 'secondary', 'outline', 'success', 'danger', 'warning'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClasses() {
      const baseClasses = 'font-medium rounded-2xl shadow-lg card-hover transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'

      const variantClasses = {
        primary: 'gradient-primary text-white focus:ring-primary',
        accent: 'gradient-accent text-white focus:ring-accent',
        secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-400 focus:ring-slate-400',
        outline: 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 focus:ring-primary',
        success: 'bg-gradient-to-r from-accent to-accent-light text-white focus:ring-accent',
        danger: 'bg-gradient-to-r from-danger to-red-400 text-white focus:ring-danger',
        warning: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white focus:ring-orange-500'
      }

      const sizeClasses = {
        sm: 'py-1.5 px-3 text-xs',
        md: 'py-2 px-4 text-sm',
        lg: 'py-3 px-6 text-base'
      }

      const widthClass = this.fullWidth ? 'w-full' : ''

      const disabledClass = this.disabled ? 'opacity-50 cursor-not-allowed' : ''

      return [
        baseClasses,
        variantClasses[this.variant],
        sizeClasses[this.size],
        widthClass,
        disabledClass
      ].join(' ')
    }
  }
}
</script>