<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Category } from "@/misc/type";

const { insertCategoryBy } = useCategory();

const { t } = useI18n();
const emit = defineEmits(['addDone']);

const category = ref<Category>({
    category_id: '',
    category_name: '',
    category_image: '',
});

const submitForm = async () => {
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
        await insertCategoryBy(category.value);

        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Category added successfully!',
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
        emit('addDone', true);
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
