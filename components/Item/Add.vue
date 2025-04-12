<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Item } from "@/misc/type";

const { insertItemBy } = useItem();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps({
    category_items: {
        type: Array as PropType<{ title: string, value: string }[]>,
    },
});

const item = ref<Item>({
    item_id: '',
    item_name: '',
    item_buy_price: 0,
    note: '',
    item_image: '',
    item_category_id: '',
    item_status: 0,
});

const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);

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
        let condition: { file: File[] } = {
            file: []
        };

        if (buffer_image.value.length) {
            condition.file = buffer_image.value
                .flatMap(item => item.files ?? []);
        }

        await insertItemBy({ item: item.value, ...condition });

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

function uploadFile(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files?.length) {
        for (const file of target.files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newItem = {
                    files: [file],
                    src: reader.result as string,
                };
                buffer_image.value = [...buffer_image.value, newItem];
            };
            reader.readAsDataURL(file);
        }
    }
} 
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
                        <v-text-field v-model="item.item_name" :label="t('Item Name')" variant="outlined"
                            required></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="item.item_buy_price" :label="t('Price')" variant="outlined" type="number"
                            required></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea v-model="item.note" :label="t('Note')" variant="outlined" rows="3"></v-textarea>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select v-model="item.item_category_id" :items="props.category_items" item-value="value"
                            item-text="title" :label="t('Select Category')" variant="outlined" required />
                    </v-col>

                    <v-col cols="12">
                        <v-file-input accept="image/*" @change="uploadFile" :label="t('Item Image')" variant="outlined"
                            multiple prepend-icon="mdi-camera" />
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="emit('close', true);">{{ t('Cancel') }}</v-btn>
            <v-btn color="primary" variant="elevated" @click="submitForm">{{ t('Save') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>
