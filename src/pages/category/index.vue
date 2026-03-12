<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import type { Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { getCategoryBy, deleteCategoryBy } = useCategory();
const { t } = useI18n();

const categorys = ref<Category[]>([]);
const item_categorys = ref<Category[]>([]);
const expense_categorys = ref<Category[]>([]);
const loading = ref(true);
const add_paltform_dialog = ref(false);
const edit_paltform_dialog = ref(false);
const category_id_current = ref('');
const search_query = ref('');
const tab = ref('item');

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getCategoryBy({
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
        loading.value = false;
    }
};

const editCategory = (category_id: string) => {
    category_id_current.value = category_id
    edit_paltform_dialog.value = true;
};

const addCategory = () => {
    add_paltform_dialog.value = true;
};

const Done = async () => {
    add_paltform_dialog.value = false;
    edit_paltform_dialog.value = false;
    await fetchData();
};
</script>

<template>
    <v-container>
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h1 class=" font-weight-bold">{{ t('category.title') }}</h1>
                <p>{{ t('category.description') }}</p>
            </div>
            <v-btn @click="addCategory" color="primary">{{ t('category.add_btn') }}</v-btn>
        </div>

        <v-row>
            <v-col cols="6" class="mb-4">
                <v-text-field v-model="search_query" :label="t('expense.search')" prepend-inner-icon="mdi-magnify"
                    clearable single-line hide-details density="compact" variant="outlined"
                    @click:prepend-inner="fetchData" @keyup.enter="fetchData" class="rounded-lg"></v-text-field>
            </v-col>
        </v-row>

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

        <v-dialog v-model="add_paltform_dialog" max-width="600px">
            <CategoryAdd @done="Done" @close="() => { add_paltform_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="600px">
            <CategoryEdit :category_id="category_id_current" @done="Done"
                @close="() => { edit_paltform_dialog = false }" />
        </v-dialog>

    </v-container>
</template>