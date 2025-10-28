<template>
  <div class="relative">
    <!-- Search Input -->
    <div class="relative">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm text-dark pr-10"
        :class="{ 'border-red-500': error }"
        @input="handleInput"
        @focus="showDropdown = true"
        @keydown.escape="closeDropdown"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectHighlighted"
      />

      <!-- Search Icon -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg v-if="!searching" class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <svg v-else class="w-4 h-4 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>

    <!-- Dropdown Results -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showDropdown && (searchResults.length > 0 || showCreateOption)"
        class="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto"
      >
        <!-- Existing Locations -->
        <button
          v-for="(location, index) in searchResults"
          :key="location.id"
          type="button"
          @click="selectLocation(location)"
          class="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
          :class="{ 'bg-primary/5': highlightedIndex === index }"
        >
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-slate-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="font-medium text-dark text-sm">{{ location.name }}</span>
            </div>
            <div class="flex items-center space-x-2 mt-1">
              <BaseBadge :variant="getLocationTypeVariant(location.type)" size="sm">
                {{ getLocationTypeLabel(location.type) }}
              </BaseBadge>
              <span v-if="location.address" class="text-xs text-slate-400">{{ location.address }}</span>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-300 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- No Results Message -->
        <div v-if="searchResults.length === 0 && searchQuery && !searching" class="px-4 py-3 text-center text-slate-500 text-sm">
          No locations found for "{{ searchQuery }}"
        </div>

        <!-- Create New Location Button -->
        <button
          v-if="showCreateOption"
          type="button"
          @click="openCreateModal"
          class="w-full px-4 py-3 text-left bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-colors flex items-center space-x-3 border-t border-slate-100"
          :class="{ 'bg-primary/10': highlightedIndex === searchResults.length }"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <div class="flex-1">
            <span class="font-semibold text-dark text-sm">Create new location</span>
            <p class="text-xs text-slate-500 mt-0.5">Add "{{ searchQuery }}" to locations</p>
          </div>
        </button>
      </div>
    </Transition>

    <!-- Create Location Modal -->
    <BaseModal
      :show="showCreateModal"
      title="Create New Location"
      @close="closeCreateModal"
    >
      <form @submit.prevent="createLocation" class="space-y-4">
        <!-- Location Name -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>
          <BaseInput
            v-model="newLocation.name"
            placeholder="Enter location name"
            :error="createErrors.name"
            required
          />
        </div>

        <!-- Location Type -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Location Type *</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="locationType in locationTypes"
              :key="locationType.value"
              type="button"
              @click="newLocation.type = locationType.value"
              class="px-3 py-2 text-sm font-medium rounded-xl border-2 transition-all"
              :class="newLocation.type === locationType.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'"
            >
              {{ locationType.label }}
            </button>
          </div>
          <p v-if="createErrors.type" class="text-xs text-red-500 mt-1">{{ createErrors.type }}</p>
        </div>

        <!-- Address (Optional) -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Address (Optional)</label>
          <textarea
            v-model="newLocation.address"
            rows="2"
            class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm text-dark resize-none"
            placeholder="Enter full address"
            :class="{ 'border-red-500': createErrors.address }"
          ></textarea>
          <p v-if="createErrors.address" class="text-xs text-red-500 mt-1">{{ createErrors.address }}</p>
        </div>
      </form>

      <template #footer>
        <BaseButton variant="secondary" @click="closeCreateModal" :disabled="creating">
          Cancel
        </BaseButton>
        <BaseButton variant="primary" @click="createLocation" :disabled="!canCreate || creating">
          <svg v-if="creating" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ creating ? 'Creating...' : 'Create Location' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import apiClient from '../../services/apiService'
import { useErrorStore } from '../../stores/errorStore'
import BaseInput from './BaseInput.vue'
import BaseBadge from './BaseBadge.vue'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

