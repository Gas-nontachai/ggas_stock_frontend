<script setup lang="ts">
import { EmailRules } from '@/utils/rules';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { User } from "@/misc/type";

const { createUser } = useUser();
const { uploadFilesAndGetPublicUrls } = useStorage();
const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const user = ref<User>({
  user_id: '',
  username: '',
  email: '',
});

const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);

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
    const image_urls = await uploadFilesAndGetPublicUrls(files);

    await createUser({
      username: user.value.username,
      email: user.value.email,
      image_urls,
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
    icon="mdi-account-plus"
    :title="t('user.add_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
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
