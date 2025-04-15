<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import { decimalFix } from '@/utils/number-func';
import type { Expense, Category } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify'

const { getExpenseBy, deleteExpenseBy } = useExpense();
const { getCategoryBy } = useCategory();
const { t, locale } = useI18n();

const theme = useTheme()
const isDarkTheme = computed(() => theme.global.current.value.dark)

const expenses = ref<Expense[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const menu_filter = ref(false);
const add_expenses_dialog = ref(false);
const edit_expenses_dialog = ref(false);
const expense_id_current = ref('');
const search_query = ref('');
const date_selected = ref<[Date, Date] | null>(null);
const selected_category = ref<string[]>([]);
const category_expenses = ref<{ title: string, value: string }[]>()

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getExpenseBy({
            where: {
                expense_name: { $like: search_query.value },
                expense_category_id: { $in: selected_category.value },
                createdAt: {
                    $gt: date_selected.value && Array.isArray(date_selected.value) ? date_selected.value[0] : null,
                    $lt: date_selected.value && Array.isArray(date_selected.value) ? date_selected.value[1] : null,
                },
            },
        });

        expenses.value = response;
    } catch (error) {
        console.error('Error fetching expenses:', error);
    } finally {
        loading.value = false;
    }
};

const fetchCategory = async () => {
    try {
        const response = await getCategoryBy();
        categories.value = response;
        category_expenses.value = response.map((item) => ({
            title: item.category_name,
            value: item.category_id,
        }));
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

onMounted(async () => {
    await fetchData();
    await fetchCategory();
});

watch([selected_category, date_selected], async () => {
    try {
        await fetchData();
    } catch (error) {
        console.error('Error refreshing tasks:', error);
    }
}, { immediate: true, deep: true });

const headers = computed(() => [
    { title: t('expense.expense_id'), align: 'start' as const, key: 'expense_id' },
    { title: t('expense.expense_name'), align: 'start' as const, key: 'expense_name' },
    { title: t('expense.expense_amount'), align: 'start' as const, key: 'expense_amount' },
    { title: t('expense.expense_category'), align: 'start' as const, key: 'expense_category_id' },
    { title: t('expense.createdAt'), align: 'start' as const, key: 'createdAt' },
    { title: t('expense.actions'), align: 'center' as const, key: 'actions' }
]);

const deleteExpense = (expense_id: string) => {
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
                await deleteExpenseBy({ expense_id });
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Expense deleted successfully!',
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
                    text: 'There was an issue deleting the expense. Please try again.',
                    showConfirmButton: true,
                });
            }
        }
    });
};

const addExpense = () => {
    add_expenses_dialog.value = true;
};

const Done = async () => {
    add_expenses_dialog.value = false;
    edit_expenses_dialog.value = false;
    await fetchData();
};

const editExpense = (expense_id: string) => {
    expense_id_current.value = expense_id
    edit_expenses_dialog.value = true;
};

const getCategoryName = (category_id: string) => {
    const category = categories.value.find(cat => cat.category_id === category_id);
    return category ? category.category_name : 'category';
};

const totalAmount = computed(() => {
    return decimalFix(expenses.value.reduce((sum, item) => sum + Number(item.expense_amount || 0), 0))
})
</script>

