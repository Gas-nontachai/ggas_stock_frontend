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
  <v-card class="app-form-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary" size="small">mdi-cash</v-icon>
        <span class="app-form-title">{{ t('income.add_title') }}</span>
      </div>
      <v-btn icon variant="text" color="secondary" @click="emit('close', true)" size="small">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="income.income_sell_price"
              :label="t('income.income_sell_price')"
              :rules="sellPriceRules"
              inputmode="decimal"
              @keydown="blockInvalidNumericKeys"
              @input="sanitizeSellPrice"
              @blur="sanitizeSellPrice"
            />

            <div class="d-flex flex-column mt-2 app-form-subtitle">
              <span>ราคาต้นทุน : {{ decimalFix(props.item.item_buy_price) }} ฿</span>
              <span :class="isProfit ? 'text-success' : 'text-error'">
                {{ isProfit ? 'กำไร' : 'ขาดทุน' }} {{ decimalFix(Math.abs(profitAmount)) }} ฿
              </span>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="income.platform_id"
              :items="platform_items"
              item-value="value"
              item-title="title"
              :label="t('income.platform_id')"
              :rules="platformRules"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea v-model="income.note" :label="t('income.income_note')" rows="3" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="secondary" variant="text" @click="emit('close', true)">{{ t('button.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submitForm">{{ t('button.submit') }}</v-btn>
    </v-card-actions>

    <v-dialog v-model="confirmLossDialog" max-width="420">
      <v-card>
        <v-card-title>{{ t('alert.confirm') }}</v-card-title>
        <v-card-text>{{ t('alert.text_unprofit') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="confirmLossDialog = false">{{ t('button.cancel') }}</v-btn>
          <v-btn variant="flat" color="primary" @click="confirmLossAndSubmit">{{ t('button.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
