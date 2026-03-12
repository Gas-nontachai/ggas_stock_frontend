<script setup lang="ts">
const title = ref("GGas Stock Management System");

useHead({
  meta: [{ content: title }],
  titleTemplate: () => {
    return "GGas Stock Management System";
  },
}); 
</script>

<template>
  <v-locale-provider>
    <v-app>
      <LayoutFullMain />
      <v-main>
        <v-container fluid class="pa-0">
          <Breadcrumb />
          <NuxtPage />
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>