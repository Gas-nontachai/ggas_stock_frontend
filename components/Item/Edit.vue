<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Item } from "@/misc/type";

const { insertItemBy } = useItem();

const { t } = useI18n();
const emit = defineEmits(['addDone']);

const item = ref<Item>({
    item_id: '',
    item_name: '',
    item_buy_price: 0,
    note: '',
    item_image: '',
    item_status: 1,
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
        await insertItemBy(item.value);

        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Item added successfully!',
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
    <v-card>
        <v-card-title>
            <span class="text-h5">{{ t('Add New Item') }}</span>
        </v-card-title>
        <v-card-text>
            <v-form>
                <v-row>
                    <v-col cols="12">
                        <v-text-field :label="t('Item Name')" variant="outlined" required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field :label="t('Price')" variant="outlined" type="number" required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea :label="t('Note')" variant="outlined" rows="3"></v-textarea>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input :label="t('Item Image')" variant="outlined" accept="image/*"
                            prepend-icon="mdi-camera"></v-file-input>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text">{{ t('Cancel') }}</v-btn>
            <v-btn color="primary" variant="elevated">{{ t('Save') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>