<template>
    <v-container>
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h1 class="text-h5 font-weight-bold">{{ t('expense.title') }}</h1>
                <p>{{ t('expense.description') }}</p>
            </div>
            <v-btn @click="addExpense" color="primary">{{ t('expense.add_btn') }}</v-btn>
        </div>

        <v-row>
            <v-col cols="6">
                <v-text-field v-model="search_query" :label="t('expense.search')" prepend-inner-icon="mdi-magnify"
                    clearable single-line hide-details density="compact" variant="outlined"
                    @click:prepend-inner="fetchData" @keyup.enter="fetchData" class="rounded-lg"></v-text-field>
            </v-col>
            <v-col cols="3">
                <v-menu v-model="menu_filter" :close-on-content-click="false" max-width="300px">
                    <template #activator="{ props }">
                        <v-btn v-bind="props" :color="selected_category.length ? 'primary' : ''" variant="outlined"
                            class="w-100 justify-start rounded-lg">
                            <v-icon class="mr-2">mdi-filter</v-icon>
                            {{ t('button.filter') }}
                            <v-badge v-if="selected_category.length" :content="selected_category.length" color="primary"
                                inline class="ml-2"></v-badge>
                        </v-btn>
                    </template>
                    <v-card class="pa-2">
                        <v-list class="pt-2">
                            <v-list-item v-for="(item, index) in category_expenses" :key="index" density="compact"
                                class="px-1">
                                <v-checkbox v-model="selected_category"
                                    @change="() => { console.log(selected_category); }" :label="item.title"
                                    :value="item.value" hide-details density="compact"></v-checkbox>
                            </v-list-item>
                        </v-list>
                        <v-card-actions class="justify-end pt-2">
                            <v-btn variant="text" color="primary" size="small"
                                @click="menu_filter = false">Close</v-btn>
                            <v-btn variant="text" color="error" size="small" @click="selected_category = []">Clear
                                All</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-menu>
            </v-col>

            <v-col cols="3">
                <DatePicker range :locale="locale" :dark="isDarkTheme" :teleport="true" :cancelText="t('button.cancel')"
                    :selectText="t('button.select')" preview-format="dd MMMM yyyy" :markers="[
                        { date: new Date(), type: 'dot', tooltip: [{ text: 'วันนี้', color: 'red' }] }
                    ]" v-model="date_selected" :enable-time-picker="false" :placeholder="t('button.select_date')"
                    class=" w-full " />
            </v-col>
        </v-row>

        <template v-if="loading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="24" class="d-flex justify-center align-center" />
            <span> Loading..</span>
        </template>

        <template v-else>
            <v-card class="pa-4 elevation-3 rounded-lg my-3 gradient-border">
                <v-row align="center" justify="space-evenly" no-gutters>
                    <v-col cols="12" md="4" class="mb-3 mb-md-0 px-2">
                        <div class="d-flex flex-column align-center text-center">
                            <div class="text-caption text-grey-darken-1 mb-1">{{ $t('expense.total_amount') }}</div>
                            <div class="text-h4 font-weight-bold text-error d-flex align-center">
                                <v-icon color="error" size="large" class="mr-1">mdi-currency-thb</v-icon>
                                {{ totalAmount }}
                            </div>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4" class="mb-3 mb-md-0 px-2">
                        <div class="d-flex flex-column align-center text-center">
                            <div class="text-caption text-grey-darken-1 mb-1">{{ $t('expense.transaction_count') }}
                            </div>
                            <div class="text-h5 font-weight-bold text-primary d-flex align-center">
                                <v-icon color="primary" class="mr-1">mdi-format-list-bulleted</v-icon>
                                {{ expenses.length }} {{ $t('expense.items') }}
                            </div>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4" class="text-center text-md-end px-2">
                        <template v-if="date_selected">
                            <div class="text-caption text-grey-darken-1 mb-1">{{ $t('expense.date_range') }}</div>
                            <v-chip color="deep-purple-lighten-4" class="pa-3 text-body-2 font-weight-medium"
                                variant="elevated" prepend-icon="mdi-calendar-range">
                                <span class="text-deep-purple-darken-3">
                                    {{ formatDate(date_selected[0]) }}
                                    <span v-if="date_selected[1]"> - {{ formatDate(date_selected[1])
                                    }}</span>
                                </span>
                            </v-chip>
                        </template>
                    </v-col>
                </v-row>
            </v-card>

            <v-data-table :items="expenses" :headers="headers" item-key="expense_id" class="elevation-1">
                <template v-slot:item.expense_amount="{ item }">
                    <span>{{ decimalFix(item.expense_amount) }} ฿ </span>
                </template>

                <template v-slot:item.expense_category_id="{ item }">
                    <span>{{ getCategoryName(item.expense_category_id) }}</span>
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
                            <v-list-item @click="editExpense(item.expense_id)">
                                <div class="d-flex">
                                    <v-icon>mdi-pencil</v-icon>
                                    <v-list-item-title>{{ t('button.edit') }}</v-list-item-title>
                                </div>
                            </v-list-item>
                            <v-list-item @click="deleteExpense(item.expense_id)">
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

        <v-dialog v-model="add_expenses_dialog" max-width="600px">
            <ExpenseAdd :category_expenses="category_expenses" @done="Done"
                @close="() => { add_expenses_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_expenses_dialog" max-width="600px">
            <ExpenseEdit :category_expenses="category_expenses" :expense_id="expense_id_current" @done="Done"
                @close="() => { edit_expenses_dialog = false }" />
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