export default {
  name: 'LocationSearchInput',
  components: {
    BaseInput,
    BaseBadge,
    BaseButton,
    BaseModal
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Search or create location...'
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'location-selected', 'location-created'],
  setup(props, { emit }) {
    const errorStore = useErrorStore()
    const searchInput = ref(null)
    const searchQuery = ref('')
    const searchResults = ref([])
    const showDropdown = ref(false)
    const searching = ref(false)
    const showCreateModal = ref(false)
    const creating = ref(false)
    const highlightedIndex = ref(-1)
    let searchTimeout = null

    const newLocation = ref({
      name: '',
      type: 'office',
      address: ''
    })

    const createErrors = ref({})

    const locationTypes = [
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'office', label: 'Office' },
      { value: 'job_site', label: 'Job Site' },
      { value: 'client', label: 'Client' }
    ]

    const showCreateOption = computed(() => {
      return searchQuery.value.trim().length > 0 && !searching.value
    })

    const canCreate = computed(() => {
      return newLocation.value.name.trim() && newLocation.value.type
    })

    const getLocationTypeVariant = (type) => {
      const variants = {
        warehouse: 'accent',
        office: 'primary',
        job_site: 'warning',
        client: 'secondary'
      }
      return variants[type] || 'secondary'
    }

    const getLocationTypeLabel = (type) => {
      const labels = {
        warehouse: 'Warehouse',
        office: 'Office',
        job_site: 'Job Site',
        client: 'Client'
      }
      return labels[type] || type
    }

    const handleInput = () => {
      highlightedIndex.value = -1

      // Debounce search
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        searchLocations()
      }, 300)
    }

    const searchLocations = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        showDropdown.value = false
        return
      }

      searching.value = true
      showDropdown.value = true

      try {
        const response = await apiClient.get('/locations', {
          params: { search: searchQuery.value }
        })
        searchResults.value = response.data || []
      } catch (error) {
        console.error('Failed to search locations:', error)
        searchResults.value = []
      } finally {
        searching.value = false
      }
    }

    const selectLocation = (location) => {
      searchQuery.value = location.name
      emit('update:modelValue', location.id)
      emit('location-selected', location)
      closeDropdown()
    }

    const navigateResults = (direction) => {
      const maxIndex = searchResults.value.length + (showCreateOption.value ? 0 : -1)
      highlightedIndex.value = Math.max(-1, Math.min(maxIndex, highlightedIndex.value + direction))
    }

    const selectHighlighted = () => {
      if (highlightedIndex.value >= 0 && highlightedIndex.value < searchResults.value.length) {
        selectLocation(searchResults.value[highlightedIndex.value])
      } else if (highlightedIndex.value === searchResults.value.length && showCreateOption.value) {
        openCreateModal()
      }
    }

    const closeDropdown = () => {
      showDropdown.value = false
      highlightedIndex.value = -1
    }

    const openCreateModal = () => {
      newLocation.value.name = searchQuery.value
      newLocation.value.type = 'office'
      newLocation.value.address = ''
      createErrors.value = {}
      showCreateModal.value = true
      closeDropdown()
    }

    const closeCreateModal = () => {
      showCreateModal.value = false
      newLocation.value = { name: '', type: 'office', address: '' }
      createErrors.value = {}
    }

    const createLocation = async () => {
      createErrors.value = {}

      if (!newLocation.value.name.trim()) {
        createErrors.value.name = 'Location name is required'
        return
      }

      if (!newLocation.value.type) {
        createErrors.value.type = 'Location type is required'
        return
      }

      creating.value = true

      try {
        const response = await apiClient.post('/locations', {
          name: newLocation.value.name.trim(),
          type: newLocation.value.type,
          address: newLocation.value.address.trim() || null
        })

        const createdLocation = response.data

        errorStore.showSuccess('Location created successfully', { autoClose: 3000 })

        // Select the newly created location
        searchQuery.value = createdLocation.name
        emit('update:modelValue', createdLocation.id)
        emit('location-created', createdLocation)
        emit('location-selected', createdLocation)

        closeCreateModal()
      } catch (err) {
        if (err.response?.status === 422) {
          createErrors.value = err.response.data.errors || {}
        } else {
          errorStore.showApiError(err, {
            title: 'Failed to Create Location',
            autoClose: 5000
          })
        }
        console.error('Failed to create location:', error)
      } finally {
        creating.value = false
      }
    }

    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (searchInput.value && !searchInput.value.contains(event.target)) {
        closeDropdown()
      }
    }

    watch(() => showDropdown.value, (value) => {
      if (value) {
        document.addEventListener('click', handleClickOutside)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    return {
      searchInput,
      searchQuery,
      searchResults,
      showDropdown,
      searching,
      showCreateModal,
      creating,
      highlightedIndex,
      newLocation,
      createErrors,
      locationTypes,
      showCreateOption,
      canCreate,
      getLocationTypeVariant,
      getLocationTypeLabel,
      handleInput,
      selectLocation,
      navigateResults,
      selectHighlighted,
      closeDropdown,
      openCreateModal,
      closeCreateModal,
      createLocation
    }
  }
}
</script>

<style scoped>
/* Ensure dropdown appears above other elements */
.absolute.z-50 {
  z-index: 50;
}
</style>
