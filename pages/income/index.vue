<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import { decimalFix } from '@/utils/number-func';
import type { Income, Category, Platform } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify'

const { getIncomeBy, deleteIncomeBy } = useIncome();
const { getPlatformBy } = usePlatform();
const { getCategoryBy } = useCategory();
const { t, locale } = useI18n();

const theme = useTheme()
const isDarkTheme = computed(() => theme.global.current.value.dark)

const incomes = ref<Income[]>([]);
const categories = ref<Category[]>([]);
const platforms = ref<Platform[]>([]);
const loading = ref(true);
const menu_filter_cat = ref(false);
const menu_filter_plat = ref(false);
const add_incomes_dialog = ref(false);
const edit_incomes_dialog = ref(false);
const collapseOpen = ref(false);
const income_id_current = ref('');
const search_query = ref('');
const date_selected = ref<[Date, Date] | null>(null);
const selected_category = ref<string[]>([]);
const selected_platform = ref<string[]>([]);
const category_options = ref<{ title: string, value: string }[]>()
const platform_options = ref<{ title: string, value: string }[]>()

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getIncomeBy({
            where: {
                platform_id: { $in: selected_platform.value },
                createdAt: {
                    $gt: date_selected.value && Array.isArray(date_selected.value) ? date_selected.value[0] : null,
                    $lt: date_selected.value && Array.isArray(date_selected.value) ? date_selected.value[1] : null,
                },
            },
            include: [
                {
                    model: "Item",
                    attributes: ['item_buy_price', 'item_category_id', 'item_name', 'item_id', 'note'],
                    where: {
                        item_name: { $like: search_query.value },
                        item_category_id: { $in: selected_category.value }
                    }
                },
            ]
        });
        incomes.value = response
    } catch (error) {
        console.error('Error fetching incomes:', error);
    } finally {
        loading.value = false;
    }
};

const fetchCategory = async () => {
    try {
        const response = await getCategoryBy();
        categories.value = response;
        category_options.value = response.map((item) => ({
            title: item.category_name,
            value: item.category_id,
        }));
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

const fetchPlatform = async () => {
    try {
        const response = await getPlatformBy();
        platforms.value = response;
        platform_options.value = response.map((item) => ({
            title: item.platform_name,
            value: item.platform_id,
        }));
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

onMounted(async () => {
    await fetchData();
    await fetchCategory();
    await fetchPlatform();
});

watch([selected_category, date_selected, selected_platform], async () => {
    try {
        await fetchData();
    } catch (error) {
        console.error('Error refreshing tasks:', error);
    }
}, { immediate: true, deep: true });

const headers = computed(() => [
    { title: t('income.income_id'), align: 'start' as const, key: 'income_id' },
    { title: t('item.item_name'), align: 'start' as const, key: 'tb_item.item_name' },
    { title: t('income.platform_id'), align: 'start' as const, key: 'platform_id' },
    { title: t('item.item_price'), align: 'start' as const, key: 'tb_item.item_price' },
    { title: t('income.income_sell_price'), align: 'start' as const, key: 'income_sell_price' },
    { title: t('income.profit'), align: 'start' as const, key: 'profit' },
    { title: t('income.createdAt'), align: 'start' as const, key: 'createdAt' },
    { title: t('income.actions'), align: 'center' as const, key: 'actions' }
]);

const deleteIncome = (income_id: string) => {
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
                await deleteIncomeBy({ income_id });
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Income deleted successfully!',
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
                    text: 'There was an issue deleting the income. Please try again.',
                    showConfirmButton: true,
                });
            }
        }
    });
};

const clearAllFilters = async () => {
    search_query.value = ''
    selected_platform.value = []
    selected_category.value = []
    date_selected.value = null
    await fetchData();
};

const Done = async () => {
    add_incomes_dialog.value = false;
    edit_incomes_dialog.value = false;
    await fetchData();
};

const editIncome = (income_id: string) => {
    income_id_current.value = income_id
    edit_incomes_dialog.value = true;
};

const getPlatformName = (platform_id: string) => {
    const platform = platforms.value.find(i => i.platform_id === platform_id);
    return platform ? platform.platform_name : 'item';
};

const totalCost = computed(() => {
    return decimalFix(incomes.value.reduce((sum, item) => sum + Number(item.tb_item?.item_buy_price || 0), 0))
})

const totalAmount = computed(() => {
    return decimalFix(incomes.value.reduce((sum, item) => sum + Number(item.income_sell_price || 0), 0))
})

