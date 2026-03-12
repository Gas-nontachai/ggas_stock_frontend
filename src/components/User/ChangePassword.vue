<script setup lang="ts">
import { PasswordRules } from '@/utils/rules';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const { changePassword } = useAuth();

const props = defineProps<{
    user_id: string;
}>();

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const isMatch = computed(() => password.value === confirmPassword.value);
const canSubmit = computed(() => password.value && isMatch.value && !loading.value);

const confirmOtp = async () => {
    try {
        loading.value = true;
        const res = await changePassword({
            new_password: password.value,
            user_id: props.user_id
        });
        if (res) {
            emit('done', true);
        }
    } catch (err: any) {
        error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <v-card elevation="12" class="pa-6 rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center pb-4">
            <span class="text-h6 font-weight-bold">
                <v-icon start color="primary" class="mr-2">mdi-lock-reset</v-icon>
                {{ t('login.set_new_password') || 'ตั้งรหัสผ่านใหม่' }}
            </span>
            <v-btn icon @click="emit('close')" variant="text">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>

        <v-form @submit.prevent="confirmOtp" validate-on="submit lazy">
            <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'"
                :label="t('login.password') || 'รหัสผ่านใหม่'" prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword" variant="outlined" density="comfortable" required
                class="mt-4" :rules="PasswordRules" />

            <v-text-field v-model="confirmPassword" :type="showPassword ? 'text' : 'password'"
                :label="t('login.confirm_password') || 'ยืนยันรหัสผ่าน'" prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword" variant="outlined" density="comfortable" required
                class="mt-4" :error="!!confirmPassword && !isMatch"
                :error-messages="!isMatch && confirmPassword ? ['รหัสผ่านไม่ตรงกัน'] : []" />

            <v-btn type="submit" color="primary" class="mt-4" block size="large" :loading="loading"
                :disabled="!canSubmit">
                <v-icon start v-if="!loading">mdi-check</v-icon>
                {{ t('button.confirm_password') || 'ยืนยันรหัสผ่าน' }}
            </v-btn>

            <v-alert v-if="error" type="error" class="mt-4" dense border="start" variant="tonal">
                {{ error }}
            </v-alert>
        </v-form>
    </v-card>
</template>
