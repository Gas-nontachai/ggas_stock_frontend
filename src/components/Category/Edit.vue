<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { requiredRule, selectRequiredRule } from '@/utils/rules';
import type { Category } from '@/misc/type';

const { getCategory, updateCategory } = useCategory();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

const props = defineProps({
    category_id: {
        type: String,
        required: true,
    },
});

const use_for_item = [
  { title: t('category.item'), value: 'item' },
  { title: t('category.expense'), value: 'expense' },
];
const categoryNameRules = [requiredRule(t, t('category.category_name'))];
const useForRules = [selectRequiredRule(t, t('category.use_for'))];

const category = ref<Category>({
    category_id: '',
    category_name: '',
    use_for: '',
});

onMounted(async () => {
    try {
        const response = await getCategory(props.category_id);
        category.value = response;
    } catch {
        error(t('message.load_error'));
    }
});

const submitForm = async () => {
    const validation = await formRef.value?.validate();
    if (!validation?.valid) {
        warning(t('validation.form_invalid'));
        return;
    }

    try {
        await updateCategory(props.category_id, {
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
    <v-card class="app-form-card">
        <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
                <v-icon color="primary" size="small">mdi-folder</v-icon>
                <span class="app-form-title">{{ t('category.edit_title') }}</span>
            </div>
            <v-btn icon variant="text" color="secondary" @click="emit('close', true)" size="small">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text>
            <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="category.category_name" :label="t('category.category_name')" :rules="categoryNameRules" />
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="category.use_for"
                            :items="use_for_item"
                            item-value="value"
                            item-title="title"
                            :label="t('category.use_for')"
                            :rules="useForRules"
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
