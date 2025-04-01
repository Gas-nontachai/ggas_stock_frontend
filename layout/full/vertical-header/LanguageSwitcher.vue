<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const currentLocale = ref<'en' | 'th'>('th');

const changeLocale = () => {
    currentLocale.value = currentLocale.value === 'en' ? 'th' : 'en';
    localStorage.setItem("lang", currentLocale.value);
    locale.value = currentLocale.value;
};

onMounted(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
        currentLocale.value = savedLang as 'en' | 'th';
        locale.value = currentLocale.value;
    }
});
</script>

<template>
    <div class="language-switcher">
        <v-btn id="locale-select" @click="changeLocale" class="locale-btn">
            <img :src="currentLocale === 'en'
                ? 'https://cdn-icons-png.flaticon.com/128/197/197374.png'
                : 'https://cdn-icons-png.flaticon.com/128/197/197452.png'" class="flag-icon" />
            <span class="d-none d-md-inline ml-4  d-md-ml-0">
                {{ currentLocale === 'en' ? 'English' : 'ไทย' }}
            </span>
        </v-btn>
    </div>
</template>

<style scoped>
.language-switcher {
    display: inline-block;
}

.locale-btn {
    font-size: 14px;
    border-radius: 50px;
    background: #fff;
    color: #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.flag-icon {
    width: 24px;
    height: 24px;
}
</style>
