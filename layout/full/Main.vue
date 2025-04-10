<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import LanguageSwitcher from "./vertical-header/LanguageSwitcher.vue";
import ThemeSwitcher from "./vertical-header/ThemeSwitcher.vue";
import ProfileDD from "./vertical-header/ProfileDD.vue";

const { t } = useI18n();
const drawer = ref(false);

const navbar_items = computed(() => [
    { text: t('home.text'), href: "home", icon: "mdi-home" },
]);

const fullText = "GGAS Stock Management System";  
</script>

<template>
    <!-- App Bar (Fixed Navbar) -->
    <v-app-bar app fixed elevation="4" density="comfortable" class="custom-app-bar">
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-row align="center" style="width: 100%;" justify="space-between" class="px-8">
            <v-responsive class="d-flex align-center">
                <strong class="text kanit-medium text-h6 text-md-body-1 text-lg-h6 ">
                    {{ fullText }}
                </strong>
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