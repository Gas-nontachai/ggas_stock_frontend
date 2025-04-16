<script setup lang="ts">
import Swal from 'sweetalert2';
import type { Item, Category } from "@/misc/type";
import { useRouter } from 'vue-router';
import { formatDate } from '@/utils/date-func';
import { decimalFix } from '@/utils/number-func';
import { useI18n } from 'vue-i18n';

const { deleteItemBy } = useItem();
const { getIncomeBy, updateIncomeBy } = useIncome();
const router = useRouter();
const { t } = useI18n();

const props = defineProps({
    items: {
        type: Array as PropType<Item[]>,
        required: true
    },
    categories: {
        type: Array as PropType<Category[]>,
        required: true
    }
    , status: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['fetchData', 'openEdit']);
const item_current = ref<Item>()
const income_item_dialog = ref(false)

const viewItemDetails = (item_id: string) => {
    router.push(`/item/detail?item_id=${item_id}`);
};

const getCategoryName = (category_id: string) => {
    const category = props.categories.find(cat => cat.category_id === category_id);
    return category ? category.category_name : 'category';
};

const deleteItem = async (item_id: string) => {
    const result = await Swal.fire({
        title: t('alert.confirm'),
        text: t("alert.text_delete"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('button.confirm'),
        customClass: {
            confirmButton: 'swal2-confirm-white',
            cancelButton: 'swal2-cancel-white',
        },
    });

    if (result.isConfirmed) {
        try {
            await deleteItemBy({ item_id });
            await emit('fetchData', true)
            await Swal.fire({
                title: t('message.delete_success_title'),
                text: t('message.delete_success_text'),
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            await Swal.fire({
                title: t('message.delete_unsuccess_title'),
                text: t('message.delete_unsuccess_text'),
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        }
    }
};

const markSold = async (item_id: string) => {
    const result = await Swal.fire({
        title: t('alert.confirm'),
        text: t("alert.text_mark_sold"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('button.confirm'),
        customClass: {
            confirmButton: 'swal2-confirm-white',
            cancelButton: 'swal2-cancel-white',
        },
    });

    if (result.isConfirmed) {
        try {
            item_current.value = props.items.find(i => i.item_id === item_id);
            income_item_dialog.value = true
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }
};

const markReSell = async (item_id: string) => {
    const result = await Swal.fire({
        title: t('alert.confirm'),
        text: t("alert.text_mark_re_sell"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('button.confirm'),
        customClass: {
            confirmButton: 'swal2-confirm-white',
            cancelButton: 'swal2-cancel-white',
        },
    });

    if (result.isConfirmed) {
        try {
            const res = await getIncomeBy({
                where: {
                    item_id: {
                        item_id
                    }
                }
            })
            console.log(res[0]);
            await updateIncomeBy(res[0], 'mark_re_sell')
            await emit('fetchData', true)
            await Swal.fire({
                title: t('message.delete_success_title'),
                text: t('message.delete_success_text'),
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
            });
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    }
};

const editItem = (item_id: string) => {
    emit('openEdit', item_id);
};

const done = async () => {
    income_item_dialog.value = false
    await emit('fetchData', true)
};
</script>

<template>
    <v-card v-if="props.items.length === 0" class="text-center pa-6">
        <v-icon icon="mdi-alert-circle-outline" size="large" class="mb-2" color="warning"></v-icon>
        <p class="text-body-1 mb-4">{{ t('No items found') }}</p>
        <v-btn color="primary" @click="() => emit('fetchData', true)">{{ t('Refresh') }}</v-btn>
    </v-card>

    <v-row v-else>
        <v-col v-for="item in props.items" :key="item.item_id" cols="12" sm="6" md="4" lg="3">
            <v-card class="h-100">
                <div :class="{
                    'opacity-50': props.status === 0
                }">
                    <v-carousel v-if="item.item_image" height="300"
                        :show-arrows="item.item_image.split(',').length > 1">
                        <v-carousel-item v-for="(img, index) in item.item_image.split(',')" :key="index">
                            <v-img :src="`${useRuntimeConfig().public.apiBaseUrl}${img.trim()}`"
                                :alt="`Image ${index + 1}`" cover class="bg-grey-lighten-2"
                                style="object-fit: cover; height: 300px;" />
                        </v-carousel-item>
                    </v-carousel>
                    <v-img v-else src="/default-cart.png" height="200" cover class="bg-grey-lighten-2"
                        style="object-fit: cover; height: 300px;">
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-icon icon="mdi-image" size="large" color="grey-lighten-1" />
                            </div>
                        </template>
                    </v-img>
                </div>

                <div :class="{
                    'opacity-70': props.status === 0
                }">
                    <div class="d-flex flex-column justify-center align-start px-2">
                        <v-card-title :class="{
                            'text-truncate': true,
                            'text-decoration-line-through': props.status === 0
                        }">
                            {{ item.item_name }}
                        </v-card-title>
                        <v-chip variant="tonal" color="warning" class="px-2">
                            {{ getCategoryName(item.item_category_id) }}
                        </v-chip>
                    </div>

                    <v-card-text>
                        <div class="d-flex align-end justify-space-between">
                            <div>
                                <div class="d-flex align-center mb-2">
                                    <v-icon icon="mdi-currency-thb" class="mr-1" color="success" />
                                    <span :class="{
                                        'text-h6': true,
                                        'font-weight-bold': true,
                                        'text-truncate': true,
                                        'text-decoration-line-through': props.status === 0
                                    }">
                                        {{ decimalFix(item.item_buy_price) }}
                                    </span>
                                </div>

                                <div v-if="item.note" class="text-body-2 text-truncate mb-2">
                                    {{ item.note }}
                                </div>

                                <div class="d-flex align-center  text-grey">
                                    <v-icon icon="mdi-clock-outline" size="small" class="mr-1" />
                                    {{ formatDate(item.createdAt) }}
                                </div>
                            </div>
                            <v-menu bottom right>
                                <template v-slot:activator="{ props }">
                                    <v-btn icon variant="text" size="small" v-bind="props">
                                        <v-chip color="primary">
                                            <v-icon>mdi-dots-vertical</v-icon>
                                        </v-chip>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item @click="viewItemDetails(item.item_id)">
                                        <div class="d-flex">
                                            <v-icon left>mdi-eye</v-icon>
                                            <v-list-item-title>{{ t('button.detail') }}</v-list-item-title>
                                        </div>
                                    </v-list-item>
                                    <v-list-item @click="editItem(item.item_id)">
                                        <div class="d-flex">
                                            <v-icon>mdi-pencil</v-icon>
                                            <v-list-item-title>{{ t('button.edit') }}</v-list-item-title>
                                        </div>
                                    </v-list-item>
                                    <v-list-item @click="deleteItem(item.item_id)">
                                        <div class="d-flex">
                                            <v-icon>mdi-delete</v-icon>
                                            <v-list-item-title>{{ t('button.delete') }}</v-list-item-title>
                                        </div>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </v-card-text>
                    <template v-if="props.status === 1">
                        <v-card-actions class="d-flex justify-end pa-4">
                            <v-btn variant="outlined" color="success" class="text-capitalize"
                                prepend-icon="mdi-check-circle-outline" @click="markSold(item.item_id)">
                                {{ t('item.mark_sold') }}
                            </v-btn>
                        </v-card-actions>
                    </template>
                    <template v-else>
                        <v-card-actions class="d-flex justify-end pa-4">
                            <v-btn variant="outlined" color="success" class="text-capitalize"
                                prepend-icon="mdi-check-circle-outline" @click="markReSell(item.item_id)">
                                {{ t('item.mark_unsold') }}
                            </v-btn>
                        </v-card-actions>
                    </template>
                </div>
            </v-card>
        </v-col>
    </v-row>

    <v-dialog v-model="income_item_dialog" v-if="item_current" max-width="600px">
        <IncomeAdd :item="item_current" @done="done" @close="() => { income_item_dialog = false }" />
    </v-dialog>
</template>