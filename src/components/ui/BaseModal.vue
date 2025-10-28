<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          @click="closeOnOverlay && handleClose"
        ></div>

        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            :class="modalClasses"
            @click.stop
          >
            <!-- Header -->
            <div v-if="$slots.header || title" class="flex items-center justify-between p-6 border-b border-slate-200">
              <slot name="header">
                <h3 class="text-lg font-semibold text-dark">{{ title }}</h3>
              </slot>

              <button
                v-if="showClose"
                @click="handleClose"
                class="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="p-6">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'BaseModal',
  emits: ['close', 'update:modelValue'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isVisible() {
      return this.modelValue !== undefined ? this.modelValue : this.show
    },
    modalClasses() {
      const baseClasses = 'relative bg-white rounded-3xl shadow-2xl transform transition-all'

      const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
      }

      return [
        baseClasses,
        sizeClasses[this.size],
        'w-full'
      ].join(' ')
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
      this.$emit('update:modelValue', false)
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>