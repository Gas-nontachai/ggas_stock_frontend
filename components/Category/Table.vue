<script setup lang="ts">
import Swal from 'sweetalert2';
import { formatDate } from '@/utils/date-func';
import type { Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { deleteCategoryBy } = useCategory();

const props = defineProps<{
    category: Category[];
}>();

const emit = defineEmits(['fetchData', 'done', 'close', 'edit']);

const headers = computed(() => [
    { title: t('category.category_id'), align: 'start' as const, key: 'category_id' },
    { title: t('category.category_name'), align: 'start' as const, key: 'category_name' },
    { title: t('category.use_for'), align: 'start' as const, key: 'use_for' },
    { title: t('category.actions'), align: 'center' as const, key: 'actions' }
]);

const editCategory = (category_id: string) => {
    emit('edit', category_id);
};

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
                await emit('fetchData', true);
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
                await emit('fetchData', true);
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
</script>

<template>
    <v-data-table :items="props.category" :headers="headers" item-key="category_id" class="elevation-1">
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

</template>