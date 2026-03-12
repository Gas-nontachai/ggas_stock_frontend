<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useTheme, useDisplay } from 'vuetify'

const theme = useTheme()
const { mdAndUp } = useDisplay()
const isDarkTheme = computed(() => theme.global.current.value.dark)
const drawerColor = computed(() => 'surface')
const appBarColor = computed(() => 'surface')
const iconTextColor = computed(() => isDarkTheme.value ? 'white' : '#0f172a')

const { t } = useI18n();
const drawer = ref(false);
const route = useRoute();
const isDesktop = computed(() => mdAndUp.value);

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

const fullText = "GGAS Stock";

onMounted(() => {
    if (isDesktop.value) {
        drawer.value = JSON.parse(localStorage.getItem("drawer") || "true");
    }
});

const setDrawer = () => {
    drawer.value = !drawer.value;
    if (isDesktop.value) {
        localStorage.setItem("drawer", JSON.stringify(drawer.value));
    }
};

watch(isDesktop, (desktop) => {
    if (desktop) {
        drawer.value = JSON.parse(localStorage.getItem("drawer") || "true");
    } else {
        drawer.value = false;
    }
}, { immediate: true });

watch(() => route.fullPath, () => {
    if (!isDesktop.value) {
        drawer.value = false;
    }
});

const handleNavItemClick = () => {
    if (!isDesktop.value) {
        drawer.value = false;
    }
}; 
</script>


<template>
    <v-app-bar app elevation="2" density="comfortable" :color="appBarColor">
        <v-app-bar-nav-icon @click="setDrawer"></v-app-bar-nav-icon>
        <div class="d-flex align-center justify-space-between w-100 pr-2 pr-sm-4">
            <v-responsive class="d-flex align-center">
                <span class="text-subtitle-1 text-sm-h6 font-weight-bold">
                    {{ fullText }}
                </span>
            </v-responsive>
            <div class="d-flex align-center ga-1 ga-sm-2">
                <LayoutFullVerticalHeaderLanguageSwitcher />
                <LayoutFullVerticalHeaderThemeSwitcher />
                <LayoutFullVerticalHeaderProfileDD />
            </div>
        </div>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        app
        :color="drawerColor"
        :temporary="!isDesktop"
        :permanent="isDesktop"
        :dark="isDarkTheme"
        width="280"
    >
        <v-list density="comfortable" nav>
            <div class="d-flex justify-center my-4">
                <img :src="'/logo.jpg'" alt="logo" width="90" height="90" />
            </div>

            <v-divider :thickness="3" class="border-opacity-50 mx-2 my-2"></v-divider>

            <RouterLink
                v-for="(item, index) in navbar_items"
                :key="index"
                :to="item.href"
                @click="handleNavItemClick"
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
