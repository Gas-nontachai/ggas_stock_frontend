<script setup lang="ts"> 

const title = ref("GGas Stock Management System");

useHead({
  meta: [{ content: title }],
  titleTemplate: () => {
    return "GGas Stock Management System login";
  },
});
</script>
<template>
  <v-app>
    <NuxtPage />
  </v-app>
</template>