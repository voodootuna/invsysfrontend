<template>
  <AppLayout
    header-title="Add New Equipment"
    :show-back-button="true"
    :navigation-items="navigationItems"
    @back-click="$router.push('/equipment')"
    @logout-click="handleLogout"
  >
    <!-- Create Form -->
    <div class="px-6 py-6 pb-32">
      <form @submit.prevent="createEquipment" class="space-y-6">

        <!-- Create Header with Photo Upload -->
        <BaseCard variant="default" padding="lg">
          <div class="flex items-start space-x-6 mb-6">
            <!-- Equipment Photo Upload/Preview -->
            <div class="w-24 h-24 rounded-2xl overflow-hidden shadow-lg bg-white flex-shrink-0">
              <!-- File Input (Hidden) -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />

              <!-- Photo Preview -->
              <div v-if="photoPreview" class="relative w-full h-full">
                <img
                  :src="photoPreview"
                  alt="Equipment preview"
                  class="w-full h-full object-cover"
                >
                <button
                  type="button"
                  @click="removePhoto"
                  class="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors w-5 h-5 flex items-center justify-center"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Photo Upload Zone -->
              <div
                v-else
                @click="$refs.fileInput.click()"
                class="w-full h-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors"
                @dragover.prevent
                @drop.prevent="handleFileDrop"
              >
                <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
            </div>

            <!-- Create Status and Photo Actions -->
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <BaseBadge variant="primary" size="sm">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Creating New Equipment
                </BaseBadge>
              </div>
              <p class="text-xs text-slate-500 mb-3">Fill in the details to add new equipment to inventory</p>

              <!-- Photo Upload Button -->
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
              >
                {{ photoPreview ? 'Change Photo' : 'Upload Photo' }}
              </button>

              <p v-if="errors.photo" class="text-xs text-red-500 mt-1">{{ errors.photo }}</p>
            </div>
          </div>
        </BaseCard>

        <!-- Basic Information -->
        <BaseCard variant="default" padding="lg">
          <h3 class="text-lg font-bold text-dark mb-4">Basic Information</h3>

          <div class="space-y-4">
            <!-- Equipment Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Equipment Name *</label>
              <BaseInput
                v-model="form.name"
                placeholder="Enter equipment name"
                :error="errors.name"
                required
              />
            </div>

            <!-- Serial Number & Type -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Serial Number</label>
                <BaseInput
                  v-model="form.serial_number"
                  placeholder="Enter serial number"
                  :error="errors.serial_number"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Equipment Type *</label>
                <BaseInput
                  v-model="form.type"
                  placeholder="Enter equipment type"
                  :error="errors.type"
                  required
                />
              </div>
            </div>

            <!-- Purchase Date -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Purchase Date</label>
              <BaseInput
                v-model="form.purchase_date"
                type="date"
                :error="errors.purchase_date"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm text-dark resize-none"
                placeholder="Additional notes about this equipment..."
                :class="{ 'border-red-500': errors.notes }"
              ></textarea>
              <p v-if="errors.notes" class="text-xs text-red-500 mt-1">{{ errors.notes }}</p>
            </div>
          </div>
        </BaseCard>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <BaseButton
            variant="primary"
            size="lg"
            full-width
            type="submit"
            :disabled="!canCreate || createLoading"
          >
            <svg v-if="createLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ createLoading ? 'Creating Equipment...' : 'Create Equipment' }}
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="lg"
            full-width
            type="button"
            @click="$router.push('/equipment')"
            :disabled="createLoading"
          >
            Cancel
          </BaseButton>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/apiService'
import apiClient from '../services/apiService'
import { useDashboardStore } from '../stores/dashboardStore'
import { useErrorStore } from '../stores/errorStore'

import AppLayout from '../components/layout/AppLayout.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'

// Icons
import DashboardIcon from '../components/icons/DashboardIcon.vue'
import InventoryIcon from '../components/icons/InventoryIcon.vue'
import RequestIcon from '../components/icons/RequestIcon.vue'
import UsersIcon from '../components/icons/UsersIcon.vue'