const totalProfit = computed(() => {
    const amount = Number(totalAmount.value.toString().replace(/,/g, ''))
    const cost = Number(totalCost.value.toString().replace(/,/g, ''))
    return decimalFix(amount - cost)
}) 
</script>

<template>
    <v-container>
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h1 class=" font-weight-bold">{{ t('income.title') }}</h1>
                <p>{{ t('income.description') }}</p>
            </div>
        </div>

        <v-row>
            <v-col cols="2" md="1">
                <v-btn @click="collapseOpen = !collapseOpen" variant="text">
                    <v-icon>
                        {{ collapseOpen ? 'mdi-arrow-collapse' : 'mdi-arrow-expand' }}
                    </v-icon>
                </v-btn>
            </v-col>
            <v-col cols="10" md="3">
                <v-text-field v-model="search_query" :label="t('income.search')" prepend-inner-icon="mdi-magnify"
                    clearable single-line hide-details density="compact" variant="outlined"
                    @click:prepend-inner="fetchData" @keyup.enter="fetchData" class="rounded-lg"></v-text-field>
            </v-col>
            <v-col cols="6" md="2">
                <v-menu v-model="menu_filter_cat" :close-on-content-click="false" max-width="300px">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" :color="selected_category.length ? 'primary' : ''" variant="outlined"
                            class="w-100 justify-start rounded-lg overflow-hidden">
                            <v-badge v-if="selected_category.length" :content="selected_category.length" color="primary"
                                inline></v-badge>
                            {{ t('button.filter_category') }}
                        </v-btn>
                    </template>
                    <v-card class="pa-2">
                        <v-list class="pt-2">
                            <v-list-item v-for="(item, index) in category_options" :key="index" density="compact"
                                class="px-1">
                                <v-checkbox v-model="selected_category"  :label="item.title"
                                    :value="item.value" hide-details density="compact"></v-checkbox>
                            </v-list-item>
                        </v-list>
                        <v-card-actions class="justify-end pt-2">
                            <v-btn variant="text" color="primary" size="small"
                                @click="menu_filter_cat = false">Close</v-btn>
                            <v-btn variant="text" color="error" size="small" @click="selected_category = []">Clear
                                All</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-menu>
            </v-col>
            <v-col cols="6" md="2">
                <v-menu v-model="menu_filter_plat" :close-on-content-click="false" max-width="300px">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" :color="selected_platform.length ? 'primary' : ''" variant="outlined"
                            class="w-100 justify-start rounded-lg overflow-hidden">
                            <v-badge v-if="selected_platform.length" :content="selected_platform.length" color="primary"
                                inline></v-badge>
                            {{ t('button.filter_platform') }}
                        </v-btn>
                    </template>
                    <v-card class="pa-2">
                        <v-list class="pt-2">
                            <v-list-item v-for="(item, index) in platform_options" :key="index" density="compact"
                                class="px-1">
                                <v-checkbox v-model="selected_platform"  :label="item.title"
                                    :value="item.value" hide-details density="compact"></v-checkbox>
                            </v-list-item>
                        </v-list>
                        <v-card-actions class="justify-end pt-2">
                            <v-btn variant="text" color="primary" size="small"
                                @click="menu_filter_plat = false">Close</v-btn>
                            <v-btn variant="text" color="error" size="small" @click="selected_platform = []">Clear
                                All</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-menu>
            </v-col>
            <v-col cols="8" md="2">
                <DatePicker range :locale="locale" :dark="isDarkTheme" :teleport="true" :cancelText="t('button.cancel')"
                    :selectText="t('button.select')" preview-format="dd MMMM yyyy" :markers="[
                        { date: new Date(), type: 'dot', tooltip: [{ text: 'วันนี้', color: 'red' }] }
                    ]" v-model="date_selected" :enable-time-picker="false" :placeholder="t('button.select_date')"
                    class=" w-full " />
            </v-col>
            <v-col cols="4" md="2">
                <v-btn variant="tonal" color="error" class="w-100 rounded-lg" @click="clearAllFilters">
                    <v-icon class="mr-2">mdi-filter-remove</v-icon>
                    {{ t('button.clear_filter') }}
                </v-btn>
            </v-col>
        </v-row>

        <template v-if="loading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="24" class="d-flex justify-center align-center" />
            <span> Loading..</span>
        </template>

        <template v-else>
            <v-card class="pa-3 elevation-2 rounded-lg  gradient-border">
                <v-expand-transition>
                    <v-row align="center" justify="space-evenly" no-gutters v-show="collapseOpen">
                        <v-col cols="6" md="2" class="mb-2 mb-md-0 px-1">
                            <div class="d-flex flex-column align-center text-center">
                                <div class="text-grey-darken-1 mb-1">{{ $t('income.total_cost') }}</div>
                                <div class="text-h5 font-weight-bold text-error d-flex align-center">
                                    <v-icon color="error" size="medium" class="mr-1">mdi-currency-thb</v-icon>
                                    {{ totalCost }}
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="6" md="2" class="mb-2 mb-md-0 px-1">
                            <div class="d-flex flex-column align-center text-center">
                                <div class="text-grey-darken-1 mb-1">{{ $t('income.total_amount') }}</div>
                                <div class="text-h5 font-weight-bold text-warning d-flex align-center">
                                    <v-icon color="warning" size="medium" class="mr-1">mdi-currency-thb</v-icon>
                                    {{ totalAmount }}
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="6" md="2" class="mb-2 mb-md-0 px-1">
                            <div class="d-flex flex-column align-center text-center">
                                <div class="text-grey-darken-1 mb-1">{{ $t('income.total_profit') }}</div>
                                <div class="text-h5 font-weight-bold text-success d-flex align-center">
                                    <v-icon color="success" size="medium" class="mr-1">mdi-currency-thb</v-icon>
                                    {{ totalProfit }}
                                </div>
                            </div>
                        </v-col>

                        <v-col cols="6" md="2" class="mb-2 mb-md-0 px-1">
                            <div class="d-flex flex-column align-center text-center">
                                <div class="text-grey-darken-1 mb-1">{{ $t('income.transaction_count') }}</div>
                                <div class="text-body-1 font-weight-bold text-primary d-flex align-center">
                                    <v-icon color="primary" class="mr-1">mdi-format-list-bulleted</v-icon>
                                    {{ incomes.length }} {{ $t('income.items') }}
                                </div>
                            </div>
                        </v-col>

                        <template v-if="date_selected">
                            <v-col cols="12" md="2" class="text-center text-md-end px-1">
                                <div class="text-grey-darken-1 mb-1">{{ $t('income.date_range') }}</div>
                                <v-chip color="deep-purple-lighten-4" class="pa-2 text-body-2 font-weight-medium"
                                    variant="elevated" prepend-icon="mdi-calendar-range">
                                    <span class="text-deep-purple-darken-3">
                                        {{ formatDate(date_selected[0]) }}
                                        <span v-if="date_selected[1]"> - {{ formatDate(date_selected[1]) }}</span>
                                    </span>
                                </v-chip>
                            </v-col>
                        </template>
                    </v-row>
                </v-expand-transition>
            </v-card>

            <v-data-table :items="incomes" :headers="headers" item-key="income_id" class="elevation-1">

                <template v-slot:item.item_id="{ item }">
                    <span>{{ item.tb_item?.item_name }} ฿ </span>
                </template>

                <template v-slot:item.platform_id="{ item }">
                    <span>{{ getPlatformName(item.platform_id) }} ฿ </span>
                </template>

                <template v-slot:item.tb_item.item_price="{ item }">
                    <span>{{ decimalFix(item.tb_item?.item_buy_price) }} ฿ </span>
                </template>

                <template v-slot:item.income_sell_price="{ item }">
                    <span>{{ decimalFix(item.income_sell_price) }} ฿ </span>
                </template>

                <template v-slot:item.profit="{ item }">
                    <span>{{ decimalFix(item.income_sell_price - (item.tb_item?.item_buy_price ?? 0)) }} ฿ </span>
                </template>

                <template v-slot:item.createdAt="{ item }">
                    <span>{{ formatDate(item.createdAt, "dd/MM/yyyy HH:mm") }}</span>
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
                            <v-list-item @click="editIncome(item.income_id)">
                                <div class="d-flex">
                                    <v-icon>mdi-pencil</v-icon>
                                    <v-list-item-title>{{ t('button.edit') }}</v-list-item-title>
                                </div>
                            </v-list-item>
                            <v-list-item @click="deleteIncome(item.income_id)">
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

        <v-dialog v-model="edit_incomes_dialog" max-width="600px">
            <IncomeEdit :income_id="income_id_current" @done="Done" @close="() => { edit_incomes_dialog = false }" />
        </v-dialog>

    </v-container>
</template>

<style>
.gradient-border {
    position: relative;
    background: linear-gradient(to right, #ffffff, #f5f5f5);
    border: none;
    overflow: hidden;
}

.gradient-border::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(to right, #673ab7, #e91e63);
}
</style>