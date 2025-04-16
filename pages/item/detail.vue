<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { formatDate } from '@/utils/date-func';
import { decimalFix } from '@/utils/number-func';
import { useI18n } from 'vue-i18n';
import type { Income, Item, User } from '@/misc/type';

const { t } = useI18n();
const route = useRoute();
const { getItemBy } = useItem();
const { getIncomeBy } = useIncome();
const { getUserBy } = useUser();
const item_id = route.query.item_id as string;

const tab = ref("specifications")
const item = ref<Item>({
    item_id: '',
    item_name: '',
    item_buy_price: 0,
    note: '',
    item_image: '',
    item_category_id: '',
    item_status: 0,
});
const income = ref<Income>({
    income_id: '',
    income_sell_price: 0,
    platform_id: '',
    note: '',
    item_id: '',
});
const isLoading = ref(true);
const isSold = ref(false);
const users = ref<User[]>([]);

onMounted(async () => {
    try {
        const response = await getItemBy({
            where: { item_id: item_id },
            include: [
                {
                    model: "category",
                    attributes: ['category_name'],
                },
            ],
        });
        item.value = response[0];

        const res_user = await getUserBy();
        users.value = res_user

        item.value.item_status == 1 ? isSold.value = false : isSold.value = true;

        if (isSold.value) {
            const response = await getIncomeBy({
                where: { item_id: item_id }, include: [
                    {
                        model: "platform",
                        attributes: ['platform_name'],
                    },
                ],
            });
            income.value = response[0];
            tab.value = 'sold'
        }

    } catch (error) {
        console.error('Error fetching detail:', error);
    } finally {
        isLoading.value = false
    }
});

const getUserName = (user_id: string) => {
    const user = users.value.find(u => u.user_id === user_id);
    return user ? user.username : 'username';
};
</script>

<template>
    <v-container>
        <template v-if="isLoading">
            <v-row justify="center">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </v-col>
            </v-row>
        </template>
        <template v-else>
            <v-row justify="center">
                <v-col cols="12" md="6">
                    <v-carousel v-if="item.item_image" height="300"
                        :show-arrows="item.item_image.split(',').length > 1">
                        <v-carousel-item v-for="(img, index) in item.item_image.split(',')" :key="index">
                            <v-img :src="`${useRuntimeConfig().public.apiBaseUrl}${img.trim()}`"
                                :alt="`${t('image')} ${index + 1}`" cover class="bg-grey-lighten-2"
                                style="object-fit: cover; height: 300px;" />
                        </v-carousel-item>
                    </v-carousel>
                    <v-img v-else src="/default-cart.png" alt="{{ t('no_image_available') }}" height="300" cover
                        class="bg-grey-lighten-2" />
                </v-col>
                <v-col cols="12" md="6">
                    <v-card elevation="2" class="pa-4">
                        <v-card-title class="text-h4 font-weight-bold mb-2">{{ item.item_name }}</v-card-title>

                        <v-divider class="my-3"></v-divider>

                        <v-card-text>
                            <div class="font-weight-medium mb-3">
                                {{ t('item.item_price') }}: <span class="text-primary">${{
                                    decimalFix(item.item_buy_price)
                                    }}</span>
                            </div>

                            <div v-if="item.note" class="mb-4">
                                <div class=" font-weight-medium mb-1">{{ t('item.item_note') }}:</div>
                                <div>{{ item.note }}</div>
                            </div>

                            <div class="d-flex align-center mb-2">
                                <div class=" font-weight-medium me-2">{{ t('item.item_status') }}:</div>
                                <v-chip :color="item.item_status === 1 ? 'success' : 'error'" text-color="white"
                                    size="small">
                                    {{ item.item_status === 1 ? t('item.active') : t('item.inactive') }}
                                </v-chip>
                            </div>
                        </v-card-text>

                        <v-card-actions>

                            <v-spacer></v-spacer>

                            <v-btn variant="text" color="info" prepend-icon="mdi-arrow-left" to="/item">
                                {{ t('button.back') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mt-6">
                <v-col cols="12">
                    <v-tabs v-model="tab">
                        <v-tab value="sold" v-if="isSold">{{ t('item.sold_data') }}</v-tab>
                        <v-tab value="specifications">{{ t('item.specifications') }}</v-tab>
                        <v-tab value="related">{{ t('item.related_items') }}</v-tab>
                    </v-tabs>

                    <v-card class="mt-2">
                        <v-window v-model="tab">
                            <v-window-item value="sold" v-if="isSold">
                                <v-card-text>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-cash"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('income.income_id') }} : {{ income.income_id
                                                }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-cash"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('income.income_sell_price') }} : {{
                                                decimalFix(income.income_sell_price) }}฿</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-cash"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('income.profit') }} : {{
                                                decimalFix(income.income_sell_price - item.item_buy_price)
                                                }}฿</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-note-text"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('income.income_note') }} : {{ income.note
                                            }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-web"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('platform.platform_name') }} : {{
                                                income.tb_platform?.platform_name }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-window-item>

                            <v-window-item value="specifications">
                                <v-card-text>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-barcode"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('item.item_id') }} : {{ item.item_id
                                                }}</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-tag-outline"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('category.category_name') }} : {{
                                                item.tb_category?.category_name
                                                }}</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-currency-thb"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('item.item_price') }}: {{
                                                decimalFix(item.item_buy_price) }}
                                                ฿</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-window-item>

                            <v-window-item value="related">
                                <v-card-text>
                                    <v-list>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-account"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('item.addby') }} : {{ getUserName(item.addby || '')
                                                }}</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-calendar-clock"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('item.add_date') }} : {{ formatDate(item.createdAt)
                                                }}</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-account-edit"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('item.update_by') }} : {{ getUserName(item.updateby
                                                ||
                                                '') }}</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item>
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-calendar-edit"></v-icon>
                                            </template>
                                            <v-list-item-title>{{ t('item.update_date') }} : {{
                                                formatDate(item.updatedAt)
                                            }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-window-item>
                        </v-window>
                    </v-card>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>
