<script setup lang="ts">
const { state } = useAppSnackbar();
</script>

<template>
  <v-snackbar
    v-model="state.show"
    :timeout="state.timeout"
    location="top right"
    class="app-snackbar"
  >
    <v-alert
      :type="state.type"
      variant="tonal"
      density="comfortable"
      class="app-snackbar__alert"
    >
      {{ state.text }}
    </v-alert>
  </v-snackbar>
</template>
