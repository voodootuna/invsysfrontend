<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <!-- Spinner -->
    <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <svg class="w-6 h-6 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    </div>

    <h3 class="text-sm font-medium text-slate-600 mb-1">
      {{ title || 'Loading...' }}
    </h3>

    <p v-if="message" class="text-xs text-slate-500">
      {{ message }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>