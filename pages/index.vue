<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
    if (!useCookie('Authorization').value) {
        window.location.href = "/auth/login";
    }
}); 
</script>

<template>
    <div>
        <h1>Dashboard</h1>
    </div>
</template>
