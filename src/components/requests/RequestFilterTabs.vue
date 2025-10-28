<template>
  <div class="flex items-center space-x-2 overflow-x-auto">
    <!-- All Requests Tab -->
    <button
      @click="$emit('filter-change', 'all')"
      :class="[
        'px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all',
        activeFilter === 'all'
          ? 'bg-primary text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      ]"
    >
      All Requests ({{ counts.all }})
    </button>

    <!-- Transfers Tab -->
    <button
      @click="$emit('filter-change', 'transfers')"
      :class="[
        'px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all',
        activeFilter === 'transfers'
          ? 'bg-primary text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      ]"
    >
      Transfers ({{ counts.transfers }})
    </button>

    <!-- Returns Tab -->
    <button
      @click="$emit('filter-change', 'returns')"
      :class="[
        'px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all',
        activeFilter === 'returns'
          ? 'bg-primary text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      ]"
    >
      Returns ({{ counts.returns }})
    </button>

    <!-- Assignments Tab -->
    <button
      @click="$emit('filter-change', 'assignments')"
      :class="[
        'px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all',
        activeFilter === 'assignments'
          ? 'bg-primary text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      ]"
    >
      Assignments ({{ counts.assignments }})
    </button>
  </div>
</template>

<script>
export default {
  name: 'RequestFilterTabs',
  props: {
    activeFilter: {
      type: String,
      required: true
    },
    counts: {
      type: Object,
      required: true
    }
  },
  emits: ['filter-change']
}
</script>