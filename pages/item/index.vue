<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref } from 'vue';
import { formatDate } from '@/utils/date-func';
import { decimalFix } from '@/utils/number-func';
import type { Item } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { getItemBy, deleteItemBy } = useItem();
const { t } = useI18n();
const router = useRouter();

const menu = ref(false);
const tab = ref("active");
const active_items = ref<Item[]>([]);
const inactive_items = ref<Item[]>([]);
const loading = ref(true);
const add_item_dialog = ref(false);
const edit_item_dialog = ref(false);
const item_id_current = ref('');
const search_query = ref('');

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
    } catch (error) {
        console.error('Error fetching items:', error);
    } finally {
        loading.value = false;
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

const deleteItem = async (item_id: string) => {
    const result = await Swal.fire({
        title: t('Are you sure?'),
        text: t("You won't be able to revert this!"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('Yes, delete it!'),
        customClass: {
            confirmButton: 'swal2-confirm-white',
            cancelButton: 'swal2-cancel-white',
        },
    });

    if (result.isConfirmed) {
        try {
            await deleteItemBy({ item_id });
            await fetchData();
            await Swal.fire({
                title: t('logout.successTitle'),
                text: t('logout.successText'),
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            await Swal.fire({
                title: t('logout.successTitle'),
                text: t('logout.successText'),
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        }
    }
};

const editItem = (item: Item) => {
    item_id_current.value = item.item_id;
    edit_item_dialog.value = true;
};

const viewItemDetails = (item: Item) => {
    router.push(`/items/${item.item_id}`);
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
                        <v-card v-if="!loading && active_items.length === 0" class="text-center pa-6">
                            <v-icon icon="mdi-alert-circle-outline" size="large" class="mb-2" color="warning"></v-icon>
                            <p class="text-body-1 mb-4">{{ t('No items found') }}</p>
                            <v-btn color="primary" @click="fetchData">{{ t('Refresh') }}</v-btn>
                        </v-card>
                        <v-row v-else>
                            <v-col v-for="item in active_items" :key="item.item_id" cols="12" sm="6" md="4" lg="3">
                                <v-card class="h-100">
                                    <v-img v-if="item.item_image" :src="item.item_image" :alt="item.item_name"
                                        height="200" cover class="bg-grey-lighten-2" />
                                    <v-img v-else src="/default-cart.png" height="200" cover class="bg-grey-lighten-2">
                                        <template v-slot:placeholder>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-icon icon="mdi-image" size="large" color="grey-lighten-1" />
                                            </div>
                                        </template>
                                    </v-img>

                                    <v-card-title class="text-truncate">{{ item.item_name }}</v-card-title>

                                    <v-card-text>
                                        <div class="d-flex align-center mb-2">
                                            <v-icon icon="mdi-currency-thb" class="mr-1" color="success" />
                                            <span class="text-subtitle-1 font-weight-bold">
                                                {{ decimalFix(item.item_buy_price) }}
                                            </span>
                                        </div>

                                        <div v-if="item.note" class="text-body-2 text-truncate mb-2">
                                            {{ item.note }}
                                        </div>

                                        <div class="d-flex align-center text-caption text-grey">
                                            <v-icon icon="mdi-clock-outline" size="small" class="mr-1" />
                                            {{ formatDate(item.createdAt) }}
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn variant="text" color="primary" @click="viewItemDetails(item)">
                                            <v-icon left>mdi-eye</v-icon>
                                            {{ t('View') }}
                                        </v-btn>
                                        <v-spacer />
                                        <v-btn icon variant="text" color="info" @click="editItem(item)">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn icon variant="text" color="error" @click="deleteItem(item.item_id)">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="inactive">
                        <v-card v-if="!loading && inactive_items.length === 0" class="text-center pa-6">
                            <v-icon icon="mdi-alert-circle-outline" size="large" class="mb-2" color="warning"></v-icon>
                            <p class="text-body-1 mb-4">{{ t('No items found') }}</p>
                            <v-btn color="primary" @click="fetchData">{{ t('Refresh') }}</v-btn>
                        </v-card>
                        <v-row v-else>
                            <v-col v-for="item in inactive_items" :key="item.item_id" cols="12" sm="6" md="4" lg="3">
                                <v-card class="h-100">
                                    <div class="opacity-50">
                                        <v-img v-if="item.item_image" :src="item.item_image" :alt="item.item_name"
                                            height="200" cover class="bg-grey-lighten-2" />
                                        <v-img v-else src="/default-cart.png" height="200" cover
                                            class="bg-grey-lighten-2">
                                            <template v-slot:placeholder>
                                                <div class="d-flex align-center justify-center fill-height">
                                                    <v-icon icon="mdi-image" size="large" color="grey-lighten-1" />
                                                </div>
                                            </template>
                                        </v-img>
                                    </div>

                                    <div class="opacity-70">
                                        <v-card-title class="text-truncate text-decoration-line-through">
                                            {{ item.item_name }}
                                        </v-card-title>

                                        <v-card-text>
                                            <div class="d-flex align-center mb-2">
                                                <v-icon icon="mdi-currency-thb" class="mr-1" color="success" />
                                                <span
                                                    class="text-subtitle-1 font-weight-bold text-decoration-line-through">
                                                    {{ decimalFix(item.item_buy_price) }}
                                                </span>
                                            </div>

                                            <div v-if="item.note" class="text-body-2 text-truncate mb-2">
                                                {{ item.note }}
                                            </div>

                                            <div class="d-flex align-center text-caption text-grey">
                                                <v-icon icon="mdi-clock-outline" size="small" class="mr-1" />
                                                {{ formatDate(item.createdAt) }}
                                            </div>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-btn variant="text" color="primary" @click="viewItemDetails(item)">
                                                <v-icon left>mdi-eye</v-icon>
                                                {{ t('View') }}
                                            </v-btn>
                                            <v-spacer />
                                            <v-btn icon variant="text" color="info" @click="editItem(item)">
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn icon variant="text" color="error" @click="deleteItem(item.item_id)">
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </v-card-actions>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>

        <v-dialog v-model="add_item_dialog" max-width="600px">
            <ItemAdd @done="done" />
        </v-dialog>

        <v-dialog v-model="edit_item_dialog" max-width="600px">
            <ItemEdit @done="done" />
        </v-dialog>
    </v-container>
</template>