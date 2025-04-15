<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import type { Platform } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { getPlatformBy, deletePlatformBy } = usePlatform();
const { t } = useI18n();

const platforms = ref<Platform[]>([]);
const loading = ref(true);
const add_paltform_dialog = ref(false);
const edit_paltform_dialog = ref(false);
const platform_id_current = ref('');
const search_query = ref('');

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getPlatformBy();
        platforms.value = response;
    } catch (error) {
        console.error('Error fetching platforms:', error);
    } finally {
        loading.value = false;
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

const deletePlatform = (platform_id: string) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass: {
            confirmButton: 'swal2-confirm-white',
            cancelButton: 'swal2-cancel-white',
        },
        preConfirm: async () => {
            Swal.fire({
                title: 'Submitting...',
                text: 'Please wait while we submit the form.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                showConfirmButton: false,
            });

            try {
                await deletePlatformBy({ platform_id });
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Platform deleted successfully!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
            } catch (error) {
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an issue deleting the platform. Please try again.',
                    showConfirmButton: true,
                });
            }
        }
    });
};

const addPlatform = () => {
    add_paltform_dialog.value = true;
};

const Done = async () => {
    add_paltform_dialog.value = false;
    edit_paltform_dialog.value = false;
    await fetchData();
};

const editPlatform = (platform_id: string) => {
    platform_id_current.value = platform_id
    edit_paltform_dialog.value = true;
};
</script>

<template>
    <v-container>
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h1 class="text-h5 font-weight-bold">{{ t('platform.title') }}</h1>
                <p>{{ t('platform.description') }}</p>
            </div>
            <v-btn @click="addPlatform" color="primary">{{ t('platform.add_btn') }}</v-btn>
        </div>

        <v-row>
            <v-col cols="6" class="mb-4">
                <v-text-field v-model="search_query" :label="t('expense.search')" prepend-inner-icon="mdi-magnify"
                    clearable single-line hide-details density="compact" variant="outlined"
                    @click:prepend-inner="fetchData" @keyup.enter="fetchData" class="rounded-lg"></v-text-field>
            </v-col>
        </v-row>

        <template v-if="loading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="24" class="d-flex justify-center align-center" />
            <span> Loading..</span>
        </template>

        <v-data-table v-else :items="filteredPlatforms" :headers="headers" item-key="platform_id" class="elevation-1">
            <template v-slot:item.createdAt="{ item }">
                <span>{{ formatDate(item.createdAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.updatedAt="{ item }">
                <span>{{ formatDate(item.updatedAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-menu bottom right>
                    <template v-slot:activator="{ props }">
                        <v-btn icon variant="text" size="small" v-bind="props">
                            <v-chip color="red">
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-chip>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="editPlatform(item.platform_id)">
                            <div class="d-flex">
                                <v-icon>mdi-pencil</v-icon>
                                <v-list-item-title>{{ t('button.edit') }}</v-list-item-title>
                            </div>
                        </v-list-item>
                        <v-list-item @click="deletePlatform(item.platform_id)">
                            <div class="d-flex">
                                <v-icon>mdi-delete</v-icon>
                                <v-list-item-title>{{ t('button.delete') }}</v-list-item-title>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>

        <v-dialog v-model="add_paltform_dialog" max-width="600px">
            <PlatformAdd @addDone="Done" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="600px">
            <PlatformEdit :platform_id="platform_id_current" @addDone="Done" />
        </v-dialog>

    </v-container>
</template>