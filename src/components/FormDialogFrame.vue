<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  subtitle?: string
  loading?: boolean
  submitDisabled?: boolean
  submitText?: string
  cancelText?: string
  submitColor?: string
  submitVariant?: 'flat' | 'elevated' | 'tonal' | 'text' | 'outlined' | 'plain'
}>(), {
  icon: 'mdi-pencil',
  subtitle: '',
  loading: false,
  submitDisabled: false,
  submitText: 'Submit',
  cancelText: 'Cancel',
  submitColor: 'primary',
  submitVariant: 'flat',
});

const emit = defineEmits<{
  (event: 'submit'): void
  (event: 'cancel'): void
  (event: 'close'): void
}>();
</script>

<template>
  <v-card class="app-form-card form-dialog">
    <div class="form-header">
      <div class="form-header__identity">
        <v-icon :icon="icon" color="primary" size="small" />
        <div>
          <h3 class="form-header__title">{{ title }}</h3>
          <p v-if="subtitle" class="form-header__subtitle">{{ subtitle }}</p>
        </div>
        <slot name="header-extra" />
      </div>
      <v-btn icon variant="text" color="secondary" size="small" @click="emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="form-body">
      <slot />
    </div>

    <v-card-actions class="form-footer-sticky">
      <slot name="footer-extra" />
      <v-btn variant="text" color="secondary" :disabled="loading" @click="emit('cancel')">
        {{ cancelText }}
      </v-btn>
      <v-btn :variant="submitVariant" :color="submitColor" :loading="loading" :disabled="submitDisabled || loading"
        @click="emit('submit')">
        {{ submitText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
