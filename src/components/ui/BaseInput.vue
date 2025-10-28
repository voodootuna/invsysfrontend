<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-dark">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Icon slot -->
      <div v-if="$slots.icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="icon" />
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="text-sm text-danger">
      {{ error }}
    </p>

    <!-- Help text -->
    <p v-if="help && !error" class="text-sm text-slate-500">
      {{ help }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  emits: ['update:modelValue', 'blur', 'focus'],
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    help: {
      type: String,
      default: ''
    }
  },
  computed: {
    inputId() {
      return `input-${Math.random().toString(36).substring(2, 11)}`
    },
    inputClasses() {
      const baseClasses = 'block w-full rounded-2xl border-0 py-3 px-4 text-dark shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset transition-colors'
      const normalClasses = 'bg-white ring-slate-300 placeholder:text-slate-400 focus:ring-primary'
      const errorClasses = 'bg-red-50 ring-red-300 placeholder:text-red-400 focus:ring-red-500'
      const disabledClasses = 'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200'
      const iconClasses = this.$slots.icon ? 'pl-10' : ''

      return [
        baseClasses,
        this.error ? errorClasses : normalClasses,
        disabledClasses,
        iconClasses
      ].join(' ')
    }
  }
}
</script>