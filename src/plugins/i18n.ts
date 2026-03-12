import { defineNuxtPlugin } from '#app';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import th from '@/locales/th.json';

export type MessageSchema = typeof en;
export type Locale = 'en' | 'th';

const i18n = createI18n<[MessageSchema], Locale>({
    locale: 'th',
    legacy: false,
    globalInjection: true,
    messages: {
        en,
        th
    },
});

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(i18n);
});
