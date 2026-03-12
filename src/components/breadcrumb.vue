<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const goBack = () => {
    router.go(-1);
};

const currentPage = computed(() => {
    switch (route.name) {
        case 'index':
            return t('s_drawer.home');
        case 'item':
            return t('s_drawer.item');
        case 'income':
            return t('s_drawer.income');
        case 'expense':
            return t('s_drawer.expense');
        case 'category':
            return t('s_drawer.category');
        case 'profile':
            return t('s_drawer.profile');
        case 'platform':
            return t('s_drawer.platform');
        case 'user':
            return t('s_drawer.user');
        case 'user-profile':
            return t('s_drawer.user_profile');
        case 'item-detail':
            return t('s_drawer.item_detail');
        default:
            return 'Unnamed Page';
    }
});
</script>

<template>
    <v-breadcrumbs class="px-0 py-1">
        <v-breadcrumbs-item @click="goBack" v-if="currentPage !== t('s_drawer.home')">
            <v-chip color="primary" class="d-flex align-center px-2" style="cursor: pointer;" size="small">
                <v-icon start size="small">mdi-arrow-left</v-icon>
                <span>{{ t('button.back') }}</span>
            </v-chip>
        </v-breadcrumbs-item>

        <template v-if="currentPage !== t('s_drawer.home')">
            <v-icon size="x-small">mdi-chevron-right</v-icon>
            <v-breadcrumbs-item disabled>
                <v-chip color="secondary" variant="tonal" class="d-flex align-center px-2" size="small">
                    <v-icon start size="small">mdi-paperclip</v-icon>
                    <span>{{ currentPage }}</span>
                </v-chip>
            </v-breadcrumbs-item>
        </template>
    </v-breadcrumbs>
</template>
