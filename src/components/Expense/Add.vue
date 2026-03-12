<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  blockInvalidNumericKeys,
  normalizePositiveDecimal,
  positiveDecimalRules,
  requiredRule,
  sanitizePositiveDecimalInput,
  selectRequiredRule,
} from '@/utils/rules';
import type { Expense } from '@/misc/type';

const { createExpense } = useExpense();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

const props = defineProps({
  category_expenses: {
    type: Array as PropType<{ title: string, value: string }[]>,
  },
});

const expense = ref({
  expense_name: '',
  expense_amount: '',
  expense_category_id: '',
});

const expenseNameRules = [requiredRule(t, t('expense.expense_name'))];
const expenseAmountRules = positiveDecimalRules(t, t('expense.expense_amount'), 2);
const expenseCategoryRules = [selectRequiredRule(t, t('expense.expense_category'))];

const sanitizeAmount = () => {
  expense.value.expense_amount = sanitizePositiveDecimalInput(expense.value.expense_amount, 2);
};

const submitForm = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    warning(t('validation.form_invalid'));
    return;
  }

  const amount = normalizePositiveDecimal(expense.value.expense_amount, 2);
  if (!amount) {
    warning(t('validation.positive_number', { field: t('expense.expense_amount') }));
    return;
  }

  try {
    await createExpense({
      expense_name: expense.value.expense_name.trim(),
      expense_amount: amount,
      expense_category_id: expense.value.expense_category_id,
    } as Partial<Expense>);
    success(t('message.submit_success'));
    emit('done', true);
  } catch {
    error(t('message.submit_error'));
  }
};
</script>

<template>
  <v-card class="app-form-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary" size="small">mdi-cash-minus</v-icon>
        <span class="app-form-title">{{ t('expense.add_title') }}</span>
      </div>
      <v-btn icon variant="text" color="secondary" @click="emit('close', true)" size="small">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="expense.expense_name"
              :label="t('expense.expense_name')"
              :rules="expenseNameRules"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="expense.expense_amount"
              :label="t('expense.expense_amount')"
              :rules="expenseAmountRules"
              inputmode="decimal"
              @keydown="blockInvalidNumericKeys"
              @input="sanitizeAmount"
              @blur="sanitizeAmount"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="expense.expense_category_id"
              :items="props.category_expenses"
              item-value="value"
              item-title="title"
              :label="t('expense.expense_category')"
              :rules="expenseCategoryRules"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="secondary" variant="text" @click="emit('close', true)">{{ t('button.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submitForm">{{ t('button.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
