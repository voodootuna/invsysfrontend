<template>
  <div class="grid grid-cols-2 gap-4">
    <!-- Assign Equipment Action -->
    <router-link
      to="/assign"
      class="gradient-primary text-white rounded-2xl p-4 shadow-lg card-hover block"
    >
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <div class="text-left">
          <div class="font-semibold">Assign</div>
          <div class="text-xs opacity-80">Equipment</div>
        </div>
      </div>
    </router-link>

    <!-- Movements History Action -->
    <router-link
      to="/movements"
      class="bg-white text-dark rounded-2xl p-4 shadow-lg border border-slate-200 card-hover block"
    >
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
        </div>
        <div class="text-left">
          <div class="font-semibold">Movements</div>
          <div class="text-xs text-slate-500">History & Reports</div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'QuickActionGrid'
}
</script>