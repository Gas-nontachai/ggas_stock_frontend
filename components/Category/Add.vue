<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Category } from "@/misc/type";

const { insertCategoryBy } = useCategory();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const category = ref<Category>({
    category_id: '',
    category_name: '',
    use_for: '',
});

const use_for_item = ['item', 'expense']

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
        emit('done', true);
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
                    <v-col cols="12" md="6">
                        <v-text-field v-model="category.category_name" :label="t('category.category_name')"
                            variant="outlined" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select v-model="category.use_for" :items="use_for_item" expense-value="value"
                            expense-text="title" :label="t('category.use_for')" variant="outlined" required></v-select>
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
