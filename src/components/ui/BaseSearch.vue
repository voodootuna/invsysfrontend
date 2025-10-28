<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      @input="handleSearch"
      type="text"
      :placeholder="placeholder"
      class="block w-full rounded-xl border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-primary"
    >
    <div class="absolute inset-y-0 left-0 flex items-center pl-3">
      <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'BaseSearch',
  props: {
    placeholder: { type: String, default: 'Search...' },
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const searchQuery = ref(props.modelValue)
    let searchTimeout = null

    const handleSearch = () => {
      // Debounce search to avoid too many API calls
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        emit('update:modelValue', searchQuery.value)
        emit('search', searchQuery.value)
      }, 300)
    }

    watch(() => props.modelValue, (newValue) => {
      searchQuery.value = newValue
    })

    return { searchQuery, handleSearch }
  }
}
</script>