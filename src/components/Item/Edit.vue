<script setup lang="ts">
import { onMounted, ref, type PropType } from 'vue';
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

const { updateItem, getItem } = useItem();
const { uploadFilesAndGetPublicUrls } = useStorage();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

const props = defineProps({
  item_id: {
    type: String,
    required: true,
  },
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
const image_arr = ref<string[]>([]);
const image_delete_arr = ref<string[]>([]);
const itemNameRules = [requiredRule(t, t('item.item_name'))];
const itemPriceRules = positiveDecimalRules(t, t('item.item_price'), 2);
const itemCategoryRules = [selectRequiredRule(t, t('item.item_category'))];

const sanitizePrice = () => {
  item.value.item_buy_price = sanitizePositiveDecimalInput(item.value.item_buy_price, 2);
};

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  try {
    const response = await getItem(props.item_id);
    item.value = {
      item_name: response.item_name || '',
      item_buy_price: String(response.item_buy_price ?? ''),
      note: response.note || '',
      item_category_id: response.item_category_id || '',
    };
    image_arr.value = Array.isArray(response.item_image) ? [...response.item_image] : [];
  } catch {
    error(t('message.load_error'));
  }
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
    const uploadedUrls = await uploadFilesAndGetPublicUrls(files);

    await updateItem(props.item_id, {
      item_name: item.value.item_name.trim(),
      item_buy_price: buyPrice,
      note: item.value.note,
      item_category_id: item.value.item_category_id,
      item_status: 1,
      image_urls: [...image_arr.value, ...uploadedUrls],
    });
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

const removeImage = (img: string) => {
  const index = image_arr.value.indexOf(img);
  if (index !== -1) {
    image_arr.value.splice(index, 1);
    image_delete_arr.value.push(img);
  }
};

const restoreImage = (img: string) => {
  const index = image_delete_arr.value.indexOf(img);
  if (index !== -1) {
    image_delete_arr.value.splice(index, 1);
    image_arr.value.push(img);
  }
};
</script>

<template>
  <v-card class="app-form-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary" size="small">mdi-cart-plus</v-icon>
        <span class="app-form-title">{{ t('item.edit_title') }}</span>
      </div>
      <v-btn icon variant="text" color="secondary" @click="emit('close', true)" size="small">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="item.item_name" :label="t('item.item_name')" :rules="itemNameRules" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="item.item_buy_price"
              :label="t('item.item_price')"
              :rules="itemPriceRules"
              inputmode="decimal"
              @keydown="blockInvalidNumericKeys"
              @input="sanitizePrice"
              @blur="sanitizePrice"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="item.note" :label="t('item.item_note')" variant="outlined"
              rows="3"></v-textarea>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="item.item_category_id"
              :items="props.category_items"
              item-value="value"
              item-title="title"
              :label="t('item.item_category')"
              :rules="itemCategoryRules"
            />
          </v-col>

          <v-col cols="12">
            <v-file-input accept="image/*" @change="uploadFile" :label="t('item.item_image')"
              variant="outlined" multiple prepend-icon="mdi-camera" />

            <v-list-item-group v-if="image_arr.length" class="mt-4">
              <v-row dense>
                <v-col v-for="(img, index) in image_arr" :key="`active-${index}`" cols="12" sm="6" md="4">
                  <v-card elevation="2" rounded="lg" class="pa-2" style="position: relative;">
                    <v-img :src="img" :alt="`Image ${index + 1}`" cover height="160" class="rounded mb-2"></v-img>
                    <v-card-actions class="justify-end" style="position: absolute; top: 5px; right: 5px;">
                      <v-btn icon color="red-darken-1" @click="removeImage(img)" variant="text">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-list-item-group>

            <v-list-item-group v-if="image_delete_arr.length" class="mt-6">
              <h4 class="text-h6 mb-2">{{ t('item.item_image_delete') }}</h4>
              <v-row dense>
                <v-col v-for="(img, index) in image_delete_arr" :key="`deleted-${index}`" cols="12" sm="6" md="4">
                  <v-card elevation="2" rounded="lg" class="pa-2" style="position: relative;">
                    <v-img :src="img" :alt="`Image ${index + 1}`" cover height="160" class="rounded mb-2"></v-img>
                    <v-card-actions class="justify-end" style="position: absolute; top: 5px; right: 5px;">
                      <v-btn icon color="green-darken-1" @click="restoreImage(img)" variant="text">
                        <v-icon>mdi-undo</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-list-item-group>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="secondary" variant="text" @click="emit('close', true)">{{ t('button.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submitForm">{{ t('button.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
