<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Item, Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';

const { getItemBy } = useItem();
const { getCategoryBy } = useCategory();
const { t } = useI18n();

const tab = ref("active");
const active_items = ref<Item[]>([]);
const inactive_items = ref<Item[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const menu = ref(false);
const add_item_dialog = ref(false);
const edit_item_dialog = ref(false);
const search_query = ref('');
const item_id_current = ref('');

const sort = ref<{ name: string; order: "ASC" | "DESC" }>({
    name: "createdAt",
    order: "ASC",
});

const sort_options = [
    { name: "createdAt", label: "จัดเรียงตามวันที่" },
    { name: "item_buy_price", label: "จัดเรียงตามราคา" },
    { name: "item_name", label: "จัดเรียงตามชื่อสินค้า" },
];

onMounted(async () => {
    await fetchData();
});

watch([sort.value], async () => {
    try {
        await fetchData();
    } catch (error) {
        console.error('Error refreshing tasks:', error);
    }
}, { immediate: true });

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getItemBy({
            where: {
                item_name: { $like: search_query.value }
            },
            sorter: {
                field: sort.value.name,
                order: sort.value.order
            }
        });
        active_items.value = response.filter(item => item.item_status == 1);
        inactive_items.value = response.filter(item => item.item_status == 0);
        const unique_category_id = response.map(i => i.item_category_id).filter((id, index, self) => self.indexOf(id) === index);
        await fetchCategory(unique_category_id);
    } catch (error) {
        console.error('Error fetching items:', error);
    } finally {
        loading.value = false;
    }
};

const fetchCategory = async (category_id_arr: string[]) => {
    try {
        const response = await getCategoryBy({
            where: {
                category_id: { $in: category_id_arr }
            }
        });
        categories.value = response;
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

const toggleSort = (selected_name: string) => {
    if (sort.value.name === selected_name) {
        sort.value.order = sort.value.order === "ASC" ? "DESC" : "ASC";
    } else {
        sort.value.name = selected_name;
        sort.value.order = "ASC";
    }
};

const clearSearch = async () => {
    search_query.value = '';
    await fetchData();
};

const done = async () => {
    add_item_dialog.value = false;
    edit_item_dialog.value = false;
    await fetchData();
};

const openEdit = async (item_id: string) => {
    item_id_current.value = item_id;
    edit_item_dialog.value = true;
};
</script>

<template>
    <v-container fluid max-width="95%">
        <v-card class="mb-6">
            <v-card-title class="d-flex align-center justify-space-between flex-wrap">
                <div class="text-h5 font-weight-bold">{{ t('Item Management') }}</div>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="add_item_dialog = true">
                    {{ t('Add New Item') }}
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="search_query" :label="t('Search Items')" prepend-inner-icon="mdi-magnify"
                            clearable single-line hide-details density="compact" variant="outlined"
                            @click:prepend-inner="fetchData" @keyup.enter="fetchData"
                            @click:clear="clearSearch"></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-menu v-model="menu" :close-on-content-click="false" offset-y>
                            <template #activator="{ props }">
                                <v-btn v-bind="props" variant="outlined" class="w-100 justify-start">
                                    {{sort_options.find((opt) => opt.name === sort.name)?.label}}
                                    <v-spacer />
                                    <v-icon>{{ sort.order === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="option in sort_options" :key="option.name"
                                    @click="toggleSort(option.name)">
                                    <div class="d-flex justify-between align-center px-2 py-1">
                                        <v-list-item-title>{{ option.label }}</v-list-item-title>
                                        <v-icon v-if="sort.name === option.name">
                                            {{ sort.order === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                                        </v-icon>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-row v-else>
            <v-col cols="12">
                <v-tabs v-model="tab" grow class="mb-10">
                    <v-tab value="active">Active</v-tab>
                    <v-tab value="inactive">Inactive</v-tab>
                </v-tabs>

                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="active">
                        <ItemItems :items="active_items" :categories="categories" :status="1" @fetchData="fetchData"
                            @openEdit="openEdit" />
                    </v-tabs-window-item>

                    <v-tabs-window-item value="inactive">
                        <ItemItems :items="inactive_items" :categories="categories" :status="0"
                            @fetchData="fetchData" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>

        <v-dialog v-model="add_item_dialog" max-width="600px">
            <ItemAdd @done="done" @close="() => { add_item_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_item_dialog" max-width="600px">
            <ItemEdit :item_id="item_id_current" @done="done" @close="() => { edit_item_dialog = false }" />
        </v-dialog>
    </v-container>
</template>