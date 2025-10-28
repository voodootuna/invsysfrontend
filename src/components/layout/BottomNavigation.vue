<template>
  <nav class="fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50">
    <div class="grid grid-cols-4 py-3">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center py-2 px-4 transition-all rounded-xl mx-1 relative"
        :class="isActive(item) ? activeClasses : inactiveClasses"
      >
        <div
          class="w-10 h-10 rounded-2xl flex items-center justify-center mb-1 transition-colors relative"
          :class="isActive(item) ? activeIconClasses : inactiveIconClasses"
        >
          <component :is="item.icon" class="w-5 h-5" />

          <!-- Badge for notifications -->
          <span
            v-if="item.badge && item.badge > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {{ item.badge > 9 ? '9+' : item.badge }}
          </span>
        </div>
        <span class="text-xs font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script>
import DashboardIcon from '../icons/DashboardIcon.vue'
import InventoryIcon from '../icons/InventoryIcon.vue'
import RequestIcon from '../icons/RequestIcon.vue'
import UsersIcon from '../icons/UsersIcon.vue'

export default {
  name: 'BottomNavigation',
  components: {
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  props: {
    navItems: {
      type: Array,
      required: true
    }
  },
  computed: {
    activeClasses() {
      return 'text-primary hover:bg-primary/5'
    },
    inactiveClasses() {
      return 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-600'
    },
    activeIconClasses() {
      return 'bg-primary/10'
    },
    inactiveIconClasses() {
      return 'hover:bg-slate-100'
    }
  },
  methods: {
    isActive(item) {
      return this.$route.path === item.to || this.$route.name === item.name
    }
  }
}
</script>