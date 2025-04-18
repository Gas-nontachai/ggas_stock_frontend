<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { User } from '~/misc/user';

const { t } = useI18n();
const router = useRouter();
const { authLogout } = useAuth();

const cookie = useCookie<User | null>('User');

// fallback ถ้า cookie ไม่มีค่าจะใช้ object ว่างๆ
const user = computed(() => cookie.value ?? { user_image: '', user_id: 0 });

// สร้าง url รูปโปรไฟล์ถ้ามีรูป
const userImageUrl = computed(() => {
  if (user.value.user_image) {
    return `${useRuntimeConfig().public.apiBaseUrl}${user.value.user_image}`;
  }
  return null;
});

const items = computed(() => [
  {
    title: t('profile_dropdown.title'),
    href: `/user/profile?user_id=${user.value.user_id}`,
    icon: 'mdi-account',
  },
  {
    title: t('profile_dropdown.logout'),
    action: logout,
    icon: 'mdi-logout',
  },
]);

const logout = async () => {
  const result = await Swal.fire({
    title: t('alert.logout'),
    text: t('alert.confirm_logout'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('button.confirm'),
    cancelButtonText: t('button.cancel'),
    customClass: {
      confirmButton: 'swal2-confirm-white',
      cancelButton: 'swal2-cancel-white',
    },
  });

  if (result.isConfirmed) {
    await authLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    router.push('/auth/login');

    await Swal.fire({
      title: t('logout.successTitle'),
      text: t('logout.successText'),
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }
};
</script>

<template>
  <div class="profileDD">
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props">
          <v-avatar v-if="userImageUrl" :image="userImageUrl" size="32"></v-avatar>
          <v-icon v-else size="x-large">mdi-account-circle</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" :value="index"
          @click="item.href ? router.push(item.href) : item.action?.()">
          <div class="d-flex align-center">
            <v-icon class="mr-3">{{ item.icon }}</v-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </div>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
