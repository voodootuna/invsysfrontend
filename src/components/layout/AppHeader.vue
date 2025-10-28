<template>
  <header class="glass border-b border-white/20">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Back Button & Title or Profile Section -->
        <div class="flex items-center space-x-4">
          <!-- Back Button (when showBackButton is true) -->
          <button
            v-if="showBackButton"
            @click="$emit('back-click')"
            class="p-2 bg-white/80 rounded-xl shadow-sm hover:bg-white transition-colors"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Profile Avatar (when no back button) -->
          <div v-if="!showBackButton" class="relative">
            <div class="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-lg font-bold text-white">{{ userInitials }}</span>
            </div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-white"></div>
          </div>

          <!-- Title -->
          <div>
            <h1 class="text-lg font-bold text-dark">{{ title }}</h1>
            <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-3">
          <!-- Logout Button -->
          <button
            class="p-3 bg-white/80 rounded-2xl shadow-sm hover:bg-white transition-colors"
            @click="$emit('logout-click')"
            title="Logout"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  emits: ['logout-click', 'back-click'],
  props: {
    title: {
      type: String,
      default: 'Dashboard'
    },
    subtitle: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: 'Admin User'
    },
    showMenu: {
      type: Boolean,
      default: false
    },
    showBackButton: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userInitials() {
      return this.userName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }
  }
}
</script>