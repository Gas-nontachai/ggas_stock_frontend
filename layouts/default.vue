<script setup lang="ts">
import Main from '~/layout/full/Main.vue';
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
      <Main />
      <v-main>
        <v-container fluid class="pa-0">
          <NuxtPage />
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>