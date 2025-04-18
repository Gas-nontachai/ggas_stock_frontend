<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const { sendOTP, confirmOTP } = useAuth();

const props = defineProps<{
    user_id: string;
    email: string;
}>();

const otp = ref('');
const loading = ref(false);
const error = ref('');

const cooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const canResend = computed(() => cooldown.value === 0);

const startCooldown = (seconds = 30) => {
    cooldown.value = seconds;
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
        if (cooldown.value > 0) {
            cooldown.value--;
        } else {
            clearInterval(cooldownTimer!);
        }
    }, 1000);
};

const confirmOtp = async () => {
    try {
        loading.value = true;
        const res = await confirmOTP({
            otp: otp.value,
            user_id: props.user_id,
        });

        if (res) {
            emit('done', true);
        }
    } catch (err: any) {
        error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยัน OTP';
    } finally {
        loading.value = false;
    }
};

const reSendOtp = async () => {
    try {
        loading.value = true;
        await sendOTP({ email: props.email });
        Swal.fire({
            icon: 'success',
            title: 'ส่งรหัส OTP สำเร็จ',
            text: `ระบบได้ส่ง OTP ไปยัง ${props.email}`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
        });
        startCooldown();
    } catch (err: any) {
        error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งรหัส OTP';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    startCooldown();
});
</script>

<template>
    <v-card elevation="12" class="pa-6 rounded-xl">
        <!-- Header -->
        <v-card-title class="d-flex justify-space-between align-center pb-4">
            <span class="text-h6 font-weight-bold">
                <v-icon start color="primary" class="mr-2">mdi-shield-key</v-icon>
                {{ t('login.enter_otp') || 'กรอกรหัส OTP' }}
            </span>
            <v-btn icon @click="emit('close')" variant="text">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>

        <!-- Form -->
        <v-form @submit.prevent="confirmOtp" validate-on="submit lazy">
            <v-text-field v-model="otp" :label="t('login.otp') || 'รหัส OTP'" prepend-inner-icon="mdi-numeric"
                variant="outlined" density="comfortable" maxlength="6" counter required />

            <div class="d-flex justify-end mt-1">
                <v-btn variant="text" color="primary" size="small" @click="reSendOtp" :disabled="!canResend || loading">
                    <v-icon start size="small">mdi-email-send</v-icon>
                    <span v-if="canResend">
                        {{ t('button.resend_otp') || 'ส่งรหัส OTP อีกครั้ง' }}
                    </span>
                    <span v-else>
                        {{ `รอ ${cooldown} วินาที` }}
                    </span>
                </v-btn>
            </div>

            <v-btn type="submit" color="primary" class="mt-4" block size="large" :loading="loading"
                :disabled="loading || !otp">
                <v-icon start v-if="!loading">mdi-check</v-icon>
                {{ t('button.confirm_otp') || 'ยืนยันรหัส OTP' }}
            </v-btn>

            <v-alert v-if="error" type="error" class="mt-4" dense border="start" variant="tonal">
                {{ error }}
            </v-alert>
        </v-form>
    </v-card>
</template>
