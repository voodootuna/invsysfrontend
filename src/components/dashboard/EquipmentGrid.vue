<template>
  <div class="grid grid-cols-2 gap-3">
    <div
      v-for="equipment in equipmentList"
      :key="equipment.id"
      class="relative rounded-2xl overflow-hidden shadow-md border border-slate-100 card-hover"
      @click="$emit('equipment-click', equipment)"
    >
      <!-- Equipment Image -->
      <div class="aspect-square w-full">
        <img
          v-if="equipment.photo_url"
          :src="equipment.photo_url"
          :alt="equipment.name"
          class="w-full h-full object-cover"
        >
        <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      <!-- Equipment Info & Actions -->
      <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 class="font-bold text-sm mb-1">{{ equipment.name }}</h3>
        <p class="text-xs opacity-80 mb-2">{{ equipment.location || 'Warehouse' }}</p>
        <BaseButton
          variant="primary"
          size="sm"
          full-width
          @click.stop="$emit('assign-click', equipment)"
        >
          Assign
        </BaseButton>
      </div>

      <!-- Status Badge -->
      <div class="absolute top-2 right-2">
        <BaseBadge :variant="getStatusVariant(equipment.current_status?.status)" size="sm">
          {{ equipment.current_status?.status || 'Available' }}
        </BaseBadge>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="equipmentList.length === 0"
      class="col-span-2 py-12 text-center"
    >
      <svg class="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <p class="text-slate-500 text-sm">No equipment available</p>
    </div>
  </div>
</template>

<script>
import BaseButton from '../ui/BaseButton.vue'
import BaseBadge from '../ui/BaseBadge.vue'

export default {
  name: 'EquipmentGrid',
  components: {
    BaseButton,
    BaseBadge
  },
  emits: ['equipment-click', 'assign-click'],
  props: {
    equipmentList: {
      type: Array,
      default: () => []
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    getStatusVariant(status) {
      const variants = {
        'available': 'accent',
        'assigned': 'primary',
        'maintenance': 'warning',
        'repair': 'danger'
      }
      return variants[status] || 'accent'
    }
  }
}
</script>