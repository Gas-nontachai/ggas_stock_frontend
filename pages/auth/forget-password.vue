<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'

definePageMeta({
    layout: 'blank',
})

const { t } = useI18n()
const { sendOTP } = useAuth()
const router = useRouter()

const email = ref('')
const loading = ref(false)
const confirm_otp_dialog = ref(false)
const change_ps_dialog = ref(false)
const error = ref('')
const user_id_otp = ref('')

const sendOtp = async () => {
    try {
        loading.value = true
        const res = await sendOTP({ email: email.value })

        if (res) {
            user_id_otp.value = res.user_id
            confirm_otp_dialog.value = true
        }
    } catch (err: any) {
        error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    } finally {
        loading.value = false
    }
}

const done = () => {
    confirm_otp_dialog.value = false
    change_ps_dialog.value = true
}

const reserPWdone = () => {
    confirm_otp_dialog.value = false
    change_ps_dialog.value = false
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Change Password successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
    });
    router.push('login')
}
</script>

<template>
    <v-container class="fill-height bg-grey-lighten-4" fluid>
        <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="5">
                <v-card elevation="12" class="pa-6 rounded-xl">
                    <v-row align="center" justify="space-between" class="mb-4">
                        <v-btn @click="() => router.push('login')" variant="text" color="primary" size="small">
                            <v-icon start>mdi-arrow-left</v-icon>
                            {{ t('button.back') }}
                        </v-btn>
                        <LayoutFullVerticalHeaderLanguageSwitcher />
                    </v-row>

                    <v-card-title class="text-h5 text-center mb-6 font-weight-bold d-flex align-center justify-center">
                        <v-icon start size="32" color="primary" class="mr-2">mdi-lock-reset</v-icon>
                        {{ t('login.reset_password') }}
                    </v-card-title>

                    <v-form @submit.prevent="sendOtp" validate-on="submit lazy">
                        <v-text-field v-model="email" :label="t('login.email')" prepend-inner-icon="mdi-email"
                            variant="outlined" density="comfortable" required />
                        <v-btn type="submit" color="primary" class="mt-4" block size="large" :loading="loading"
                            :disabled="loading">
                            <v-icon start v-if="!loading">mdi-send</v-icon>
                            {{ t('button.send_otp') }}
                        </v-btn>

                        <v-alert v-if="error" type="error" class="mt-4" dense border="start" variant="tonal">
                            {{ error }}
                        </v-alert>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

    <v-dialog v-model="confirm_otp_dialog" max-width="600px">
        <UserConfirmOTP :email="email" :user_id="user_id_otp" @done="done"
            @close="() => { confirm_otp_dialog = false }" />
    </v-dialog>

    <v-dialog v-model="change_ps_dialog" max-width="600px">
        <UserChangePassword :user_id="user_id_otp" @done="reserPWdone" @close="() => { change_ps_dialog = false }" />
    </v-dialog>
</template>
