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
const { runSubmit } = useAsyncSubmit();

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
  const amount = normalizePositiveDecimal(expense.value.expense_amount, 2);
  if (!amount) {
    warning(t('validation.positive_number', { field: t('expense.expense_amount') }));
    return;
  }

  await runSubmit(
    async () => {
      const validation = await formRef.value?.validate();
      return Boolean(validation?.valid);
    },
    async () => {
      await createExpense({
        expense_name: expense.value.expense_name.trim(),
        expense_amount: amount,
        expense_category_id: expense.value.expense_category_id,
      } as Partial<Expense>);
      emit('done', true);
    },
    {
      onInvalid: () => warning(t('validation.form_invalid')),
      onSuccess: () => success(t('message.submit_success')),
      onError: () => error(t('message.submit_error')),
    },
  );
};
</script>

<template>
  <FormDialogFrame
    icon="mdi-cash-minus"
    :title="t('expense.add_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
    <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
      <v-row class="form-grid">
        <v-col cols="12">
          <v-text-field v-model="expense.expense_name" :label="t('expense.expense_name')" :rules="expenseNameRules"
            variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="expense.expense_amount" :label="t('expense.expense_amount')" :rules="expenseAmountRules"
            variant="outlined" density="comfortable" inputmode="decimal" @keydown="blockInvalidNumericKeys"
            @input="sanitizeAmount" @blur="sanitizeAmount" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="expense.expense_category_id" :items="props.category_expenses" item-value="value"
            item-title="title" :label="t('expense.expense_category')" :rules="expenseCategoryRules" variant="outlined"
            density="comfortable" />
        </v-col>
      </v-row>
    </v-form>
  </FormDialogFrame>
</template>
