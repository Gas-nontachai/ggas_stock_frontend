<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Item } from "@/misc/type";

const { updateItemBy, getItemByID } = useItem();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps({
    item_id: {
        type: String,
        required: true,
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
const image_arr = ref<string[]>([]);
const image_delete_arr = ref<string[]>([]);

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    try {
        const response = await getItemByID({ item_id: props.item_id });
        item.value = response;
        image_arr.value = response.item_image.split(',').filter((item) => item !== '');
    } catch (error) {
        console.error('Error fetching item:', error);
    }
};

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
        let condition: { file: File[], delete_arr: string } = {
            file: [],
            delete_arr: '',
        };

        if (buffer_image.value.length) {
            condition.file = buffer_image.value
                .flatMap(item => item.files ?? []);
        }
        if (image_delete_arr.value.length) {
            condition.delete_arr = image_delete_arr.value.join(',');
        }

        await updateItemBy({ item: item.value, ...condition });

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
    <v-card>
        <v-card-title>
            <span class="text-h5">{{ t('Edit New Item') }}</span>
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
                    <v-col cols="12">
                        <v-file-input accept="image/*" @change="uploadFile" :label="t('Item Image')" variant="outlined"
                            multiple prepend-icon="mdi-camera" />

                        <v-list-item-group v-if="image_arr.length" class="mt-4">
                            <v-row dense>
                                <v-col v-for="(img, index) in image_arr" :key="`active-${index}`" cols="12" sm="6"
                                    md="4">
                                    <v-card elevation="2" rounded="lg" class="pa-2" style="position: relative;">
                                        <v-img :src="`${useRuntimeConfig().public.apiBaseUrl}${img.trim()}`"
                                            :alt="`Image ${index + 1}`" cover height="160" class="rounded mb-2"></v-img>
                                        <v-card-actions class="justify-end"
                                            style="position: absolute; top: 5px; right: 5px;">
                                            <v-btn icon color="red-darken-1" @click="removeImage(img)" variant="text">
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-list-item-group>

                        <v-list-item-group v-if="image_delete_arr.length" class="mt-6">
                            <h4 class="text-h6 mb-2">รูปที่กำลังจะลบ</h4>
                            <v-row dense>
                                <v-col v-for="(img, index) in image_delete_arr" :key="`deleted-${index}`" cols="12"
                                    sm="6" md="4">
                                    <v-card elevation="2" rounded="lg" class="pa-2" style="position: relative;">
                                        <v-img :src="`${useRuntimeConfig().public.apiBaseUrl}${img.trim()}`"
                                            :alt="`Image ${index + 1}`" cover height="160" class="rounded mb-2"></v-img>
                                        <v-card-actions class="justify-end"
                                            style="position: absolute; top: 5px; right: 5px;">
                                            <v-btn icon color="green-darken-1" @click="restoreImage(img)"
                                                variant="text">
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
            <v-btn color="error" variant="text" @click="emit('close', true);">{{ t('Cancel') }}</v-btn>
            <v-btn color="primary" variant="elevated" @click="submitForm">{{ t('Save') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>