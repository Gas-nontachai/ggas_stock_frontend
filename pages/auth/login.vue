<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from "@/layout/full/vertical-header/LanguageSwitcher.vue";

definePageMeta({
  layout: 'blank',
})

const { t } = useI18n();
const { authLogin } = useAuth()

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const rememberMe = ref(false)
const error = ref('')
const showPassword = ref(false)

const login = async () => {
  try {
    loading.value = true
    const response = await authLogin({
      username: username.value,
      password: password.value,
    })

    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))

    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height bg-grey-lighten-5" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card elevation="12" class="pa-6 rounded-xl">
          <v-card-title class="text-h5 text-center mb-6 font-weight-bold">
            <div class="d-flex justify-space-between align-center">
              <div>
                <v-icon start size="32" class="mr-2 text-primary">mdi-login</v-icon>
                {{ t('login.title') }}
              </div>
              <LanguageSwitcher />
            </div>

          </v-card-title>

          <v-form @submit.prevent="login" validate-on="submit lazy">
            <v-text-field v-model="username" :label="t('login.username')" prepend-inner-icon="mdi-account"
              variant="outlined" density="comfortable" required />

            <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" :label="t('login.password')"
              prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword" variant="outlined" density="comfortable" required
              class="mt-4" />

            <v-checkbox v-model="rememberMe" :label="t('login.remember_me')" class="mt-2" density="comfortable"
              color="primary" />

            <v-btn type="submit" color="primary" class="mt-4" block size="large" :loading="loading" :disabled="loading">
              <v-icon start v-if="!loading">mdi-login-variant</v-icon>
              {{ t('button.login') }}
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
