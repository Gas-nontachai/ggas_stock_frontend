<script setup lang="ts">
import { useTheme } from 'vuetify'
import { computed, ref, watch } from 'vue'

const theme = useTheme()
const initialTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'
const currentTheme = ref(initialTheme === 'dark' ? 'dark' : 'light')
const themeIcon = computed(() =>
  theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night',
)

theme.global.name.value = currentTheme.value

function toggleTheme() {
    currentTheme.value = theme.global.current.value.dark ? 'light' : 'dark'
    theme.global.name.value = currentTheme.value
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', currentTheme.value)
    }
}

watch(currentTheme, (newTheme) => {
    theme.global.name.value = newTheme
})
</script>

<template>
    <v-btn @click="toggleTheme" variant="text" icon class="header-icon-btn">
        <v-icon>{{ themeIcon }}</v-icon>
    </v-btn>
</template>

<style scoped>
.header-icon-btn {
    color: rgb(var(--v-theme-on-surface));
    opacity: 1;
}
</style>
