<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Category } from "@/misc/type";

const { getCategoryByID, updateCategoryBy } = useCategory();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps({
    category_id: {
        type: String,
        required: true,
    },
});

const category = ref<Category>({
    category_id: '',
    category_name: '',
    category_image: '',
});

onMounted(async () => {
    try {
        const response = await getCategoryByID({ category_id: props.category_id });
        category.value = response;
    } catch (error) {
        console.error('Error fetching category:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load category data. Please try again later.',
        });
    }
});

const submitForm = async () => {
    if (!category.value.category_name) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Category Name',
            text: 'Please provide a category name before submitting.',
        });
        return;
    }

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
        await updateCategoryBy(category.value);

        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Category updated successfully!',
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

        emit('done', false);
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
                            mdi-folder
                        </v-icon>
                        <span class="text-h5 font-weight-medium gradient-text">{{ t('expense.add_title') }}</span>
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
                        <v-text-field v-model="category.category_name" :label="t('category.category_name')"
                            variant="outlined" required></v-text-field>
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
