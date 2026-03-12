<script setup lang="ts">
import { formatDate } from '@/utils/date-func';
import type { Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { deleteCategory: removeCategory } = useCategory();
const { confirmAndRun } = useConfirmAction();

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

const deleteCategory = async (category_id: string) => {
    await confirmAndRun(async () => {
        await removeCategory(category_id);
        await emit('fetchData', true);
    }, {
        confirmButtonText: t('button.delete'),
        successText: 'Category deleted successfully!',
    });
};
</script>

<template>
    <div class="table-shell">
        <v-data-table :items="props.category" :headers="headers" item-key="category_id" class="elevation-1">
        <template v-slot:item.createdAt="{ item }">
            <span>{{ formatDate(item.createdAt, "dd/MM/yyyy HH:mm") }}</span>
        </template>

        <template v-slot:item.updatedAt="{ item }">
            <span>{{ formatDate(item.updatedAt, "dd/MM/yyyy HH:mm") }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
            <TableActionMenu :edit-text="t('button.edit')" :delete-text="t('button.delete')"
                @edit="editCategory(item.category_id)" @delete="deleteCategory(item.category_id)" />
        </template>
        </v-data-table>
    </div>

</template>
