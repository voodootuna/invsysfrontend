<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 transform -translate-y-full"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform -translate-y-full"
  >
    <div
      v-if="show"
      class="fixed top-0 left-0 right-0 z-50 mx-4 mt-4"
    >
      <div :class="containerClasses">
        <div :class="topBarClasses"></div>

        <div class="p-4">
          <div class="flex items-start space-x-3">
            <!-- Icon -->
            <div :class="iconContainerClasses">
              <component :is="iconComponent" :class="iconClasses" />
            </div>

            <!-- Error Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-bold text-dark mb-1">{{ title || 'Error Occurred' }}</h3>
              <p class="text-xs text-slate-600 leading-relaxed">{{ message }}</p>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-3 mt-3" v-if="showRetry || showDetails">
                <button
                  v-if="showRetry"
                  @click="$emit('retry')"
                  :class="retryButtonClasses"
                >
                  Try Again
                </button>
                <button
                  v-if="showDetails && details"
                  @click="showDetailsExpanded = !showDetailsExpanded"
                  class="text-xs font-medium text-slate-500 hover:text-slate-600 transition-colors"
                >
                  {{ showDetailsExpanded ? 'Hide Details' : 'Show Details' }}
                </button>
              </div>

              <!-- Expanded Details -->
              <div v-if="showDetailsExpanded && details" class="mt-3 p-3 bg-slate-50 rounded-xl">
                <pre class="text-xs text-slate-600 whitespace-pre-wrap">{{ details }}</pre>
              </div>
            </div>

            <!-- Close Button -->
            <button
              @click="$emit('close')"
              class="flex-shrink-0 p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, watch, computed } from 'vue'
import CheckIcon from '../icons/CheckIcon.vue'
import WarningIcon from '../icons/WarningIcon.vue'
import ErrorIcon from '../icons/ErrorIcon.vue'

export default {
  name: 'ErrorNotification',
  components: {
    CheckIcon,
    WarningIcon,
    ErrorIcon
  },
  emits: ['close', 'retry'],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    showRetry: {
      type: Boolean,
      default: false
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    autoClose: {
      type: Number,
      default: 0 // 0 means no auto close
    },
    type: {
      type: String,
      default: 'error',
      validator: (value) => ['error', 'success', 'warning'].includes(value)
    }
  },
  setup(props, { emit }) {
    const showDetailsExpanded = ref(false)

    // Auto close functionality
    let autoCloseTimer = null

    watch(() => props.show, (newShow) => {
      if (newShow && props.autoClose > 0) {
        // Clear existing timer
        if (autoCloseTimer) {
          clearTimeout(autoCloseTimer)
        }

        // Set new timer
        autoCloseTimer = setTimeout(() => {
          emit('close')
        }, props.autoClose)
      } else if (!newShow && autoCloseTimer) {
        clearTimeout(autoCloseTimer)
        autoCloseTimer = null
      }
    })

    // Reset details when notification is hidden
    watch(() => props.show, (newShow) => {
      if (!newShow) {
        showDetailsExpanded.value = false
      }
    })

    const containerClasses = computed(() => {
      const base = 'bg-white rounded-2xl shadow-2xl overflow-hidden'
      switch (props.type) {
        case 'success':
          return `${base} border border-green-100`
        case 'warning':
          return `${base} border border-amber-100`
        default:
          return `${base} border border-red-100`
      }
    })

    const topBarClasses = computed(() => {
      switch (props.type) {
        case 'success':
          return 'bg-gradient-to-r from-green-500 to-green-600 h-1'
        case 'warning':
          return 'bg-gradient-to-r from-amber-500 to-amber-600 h-1'
        default:
          return 'bg-gradient-to-r from-red-500 to-red-600 h-1'
      }
    })

    const iconContainerClasses = computed(() => {
      const base = 'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center'
      switch (props.type) {
        case 'success':
          return `${base} bg-green-100`
        case 'warning':
          return `${base} bg-amber-100`
        default:
          return `${base} bg-red-100`
      }
    })

    const iconClasses = computed(() => {
      switch (props.type) {
        case 'success':
          return 'w-4 h-4 text-green-600'
        case 'warning':
          return 'w-4 h-4 text-amber-600'
        default:
          return 'w-4 h-4 text-red-600'
      }
    })

    const iconComponent = computed(() => {
      switch (props.type) {
        case 'success':
          return 'CheckIcon'
        case 'warning':
          return 'WarningIcon'
        default:
          return 'ErrorIcon'
      }
    })

    const retryButtonClasses = computed(() => {
      const base = 'text-xs font-medium transition-colors'
      switch (props.type) {
        case 'success':
          return `${base} text-green-600 hover:text-green-700`
        case 'warning':
          return `${base} text-amber-600 hover:text-amber-700`
        default:
          return `${base} text-red-600 hover:text-red-700`
      }
    })

    return {
      showDetailsExpanded,
      containerClasses,
      topBarClasses,
      iconContainerClasses,
      iconClasses,
      iconComponent,
      retryButtonClasses
    }
  }
}
</script>

<style scoped>
/* Ensure the notification appears above everything */
.z-50 {
  z-index: 50;
}
</style>