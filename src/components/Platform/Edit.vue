<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Platform } from "@/misc/type";

const { getPlatform, updatePlatform } = usePlatform();
const { uploadFilesAndGetPublicUrls } = useStorage();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);

const props = defineProps({
  platform_id: {
    type: String,
    required: true,
  },
});

const platform = ref<Platform>({
  platform_id: '',
  platform_name: '',
  platform_image: null,
});
const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);

onMounted(async () => {
  try {
    const response = await getPlatform(props.platform_id);
    platform.value = response;
  } catch (error) {
    console.error('Error fetching platform:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load platform data. Please try again later.',
    });
  }
});

const submitForm = async () => {
  if (!platform.value.platform_name) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Platform Name',
      text: 'Please provide a platform name before submitting.',
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
    const existingUrls = Array.isArray(platform.value.platform_image) ? platform.value.platform_image : [];

    await updatePlatform(props.platform_id, {
      platform_name: platform.value.platform_name,
      image_urls: [...existingUrls, ...uploadedUrls],
    });

    Swal.close();
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Platform updated successfully!',
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
  <v-card>
    <v-card-title>
      <v-row justify="space-between" align="center" class="py-2 px-1">
        <v-col cols="auto">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="large">
              mdi-desktop-classic
            </v-icon>
            <span class="text-h5 font-weight-medium gradient-text">{{ t('expense.add_title') }}</span>
          </div>
        </v-col>
        <v-col cols="auto">
          <v-btn icon variant="tonal" color="error" @click="emit('close', true)"
            class="rounded-circle elevation-1" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="platform.platform_name" :label="t('platform.platform_name')"
              variant="outlined" required></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-file-input accept="image/*" @change="uploadFile" :label="t('platform.platform_image')"
              variant="outlined" prepend-icon="mdi-camera" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="error" variant="text" @click="emit('close', true);">{{ t('button.cancel') }}</v-btn>
      <v-btn color="primary" variant="elevated" @click="submitForm">{{ t('button.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
