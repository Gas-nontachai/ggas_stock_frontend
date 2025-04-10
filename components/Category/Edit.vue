<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Category } from "@/misc/type";

const { getCategoryByID, updateCategoryBy } = useCategory();

const { t } = useI18n();
const emit = defineEmits(['addDone']);

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

        emit('addDone', true);
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

        emit('addDone', false);
    }
};
</script>

<template>
    <v-container class="bg-white">
        <v-form ref="form">
            <v-text-field v-model="category.category_name" :label="t('category.category_name')" required></v-text-field>

            <v-btn color="primary" @click="submitForm">
                {{ t('button.submit') }}
            </v-btn>
        </v-form>
    </v-container>
</template>
