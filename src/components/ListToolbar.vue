<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string;
  searchLabel: string;
  loading?: boolean;
}>(), {
  loading: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'search'): void;
  (event: 'clear'): void;
}>();
</script>

<template>
  <v-card class="filter-bar">
    <v-row class="align-center">
      <v-col cols="12" md="4">
        <v-text-field
          :model-value="props.modelValue"
          :label="props.searchLabel"
          prepend-inner-icon="mdi-magnify"
          clearable
          single-line
          hide-details
          density="compact"
          variant="outlined"
          :loading="props.loading"
          class="rounded-lg"
          @update:model-value="emit('update:modelValue', String($event || ''))"
          @keyup.enter="emit('search')"
          @click:prepend-inner="emit('search')"
          @click:clear="emit('clear')"
        />
      </v-col>
      <slot />
    </v-row>
  </v-card>
</template>
