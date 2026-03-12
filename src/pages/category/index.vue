<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import type { Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { searchCategory } = useCategory();
const { t } = useI18n();

const categorys = ref<Category[]>([]);
const item_categorys = ref<Category[]>([]);
const expense_categorys = ref<Category[]>([]);
const listPage = useListPage({});
const loading = listPage.loading;
const search_query = listPage.searchQuery;
const category_id_current = ref('');
const tab = ref('item');

const add_paltform_dialog = computed({
    get: () => listPage.dialogs.add_category ?? false,
    set: (value: boolean) => {
        listPage.dialogs.add_category = value;
    },
});

const edit_paltform_dialog = computed({
    get: () => listPage.dialogs.edit_category ?? false,
    set: (value: boolean) => {
        listPage.dialogs.edit_category = value;
    },
});

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    listPage.setLoading(true);
    try {
        const response = await searchCategory({
            where: {
                category_name: { $like: search_query.value }
            }
        });
        categorys.value = response;
        item_categorys.value = response.filter(item => item.use_for == "item");
        expense_categorys.value = response.filter(item => item.use_for == "expense");
    } catch (error) {
        console.error('Error fetching categorys:', error);
    } finally {
        listPage.setLoading(false);
    }
};

const editCategory = (category_id: string) => {
    category_id_current.value = category_id
    listPage.openDialog('edit_category');
};

const addCategory = () => {
    listPage.openDialog('add_category');
};

const Done = async () => {
    listPage.closeDialog('add_category');
    listPage.closeDialog('edit_category');
    await fetchData();
};
</script>

<template>
    <section class="page-shell">
        <div class="page-header">
            <div class="page-heading">
                <h1 class="page-title">{{ t('category.title') }}</h1>
                <p class="page-subtitle">{{ t('category.description') }}</p>
            </div>
            <div class="page-actions">
                <v-btn @click="addCategory" color="primary" class="page-primary-action">{{ t('category.add_btn') }}</v-btn>
            </div>
        </div>

        <ListToolbar v-model="search_query" :search-label="t('expense.search')" :loading="loading" @search="fetchData"
            @clear="() => { listPage.clearSearch(); fetchData(); }" />

        <template v-if="loading" class="d-flex justify-center align-center">
            <Loading />
        </template>

        <v-col v-else cols="12">
            <v-tabs v-model="tab" grow class="mb-10">
                <v-tab value="item">{{ t('category.item') }}</v-tab>
                <v-tab value="expense">{{ t('category.expense') }}</v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="item">
                    <CategoryTable :category="item_categorys" @edit="editCategory" @fetchData="fetchData">
                    </CategoryTable>
                </v-tabs-window-item>

                <v-tabs-window-item value="expense">
                    <CategoryTable :category="expense_categorys" @edit="editCategory" @fetchData="fetchData">
                    </CategoryTable>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-col>

        <v-dialog v-model="add_paltform_dialog" max-width="720" scrollable>
            <CategoryAdd @done="Done" @close="() => { add_paltform_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="720" scrollable>
            <CategoryEdit :category_id="category_id_current" @done="Done"
                @close="() => { edit_paltform_dialog = false }" />
        </v-dialog>

    </section>
</template>
