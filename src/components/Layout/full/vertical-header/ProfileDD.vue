<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const { t } = useI18n();
const router = useRouter();
const { authLogout } = useAuth();
const { authUser, clearSession } = useSession();
const { stop } = useSessionEvents();

const user = computed(() => authUser.value ?? null);
const userImageUrl = computed(() => {
  if (Array.isArray(user.value?.user_image) && user.value.user_image.length > 0) {
    return user.value.user_image[0];
  }
  return null;
});

const items = computed(() => [
  {
    title: t('profile_dropdown.title'),
    href: user.value?.user_id ? `/user/profile?user_id=${user.value.user_id}` : "/user/profile",
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
    try {
      await authLogout();
    } catch {
      // Cleanup still runs when logout endpoint fails.
    } finally {
      stop();
      clearSession();
    }

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
        <v-btn variant="text" icon v-bind="props" class="header-icon-btn">
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

<style scoped>
.header-icon-btn {
  color: rgb(var(--v-theme-on-surface));
  opacity: 1;
}
</style>
