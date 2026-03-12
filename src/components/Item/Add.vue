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
import type { Item } from '@/misc/type';

const { createItem } = useItem();
const { uploadFilesAndGetPublicUrls } = useStorage();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

const props = defineProps({
  category_items: {
    type: Array as PropType<{ title: string, value: string }[]>,
  },
});

const item = ref({
  item_name: '',
  item_buy_price: '',
  note: '',
  item_category_id: '',
});

const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);
const itemNameRules = [requiredRule(t, t('item.item_name'))];
const itemPriceRules = positiveDecimalRules(t, t('item.item_price'), 2);
const itemCategoryRules = [selectRequiredRule(t, t('item.item_category'))];

const sanitizePrice = () => {
  item.value.item_buy_price = sanitizePositiveDecimalInput(item.value.item_buy_price, 2);
};

const submitForm = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    warning(t('validation.form_invalid'));
    return;
  }

  const buyPrice = normalizePositiveDecimal(item.value.item_buy_price, 2);
  if (!buyPrice) {
    warning(t('validation.positive_number', { field: t('item.item_price') }));
    return;
  }

  try {
    const files = buffer_image.value.flatMap((entry) => entry.files ?? []);
    const image_urls = await uploadFilesAndGetPublicUrls(files);

    await createItem({
      item_name: item.value.item_name.trim(),
      item_buy_price: buyPrice,
      note: item.value.note,
      item_category_id: item.value.item_category_id,
      item_status: 1,
      image_urls,
    } as Partial<Item>);

    success(t('message.submit_success'));
    emit('done', true);
  } catch {
    error(t('message.submit_error'));
  }
};

function uploadFile(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    for (const file of target.files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        buffer_image.value = [...buffer_image.value, {
          files: [file],
          src: reader.result as string,
        }];
      };
      reader.readAsDataURL(file);
    }
  }
}
</script>

<template>
  <FormDialogFrame
    icon="mdi-cart-plus"
    :title="t('item.add_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
    <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
      <v-row class="form-grid">
        <v-col cols="12">
          <v-text-field v-model="item.item_name" :label="t('item.item_name')" :rules="itemNameRules" variant="outlined"
            density="comfortable" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="item.item_buy_price" :label="t('item.item_price')" :rules="itemPriceRules"
            variant="outlined" density="comfortable" inputmode="decimal" @keydown="blockInvalidNumericKeys"
            @input="sanitizePrice" @blur="sanitizePrice" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="item.item_category_id" :items="props.category_items" item-value="value" item-title="title"
            :label="t('item.item_category')" :rules="itemCategoryRules" variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="item.note" :label="t('item.item_note')" variant="outlined" density="comfortable"
            rows="3" />
        </v-col>
        <v-col cols="12">
          <v-file-input accept="image/*" @change="uploadFile" :label="t('item.item_image')" variant="outlined"
            density="comfortable" multiple prepend-icon="mdi-camera" />
        </v-col>
      </v-row>
    </v-form>
  </FormDialogFrame>
</template>
