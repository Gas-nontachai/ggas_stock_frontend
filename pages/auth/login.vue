<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
    layout: 'blank',
})

const { authLogin } = useAuth()
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const login = async () => {
    try {
        const response = await authLogin({
            username: username.value,
            password: password.value,
        })
        console.log(response);

        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        router.push('/')
    } catch (err: any) {
        error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
    }
}
</script>

<template>
    <v-container class="fill-height" fluid>
        <v-row justify="center" align="center">
            <v-col cols="12" sm="8" md="4">
                <v-card elevation="10" class="pa-5">
                    <v-card-title class="text-h5 text-center mb-4">เข้าสู่ระบบ</v-card-title>

                    <v-form @submit.prevent="login">
                        <v-text-field v-model="username" label="ชื่อผู้ใช้" prepend-inner-icon="mdi-account"
                            required></v-text-field>

                        <v-text-field v-model="password" label="รหัสผ่าน" type="password" prepend-inner-icon="mdi-lock"
                            required></v-text-field>

                        <v-btn type="submit" color="primary" class="mt-4" block>
                            เข้าสู่ระบบ
                        </v-btn>

                        <v-alert v-if="error" type="error" class="mt-4" dense border="start" variant="tonal">
                            {{ error }}
                        </v-alert>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
