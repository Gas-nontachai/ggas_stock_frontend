<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { decimalFix } from '@/utils/number-func';
import {
  blockInvalidNumericKeys,
  normalizePositiveDecimal,
  positiveDecimalRules,
  sanitizePositiveDecimalInput,
  selectRequiredRule,
} from '@/utils/rules';
import type { Income, Item } from '@/misc/type';

const { createIncome } = useIncome();
const { searchPlatform } = usePlatform();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps<{
  item: Item
}>();

const formRef = ref();
const confirmLossDialog = ref(false);
const income = ref({
  income_sell_price: '',
  platform_id: '',
  note: '',
});

const platform_items = ref<{ title: string, value: string }[]>([]);
const sellPriceRules = positiveDecimalRules(t, t('income.income_sell_price'), 2);
const platformRules = [selectRequiredRule(t, t('income.platform_id'))];

const normalizedSellPrice = computed(() => normalizePositiveDecimal(income.value.income_sell_price, 2) || 0);
const profitAmount = computed(() => normalizedSellPrice.value - props.item.item_buy_price);
const isProfit = computed(() => profitAmount.value > 0);

const sanitizeSellPrice = () => {
  income.value.income_sell_price = sanitizePositiveDecimalInput(income.value.income_sell_price, 2);
};

const fetchPlatform = async () => {
  const res = await searchPlatform();
  platform_items.value = res.map((p) => ({ title: p.platform_name, value: p.platform_id }));
};

onMounted(async () => {
  await fetchPlatform();
});

const saveIncome = async () => {
  try {
    await createIncome({
      income_sell_price: normalizedSellPrice.value,
      platform_id: income.value.platform_id,
      note: income.value.note,
      item_id: props.item.item_id,
    } as Partial<Income>);

    success(t('message.submit_success'));
    emit('done', true);
  } catch {
    error(t('message.submit_error'));
  }
};

const submitForm = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    warning(t('validation.form_invalid'));
    return;
  }

  if (normalizedSellPrice.value <= 0) {
    warning(t('validation.positive_number', { field: t('income.income_sell_price') }));
    return;
  }

  if (!isProfit.value) {
    confirmLossDialog.value = true;
    return;
  }

  await saveIncome();
};

const confirmLossAndSubmit = async () => {
  confirmLossDialog.value = false;
  await saveIncome();
};
</script>

<template>
  <FormDialogFrame
    icon="mdi-cash-plus"
    :title="t('income.add_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
    <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
      <v-row class="form-grid">
        <v-col cols="12" md="6">
          <v-text-field v-model="income.income_sell_price" :label="t('income.income_sell_price')" :rules="sellPriceRules"
            variant="outlined" density="comfortable" inputmode="decimal" @keydown="blockInvalidNumericKeys"
            @input="sanitizeSellPrice" @blur="sanitizeSellPrice" />

          <div class="form-meta d-flex flex-column">
            <span>ราคาต้นทุน : {{ decimalFix(props.item.item_buy_price) }} ฿</span>
            <span :class="isProfit ? 'text-success' : 'text-error'">
              {{ isProfit ? 'กำไร' : 'ขาดทุน' }} {{ decimalFix(Math.abs(profitAmount)) }} ฿
            </span>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <v-select v-model="income.platform_id" :items="platform_items" item-value="value" item-title="title"
            :label="t('income.platform_id')" :rules="platformRules" variant="outlined" density="comfortable" />
        </v-col>

        <v-col cols="12">
          <v-textarea v-model="income.note" :label="t('income.income_note')" rows="3" variant="outlined"
            density="comfortable" />
        </v-col>
      </v-row>
    </v-form>

    <v-dialog v-model="confirmLossDialog" max-width="420">
      <FormDialogFrame
        class="form-confirm-dialog"
        icon="mdi-alert-outline"
        :title="t('alert.confirm')"
        :submit-text="t('button.confirm')"
        :cancel-text="t('button.cancel')"
        submit-color="warning"
        @close="confirmLossDialog = false"
        @cancel="confirmLossDialog = false"
        @submit="confirmLossAndSubmit"
      >
        <p class="form-header__subtitle mt-0">{{ t('alert.text_unprofit') }}</p>
      </FormDialogFrame>
    </v-dialog>
  </FormDialogFrame>
</template>
