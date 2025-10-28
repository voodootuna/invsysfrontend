<template>
  <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
    <!-- Mobile pagination -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage <= 1"
        class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage >= lastPage"
        class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>

    <!-- Desktop pagination -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-700">
          Showing <span class="font-medium">{{ from }}</span> to <span class="font-medium">{{ to }}</span> of
          <span class="font-medium">{{ total }}</span> results
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <!-- Previous button -->
          <button
            @click="$emit('page-change', currentPage - 1)"
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Page numbers -->
          <button
            v-for="page in displayPages"
            :key="page"
            @click="$emit('page-change', page)"
            :class="[
              page === currentPage
                ? 'relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-20'
                : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20'
            ]"
          >
            {{ page }}
          </button>

          <!-- Next button -->
          <button
            @click="$emit('page-change', currentPage + 1)"
            :disabled="currentPage >= lastPage"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BasePagination',
  props: {
    currentPage: { type: Number, required: true },
    lastPage: { type: Number, required: true },
    total: { type: Number, required: true },
    from: { type: Number, required: true },
    to: { type: Number, required: true }
  },
  emits: ['page-change'],
  setup(props) {
    const displayPages = computed(() => {
      const pages = []
      const start = Math.max(1, props.currentPage - 2)
      const end = Math.min(props.lastPage, props.currentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    })

    return { displayPages }
  }
}
</script>