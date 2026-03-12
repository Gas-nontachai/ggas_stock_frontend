<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import type { Platform } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { searchPlatform, deletePlatform: removePlatform } = usePlatform();
const { confirmAndRun } = useConfirmAction();
const { t } = useI18n();

const platforms = ref<Platform[]>([]);
const listPage = useListPage({});
const loading = listPage.loading;
const search_query = listPage.searchQuery;
const platform_id_current = ref('');

const add_paltform_dialog = computed({
    get: () => listPage.dialogs.add_platform ?? false,
    set: (value: boolean) => {
        listPage.dialogs.add_platform = value;
    },
});

const edit_paltform_dialog = computed({
    get: () => listPage.dialogs.edit_platform ?? false,
    set: (value: boolean) => {
        listPage.dialogs.edit_platform = value;
    },
});

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    listPage.setLoading(true);
    try {
        const response = await searchPlatform();
        platforms.value = response;
    } catch (error) {
        console.error('Error fetching platforms:', error);
    } finally {
        listPage.setLoading(false);
    }
};

const headers = computed(() => [
    { title: t('platform.platform_id'), align: 'start' as const, key: 'platform_id' },
    { title: t('platform.platform_name'), align: 'start' as const, key: 'platform_name' },
    { title: t('platform.actions'), align: 'center' as const, key: 'actions' }
]);

const filteredPlatforms = computed(() => {
    if (!search_query.value) return platforms.value;
    return platforms.value.filter(platform =>
        platform.platform_id.toLowerCase().includes(search_query.value.toLowerCase()) ||
        platform.platform_name.toLowerCase().includes(search_query.value.toLowerCase())
    );
});

const deletePlatform = async (platform_id: string) => {
    await confirmAndRun(async () => {
        await removePlatform(platform_id);
        await fetchData();
    }, {
        confirmButtonText: t('button.delete'),
        successText: 'Platform deleted successfully!',
    });
};

const addPlatform = () => {
    listPage.openDialog('add_platform');
};

const Done = async () => {
    listPage.closeDialog('add_platform');
    listPage.closeDialog('edit_platform');
    await fetchData();
};

const editPlatform = (platform_id: string) => {
    platform_id_current.value = platform_id
    listPage.openDialog('edit_platform');
};
</script>

<template>
    <section class="page-shell">
        <div class="page-header">
            <div class="page-heading">
                <h1 class="page-title">{{ t('platform.title') }}</h1>
                <p class="page-subtitle">{{ t('platform.description') }}</p>
            </div>
            <div class="page-actions">
                <v-btn @click="addPlatform" color="primary" class="page-primary-action">{{ t('platform.add_btn') }}</v-btn>
            </div>
        </div>

        <ListToolbar v-model="search_query" :search-label="t('expense.search')" :loading="loading" @search="fetchData"
            @clear="() => { listPage.clearSearch(); fetchData(); }" />

        <template v-if="loading" class="d-flex justify-center align-center">
            <Loading />
        </template>

        <div class="table-shell" v-else>
            <v-data-table :items="filteredPlatforms" :headers="headers" item-key="platform_id" class="elevation-1">
            <template v-slot:item.createdAt="{ item }">
                <span>{{ formatDate(item.createdAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.updatedAt="{ item }">
                <span>{{ formatDate(item.updatedAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
                <TableActionMenu :edit-text="t('button.edit')" :delete-text="t('button.delete')"
                    @edit="editPlatform(item.platform_id)" @delete="deletePlatform(item.platform_id)" />
            </template>
            </v-data-table>
        </div>

        <v-dialog v-model="add_paltform_dialog" max-width="720" scrollable>
            <PlatformAdd @done="Done" @close="() => { add_paltform_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="720" scrollable>
            <PlatformEdit :platform_id="platform_id_current" @done="Done"
                @close="() => { edit_paltform_dialog = false }" />
        </v-dialog>

    </section>
</template>
