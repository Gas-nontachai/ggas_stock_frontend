<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import LanguageSwitcher from "./vertical-header/LanguageSwitcher.vue";
import ThemeSwitcher from "./vertical-header/ThemeSwitcher.vue";
import ProfileDD from "./vertical-header/ProfileDD.vue";

const { t } = useI18n();
const drawer = ref(false);

const navbar_items = computed(() => [
    { text: t('s_drawer.home'), href: "/", icon: "mdi-home" },
    { text: t('s_drawer.item'), href: "/item", icon: "mdi-gamepad-variant" },
    { text: t('s_drawer.income'), href: "/income", icon: "mdi-cash" },
    { text: t('s_drawer.expense'), href: "/expense", icon: "mdi-cash-minus" },
    { text: t('s_drawer.category'), href: "/category", icon: "mdi-folder" },
    { text: t('s_drawer.platform'), href: "/platform", icon: "mdi-desktop-classic" },
    { text: t('s_drawer.user'), href: "/user", icon: "mdi-account" },
]);

const fullText = "GGAS Stock ";  
</script>

<template>
    <v-app-bar app fixed elevation="4" density="comfortable" class="custom-app-bar">
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-row align="center" style="width: 100%;" justify="space-between" class="px-8">
            <v-responsive class="d-flex align-center">
                <span class="text-center text-h6 font-weight-bold">
                    {{ fullText }}
                </span>
            </v-responsive>
            <div class="d-flex align-center">
                <LanguageSwitcher />
                <ThemeSwitcher />
                <ProfileDD />
            </div>
        </v-row>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
        <v-list>
            <v-list-item v-for="(item, index) in navbar_items" :key="index" :href="item.href">
                <template v-slot:prepend>
                    <v-icon>{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>