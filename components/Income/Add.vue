<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import { decimalFix } from '@/utils/number-func';
import type { Income, Item } from "@/misc/type";

const { insertIncomeBy } = useIncome();
const { getPlatformBy } = usePlatform();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps<{
    item: Item
}>();

const income = ref<Income>({
    income_id: '',
    income_sell_price: 0,
    platform_id: '',
    note: '',
    item_id: props.item.item_id,
});

const platform_items = ref<{ title: string, value: string }[]>([]);

const profitAmount = computed(() => income.value.income_sell_price - props.item.item_buy_price);
const isProfit = computed(() => profitAmount.value > 0);
const profitStatus = computed(() => isProfit.value ? 'กำไร' : 'ขาดทุน');

const fetchPlatform = async () => {
    const res = await getPlatformBy();
    platform_items.value = res.map(p => ({ title: p.platform_name, value: p.platform_id }));
};

onMounted(async () => {
    await fetchPlatform();
});

const submitForm = async () => {
    if (!isProfit.value) {
        const result = await Swal.fire({
            title: t('alert.confirm'),
            text: t('alert.text_unprofit'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('button.confirm'),
            cancelButtonText: t('button.cancel'),
            customClass: {
                confirmButton: 'swal2-confirm-white',
                cancelButton: 'swal2-cancel-white',
            },
        });

        if (!result.isConfirmed) {
            return;
        }
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
        await insertIncomeBy(income.value);

        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Income added successfully!',
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
                            mdi-cash
                        </v-icon>
                        <span class="text-h5 font-weight-medium gradient-text">{{ t('income.add_title') }}</span>
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
                        <v-text-field v-model="income.income_sell_price" :label="t('income.income_sell_price')"
                            variant="outlined" type="number" required></v-text-field>

                        <div class="d-flex flex-col mt-2">
                            <span class="text-red">
                                ราคาต้นทุน : {{ decimalFix(props.item.item_buy_price) }} ฿
                            </span>
                            <span :class="isProfit ? 'text-green' : 'text-red'">
                                {{ profitStatus }} {{ decimalFix(Math.abs(profitAmount)) }} ฿
                            </span>
                        </div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-select v-model="income.platform_id" :items="platform_items" item-value="value"
                            item-text="title" :label="t('income.platform_id')" variant="outlined" required />
                    </v-col>
                    <v-col cols="12">
                        <v-textarea v-model="income.note" :label="t('income.income_note')" variant="outlined"
                            rows="3"></v-textarea>
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
