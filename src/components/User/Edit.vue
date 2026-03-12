<script setup lang="ts">
import { EmailRules } from '@/utils/rules';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { User } from "@/misc/type";

const { getUser, updateUser } = useUser();
const { uploadFilesAndGetPublicUrls } = useStorage();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps({
  user_id: {
    type: String,
    required: true,
  },
});

const user = ref<User>({
  user_id: '',
  username: '',
  email: '',
  user_image: null,
});
const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);

onMounted(async () => {
  try {
    const response = await getUser(props.user_id);
    user.value = response;
  } catch (error) {
    console.error('Error fetching user:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load user data. Please try again later.',
    });
  }
});

const submitForm = async () => {
  if (!user.value.username) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing User Name',
      text: 'Please provide a user name before submitting.',
    });
    return;
  }

  Swal.fire({
    title: 'Submitting...',
    text: 'Please wait while we submit the form.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    showConfirmButton: false,
  });

  try {
    const files = buffer_image.value.flatMap((entry) => entry.files ?? []);
    const uploadedUrls = await uploadFilesAndGetPublicUrls(files);
    const existingUrls = Array.isArray(user.value.user_image) ? user.value.user_image : [];

    await updateUser(props.user_id, {
      username: user.value.username,
      email: user.value.email,
      image_urls: [...existingUrls, ...uploadedUrls],
    });

    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'User updated successfully!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });

    emit('done', true);
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong, please try again.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
    });

    emit('done', false);
  }
};

function uploadFile(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.length) {
    for (const file of target.files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        buffer_image.value = [...buffer_image.value, {
          files: [file],
          src: reader.result as string,
        }];
      };
      reader.readAsDataURL(file);
    }
  }
}
</script>

<template>
  <FormDialogFrame
    icon="mdi-account-edit"
    :title="t('user.edit_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
    <template #header-extra>
      <v-avatar v-if="Array.isArray(user.user_image) && user.user_image.length" :image="user.user_image[0]" size="32" />
    </template>

    <v-form>
      <v-row class="form-grid">
        <v-col cols="12" md="6">
          <v-text-field v-model="user.username" :label="t('user.username')" variant="outlined" density="comfortable"
            :rules="[(v) => !!v || t('validation.required', { field: t('user.username') })]" required />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="user.email" :label="t('user.email')" variant="outlined" density="comfortable"
            :rules="EmailRules" required />
        </v-col>

        <v-col cols="12">
          <v-file-input accept="image/*" @change="uploadFile" :label="t('user.user_image')" variant="outlined"
            density="comfortable" prepend-icon="mdi-camera" />
        </v-col>
      </v-row>
    </v-form>
  </FormDialogFrame>
</template>