export default {
  name: 'EquipmentCreateView',
  components: {
    AppLayout,
    BaseCard,
    BaseInput,
    BaseBadge,
    BaseButton,
    DashboardIcon,
    InventoryIcon,
    RequestIcon,
    UsersIcon
  },
  setup() {
    const router = useRouter()
    const dashboardStore = useDashboardStore()
    const errorStore = useErrorStore()

    const createLoading = ref(false)

    const form = ref({
      name: '',
      serial_number: '',
      type: '',
      purchase_date: '',
      notes: ''
    })

    const errors = ref({})

    // Photo upload related
    const photoPreview = ref(null)
    const selectedPhoto = ref(null)

    const validateForm = () => {
      errors.value = {}

      if (!form.value.name.trim()) {
        errors.value.name = 'Equipment name is required'
      }

      if (!form.value.type.trim()) {
        errors.value.type = 'Equipment type is required'
      }

      return Object.keys(errors.value).length === 0
    }

    const canCreate = computed(() => {
      return form.value.name.trim() && form.value.type.trim()
    })

    // Photo handling functions
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        processPhoto(file)
      }
    }

    const handleFileDrop = (event) => {
      const file = event.dataTransfer.files[0]
      if (file) {
        processPhoto(file)
      }
    }

    const processPhoto = (file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.value.photo = 'Please select a valid image file'
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        errors.value.photo = 'Photo size must be less than 10MB'
        return
      }

      selectedPhoto.value = file
      errors.value.photo = null

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        photoPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    const removePhoto = () => {
      photoPreview.value = null
      selectedPhoto.value = null
      errors.value.photo = null
      // Clear file input
      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = ''
      }
    }

    const createEquipment = async () => {
      if (!validateForm()) {
        return
      }

      createLoading.value = true
      errors.value = {}

      try {
        // Create FormData for photo upload
        const formData = new FormData()
        formData.append('name', form.value.name.trim())
        formData.append('type', form.value.type.trim())

        if (form.value.serial_number.trim()) {
          formData.append('serial_number', form.value.serial_number.trim())
        }
        if (form.value.purchase_date) {
          formData.append('purchase_date', form.value.purchase_date)
        }
        if (form.value.notes.trim()) {
          formData.append('notes', form.value.notes.trim())
        }
        if (selectedPhoto.value) {
          formData.append('photo', selectedPhoto.value)
        }

        const response = await apiClient.post('/equipment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // Show success message with auto-close
        errorStore.showSuccess('Equipment created successfully', {
          autoClose: 3000 // Auto-close after 3 seconds
        })

        // Redirect to the newly created equipment detail view
        router.push(`/equipment/${response.data.id}`)

      } catch (err) {
        // Handle validation errors
        if (err.response?.status === 422) {
          errors.value = err.response.data.errors || {}
          // Also show global error for validation issues
          errorStore.showApiError(err, {
            title: 'Validation Error',
            showRetry: false,
            autoClose: 5000 // Auto-close after 5 seconds
          })
        } else {
          errorStore.showApiError(err, {
            title: 'Failed to Create Equipment',
            showRetry: true,
            autoClose: 8000 // Auto-close after 8 seconds (longer for errors with retry)
          })
        }
        console.error('Failed to create equipment:', err)
      } finally {
        createLoading.value = false
      }
    }

    const navigationItems = computed(() => [
      {
        name: 'dashboard',
        to: '/',
        label: 'Dashboard',
        icon: DashboardIcon,
        badge: 0
      },
      {
        name: 'equipment',
        to: '/equipment',
        label: 'Inventory',
        icon: InventoryIcon,
        badge: 0
      },
      {
        name: 'requests',
        to: '/requests',
        label: 'Requests',
        icon: RequestIcon,
        badge: dashboardStore?.pendingRequestsCount || 0
      },
      {
        name: 'users',
        to: '/users',
        label: 'Users',
        icon: UsersIcon,
        badge: 0
      }
    ])

    return {
      createLoading,
      form,
      errors,
      navigationItems,
      canCreate,
      createEquipment,
      photoPreview,
      selectedPhoto,
      handleFileSelect,
      handleFileDrop,
      removePhoto
    }
  },
  methods: {
    async handleLogout() {
      try {
        await authService.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        this.$router.push('/login')
      }
    }
  }
}
</script>