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
const menu_sorter = ref(false);
const menu_filter = ref(false);
const add_item_dialog = ref(false);
const edit_item_dialog = ref(false);
const search_query = ref('');
const item_id_current = ref('');
const selected_category = ref<string[]>([]);

const category_items = ref<{ title: string, value: string }[]>()

const sort = ref<{ name: string; order: "ASC" | "DESC" }>({
    name: "createdAt",
    order: "ASC",
});

const sort_options = computed(() => [
    { name: "createdAt", label: t('filter.date') },
    { name: "item_buy_price", label: t('filter.price') },
    { name: "item_name", label: t('filter.name') },
]);


const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getItemBy({
            where: {
                item_name: { $like: search_query.value },
                item_category_id: { $in: selected_category.value },
            },
            sorter: {
                field: sort.value.name,
                order: sort.value.order
            }
        });
        active_items.value = response.filter(item => item.item_status == 1);
        inactive_items.value = response.filter(item => item.item_status == 0);
        await fetchCategory();
    } catch (error) {
        console.error('Error fetching items:', error);
    } finally {
        loading.value = false;
    }
};

const fetchCategory = async () => {
    try {
        const response = await getCategoryBy({
            where: {
                use_for: 'item'
            }
        });
        categories.value = response;
        category_items.value = response.map((item) => ({
            title: item.category_name,
            value: item.category_id,
        }));
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

onMounted(async () => {
    await fetchData();
});

watch([sort.value, selected_category], async () => {
    try {
        await fetchData();
    } catch (error) {
        console.error('Error refreshing tasks:', error);
    }
}, { immediate: true, deep: true });

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

const clearAllFilters = async () => {
    search_query.value = '';
    selected_category.value = [];
    sort.value = {
        name: "createdAt",
        order: "ASC",
    }
    await fetchData();
}; 
</script>

<template>
    <v-container fluid max-width="95%">
        <v-card class="mb-6">
            <v-card-title class="d-flex align-center justify-space-between flex-wrap">
                <h1 class="font-weight-bold">{{ t('item.title') }}</h1>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="add_item_dialog = true">
                    {{ t('item.add_btn') }}
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-row class="align-center">
                    <v-col cols="12" md="5">
                        <v-text-field v-model="search_query" :label="t('item.search')" prepend-inner-icon="mdi-magnify"
                            clearable single-line hide-details density="compact" variant="outlined"
                            @click:prepend-inner="fetchData" @keyup.enter="fetchData" @click:clear="clearSearch"
                            class="rounded-lg"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-menu v-model="menu_sorter" :close-on-content-click="false" offset-y>
                            <template #activator="{ props }">
                                <v-btn v-bind="props" variant="outlined" class="w-100 justify-start rounded-lg"
                                    color="secondary">
                                    <v-icon class="mr-2">mdi-sort</v-icon>
                                    {{sort_options.find((opt) => opt.name === sort.name)?.label}}
                                    <v-spacer />
                                    <v-icon>{{ sort.order === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="option in sort_options" :key="option.name"
                                    @click="toggleSort(option.name)"
                                    :class="{ 'bg-grey-lighten-4': sort.name === option.name }">
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
                    <v-col cols="12" md="2">
                        <v-menu v-model="menu_filter" :close-on-content-click="false" max-width="300px">
                            <template #activator="{ props }">
                                <v-btn v-bind="props" :color="selected_category.length ? 'primary' : ''"
                                    variant="outlined" class="w-100 justify-start rounded-lg">
                                    <v-icon class="mr-2">mdi-filter</v-icon>
                                    {{ t('button.filter') }}
                                    <v-badge v-if="selected_category.length" :content="selected_category.length"
                                        color="primary" inline class="ml-2"></v-badge>
                                </v-btn>
                            </template>
                            <v-card class="pa-2">
                                <v-list class="pt-2">
                                    <v-list-item v-for="(item, index) in category_items" :key="index" density="compact"
                                        class="px-1">
                                        <v-checkbox v-model="selected_category"  :label="item.title"
                                            :value="item.value" hide-details density="compact"></v-checkbox>
                                    </v-list-item>
                                </v-list>
                                <v-card-actions class="justify-end pt-2">
                                    <v-btn variant="text" color="primary" size="small"
                                        @click="menu_filter = false">Close</v-btn>
                                    <v-btn variant="text" color="error" size="small"
                                        @click="selected_category = []">Clear All</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-menu>
                    </v-col>

                    <v-col cols="12" md="2">
                        <v-btn variant="tonal" color="error" class="w-100 rounded-lg" @click="clearAllFilters"
                            :disabled="!search_query && selected_category.length === 0">
                            <v-icon class="mr-2">mdi-filter-remove</v-icon>
                            {{ t('button.clear_filter') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
        <v-row v-else>
            <v-col cols="12">
                <v-tabs v-model="tab" grow class="mb-10">
                    <v-tab value="active">{{ t('item.active') }}</v-tab>
                    <v-tab value="inactive">{{ t('item.inactive') }}</v-tab>
                </v-tabs>

                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="active">
                        <ItemItems :items="active_items" :categories="categories" :status="1" @fetchData="fetchData"
                            @openEdit="openEdit" />
                    </v-tabs-window-item>

                    <v-tabs-window-item value="inactive">
                        <ItemItems :items="inactive_items" :categories="categories" :status="0" @fetchData="fetchData"
                            @openEdit="openEdit" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>

        <v-dialog v-model="add_item_dialog" max-width="600px">
            <ItemAdd :category_items="category_items" @done="done" @close="() => { add_item_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_item_dialog" max-width="600px">
            <ItemEdit :category_items="category_items" :item_id="item_id_current" @done="done"
                @close="() => { edit_item_dialog = false }" />
        </v-dialog>
    </v-container>
</template>