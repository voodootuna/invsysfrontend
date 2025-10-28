<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <RouterView />
  </div>
</template>

<script>
import { RouterView } from 'vue-router'

export default {
  name: 'App',
  components: {
    RouterView
  }
}
</script>