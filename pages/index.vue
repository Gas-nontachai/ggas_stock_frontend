<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import { decimalFix } from '@/utils/number-func';
import type { Income, Category, Item, Platform } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify'

const { getItemBy } = useItem();
const { getIncomeBy, deleteIncomeBy } = useIncome();
const { getPlatformBy } = usePlatform();
const { getCategoryBy } = useCategory();
const { t, locale } = useI18n();

const theme = useTheme()
const isDarkTheme = computed(() => theme.global.current.value.dark)

const items = ref<Item[]>([]);
const incomes = ref<Income[]>([]);
const categories = ref<Category[]>([]);
const platforms = ref<Platform[]>([]);
const loading = ref(true);
const menu_filter_cat = ref(false);
const menu_filter_plat = ref(false);
const add_incomes_dialog = ref(false);
const edit_incomes_dialog = ref(false);
const income_id_current = ref('');
const search_query = ref('');
const date_selected = ref<[Date, Date] | null>(null);
const selected_category = ref<string[]>([]);
const selected_platform = ref<string[]>([]);
const category_options = ref<{ title: string, value: string }[]>()
const platform_options = ref<{ title: string, value: string }[]>()

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getIncomeBy({ 
            where: {
                platform_id: { $in: selected_platform.value },
                createdAt: {
                    $gt: date_selected.value && Array.isArray(date_selected.value) ? date_selected.value[0] : null,
                    $lt: date_selected.value && Array.isArray(date_selected.value) ? date_selected.value[1] : null,
                },
            },
            include: [
                { model: "Item", attributes: ['item_buy_price', 'item_category_id', 'item_name', 'item_id', 'note'] },
            ]
        });
        console.log(response);
    } catch (error) {
        console.error('Error fetching incomes:', error);
    } finally {
        loading.value = false;
    }
};

const fetchCategory = async () => {
    try {
        const response = await getCategoryBy();
        categories.value = response;
        category_options.value = response.map((item) => ({
            title: item.category_name,
            value: item.category_id,
        }));
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

const fetchPlatform = async () => {
    try {
        const response = await getPlatformBy();
        platforms.value = response;
        platform_options.value = response.map((item) => ({
            title: item.platform_name,
            value: item.platform_id,
        }));
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

onMounted(async () => {
    await fetchData();
    await fetchCategory();
    await fetchPlatform();
}); 
</script>

<template>
    <div>
        <h1>Dashboard</h1>
    </div>
</template>
