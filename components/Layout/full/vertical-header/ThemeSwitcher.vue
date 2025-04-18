<script setup lang="ts">
import { useTheme } from 'vuetify'
import { ref, watch } from 'vue'

const theme = useTheme()
const currentTheme = ref(typeof localStorage !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light')

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
    <v-btn @click="toggleTheme" color="primary" dark>
        <v-icon left>{{ theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
    </v-btn>
</template>
