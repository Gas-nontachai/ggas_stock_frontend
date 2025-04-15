<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Expense } from "@/misc/type";

const { updateExpenseBy, getExpenseByID } = useExpense();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps({
    expense_id: {
        type: String,
        required: true,
    },
    category_expenses: {
        type: Array as PropType<{ title: string, value: string }[]>,
    },
});

const expense = ref<Expense>({
    expense_id: '',
    expense_name: '',
    expense_amount: 0,
    expense_category_id: '',
});
const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);
const image_arr = ref<string[]>([]);
const image_delete_arr = ref<string[]>([]);

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    try {
        const response = await getExpenseByID({ expense_id: props.expense_id });
        expense.value = response;
    } catch (error) {
        console.error('Error fetching expense:', error);
    }
};

const submitForm = async () => {
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
        await updateExpenseBy(expense.value);

        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Expense updated successfully!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
        });
        emit('done', true);
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong, please try again.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
        });
        emit('done', true);
    }
};  
</script>

<template>
    <v-card>
        <v-card-title>
            <v-row justify="space-between" align="center" class="py-2 px-1">
                <v-col cols="auto">
                    <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-3" size="large">
                            mdi-cash-multiple
                        </v-icon>
                        <span class="text-h5 font-weight-medium gradient-text">{{ t('expense.edit_title') }}</span>
                    </div>
                </v-col>
                <v-col cols="auto">
                    <v-btn icon variant="tonal" color="error" @click="emit('close', true)"
                        class="rounded-circle elevation-1" size="small">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-title>
        <v-card-text>
            <v-form>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="expense.expense_name" :label="t('expense.expense_name')"
                            variant="outlined" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="expense.expense_amount" :label="t('expense.expense_amount')"
                            variant="outlined" type="number" required></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select v-model="expense.expense_category_id" :items="props.category_expenses"
                            expense-value="value" expense-text="title" :label="t('expense.expense_category')"
                            variant="outlined" required></v-select>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="emit('close', true);">{{ t('button.cancel') }}</v-btn>
            <v-btn color="primary" variant="elevated" @click="submitForm">{{ t('button.submit') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>
