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
        <h1>Welcome to GGAS Stock Frontend</h1>
        <p>This is the homepage of your application.</p>
    </div>
</template>
