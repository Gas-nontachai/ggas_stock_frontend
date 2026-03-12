<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { requiredRule, selectRequiredRule } from '@/utils/rules';
import type { Category } from '@/misc/type';

const { createCategory } = useCategory();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

const category = ref<Category>({
  category_id: '',
  category_name: '',
  use_for: '',
});

const use_for_item = [
  { title: t('category.item'), value: 'item' },
  { title: t('category.expense'), value: 'expense' },
];

const categoryNameRules = [requiredRule(t, t('category.category_name'))];
const useForRules = [selectRequiredRule(t, t('category.use_for'))];

const submitForm = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    warning(t('validation.form_invalid'));
    return;
  }

  try {
    await createCategory({
      category_name: category.value.category_name.trim(),
      use_for: category.value.use_for,
    });
    success(t('message.submit_success'));
    emit('done', true);
  } catch {
    error(t('message.submit_error'));
  }
};
</script>

<template>
  <FormDialogFrame
    icon="mdi-folder"
    :title="t('category.add_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
    <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
      <v-row class="form-grid">
        <v-col cols="12" md="6">
          <v-text-field v-model="category.category_name" :label="t('category.category_name')" :rules="categoryNameRules"
            variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="category.use_for" :items="use_for_item" item-title="title" item-value="value"
            :label="t('category.use_for')" :rules="useForRules" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>
    </v-form>
  </FormDialogFrame>
</template>
