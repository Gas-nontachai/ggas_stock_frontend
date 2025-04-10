<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import type { Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import AddCategory from '@/components/Category/Add.vue';
import EditCategory from '@/components/Category/Edit.vue';

const { getCategoryBy, deleteCategoryBy } = useCategory();
const { t } = useI18n();

const categorys = ref<Category[]>([]);
const loading = ref(true);
const add_paltform_dialog = ref(false);
const edit_paltform_dialog = ref(false);
const category_id_current = ref('');
const searchQuery = ref('');

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getCategoryBy();
        categorys.value = response;
    } catch (error) {
        console.error('Error fetching categorys:', error);
    } finally {
        loading.value = false;
    }
};

const headers = computed(() => [
    { title: t('category.category_id'), align: 'start' as const, key: 'category_id' },
    { title: t('category.category_name'), align: 'start' as const, key: 'category_name' },
    { title: t('category.actions'), align: 'center' as const, key: 'actions' }
]);

const filteredCategorys = computed(() => {
    if (!searchQuery.value) return categorys.value;
    return categorys.value.filter(category =>
        category.category_id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        category.category_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const deleteCategory = (category_id: string) => {
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
                await deleteCategoryBy({ category_id });
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Category deleted successfully!',
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
                    text: 'There was an issue deleting the category. Please try again.',
                    showConfirmButton: true,
                });
            }
        }
    });
};

const addCategory = () => {
    add_paltform_dialog.value = true;
};

const Done = async () => {
    add_paltform_dialog.value = false;
    edit_paltform_dialog.value = false;
    await fetchData();
};

const editCategory = (category_id: string) => {
    category_id_current.value = category_id
    edit_paltform_dialog.value = true;
};
</script>

<template>
    <v-container>
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h1 class="text-h5 font-weight-bold">{{ t('category.title') }}</h1>
                <p>{{ t('category.description') }}</p>
            </div>
            <v-btn @click="addCategory" color="primary">{{ t('category.add_btn') }}</v-btn>
        </div>

        <v-text-field v-model="searchQuery" label="Search" clearable prepend-inner-icon="mdi-magnify"
            class="mb-4 w-4/16" />

        <template v-if="loading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="24" class="d-flex justify-center align-center" />
            <span> Loading..</span>
        </template>

        <v-data-table v-else :items="filteredCategorys" :headers="headers" item-key="category_id" class="elevation-1">
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
                        <v-list-item @click="editCategory(item.category_id)">
                            <div class="d-flex">
                                <v-icon>mdi-pencil</v-icon>
                                <v-list-item-title>{{ t('button.edit') }}</v-list-item-title>
                            </div>
                        </v-list-item>
                        <v-list-item @click="deleteCategory(item.category_id)">
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
            <AddCategory @addDone="Done" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="600px">
            <EditCategory :category_id="category_id_current" @addDone="Done" />
        </v-dialog>

    </v-container>
</template>