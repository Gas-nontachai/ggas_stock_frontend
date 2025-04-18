<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDarkTheme = computed(() => theme.global.current.value.dark)
const drawerColor = computed(() => isDarkTheme.value ? 'grey-darken-4' : 'grey-lighten-4')
const appBarColor = computed(() => isDarkTheme.value ? 'grey-darken-3' : 'grey-lighten-3')
const iconTextColor = computed(() => isDarkTheme.value ? 'white' : 'black')

const { t } = useI18n();
const drawer = ref(true);
const route = useRoute();

const navbar_items = computed(() => [
    { text: t('s_drawer.home'), href: "/", icon: "mdi-home" },
    { text: t('s_drawer.item'), href: "/item", icon: "mdi-gamepad-variant" },
    { text: t('s_drawer.income'), href: "/income", icon: "mdi-cash" },
    { text: t('s_drawer.expense'), href: "/expense", icon: "mdi-cash-minus" },
    { text: t('s_drawer.category'), href: "/category", icon: "mdi-folder" },
    { text: t('s_drawer.platform'), href: "/platform", icon: "mdi-desktop-classic" },
    { text: t('s_drawer.user'), href: "/user", icon: "mdi-account" },
]);

const isActive = (href: string) => route.path === href;

const fullText = "GGAS Stock ";
</script>


<template>
    <v-app-bar app fixed elevation="4" density="comfortable" :color="appBarColor">
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-row align="center" style="width: 100%;" justify="space-between" class="px-8">
            <v-responsive class="d-flex align-center">
                <span class="text-center text-h6 font-weight-bold">
                    {{ fullText }}
                </span>
            </v-responsive>
            <div class="d-flex align-center">
                <LayoutFullVerticalHeaderLanguageSwitcher />
                <LayoutFullVerticalHeaderThemeSwitcher />
                <LayoutFullVerticalHeaderProfileDD />
            </div>
        </v-row>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app :color="drawerColor" :dark="isDarkTheme">
        <v-list>
            <div class="d-flex justify-center my-4">
                <img src="/logo.jpg" alt="logo" width="90" height="90" />
            </div>

            <v-divider :thickness="3" class="border-opacity-50 mx-2 my-2"></v-divider>

            <RouterLink v-for="(item, index) in navbar_items" :key="index" :to="item.href"
                class="router-link text-decoration-none cursor-pointer">
                <v-list-item :class="{ 'bg-blue-lighten-2 text-white': isActive(item.href) }">
                    <template #prepend>
                        <v-icon :style="{ color: iconTextColor }">{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title :style="{ color: iconTextColor }">{{ item.text }}</v-list-item-title>
                </v-list-item>
            </RouterLink>
        </v-list>
    </v-navigation-drawer>
</template>