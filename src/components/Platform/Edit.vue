<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { requiredRule } from '@/utils/rules';
import type { Platform } from '@/misc/type';

const { getPlatform, updatePlatform } = usePlatform();
const { uploadFilesAndGetPublicUrls } = useStorage();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

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
const platformNameRules = [requiredRule(t, t('platform.platform_name'))];

onMounted(async () => {
  try {
    const response = await getPlatform(props.platform_id);
    platform.value = response;
  } catch {
    error(t('message.load_error'));
  }
});

const submitForm = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    warning(t('validation.form_invalid'));
    return;
  }

  try {
    const files = buffer_image.value.flatMap((entry) => entry.files ?? []);
    const uploadedUrls = await uploadFilesAndGetPublicUrls(files);
    const existingUrls = Array.isArray(platform.value.platform_image) ? platform.value.platform_image : [];

    await updatePlatform(props.platform_id, {
      platform_name: platform.value.platform_name.trim(),
      image_urls: [...existingUrls, ...uploadedUrls],
    });

    success(t('message.submit_success'));
    emit('done', true);
  } catch {
    error(t('message.submit_error'));
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
  <v-card class="app-form-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary" size="small">mdi-desktop-classic</v-icon>
        <span class="app-form-title">{{ t('platform.edit_title') }}</span>
      </div>
      <v-btn icon variant="text" color="secondary" @click="emit('close', true)" size="small">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="platform.platform_name" :label="t('platform.platform_name')" :rules="platformNameRules" />
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
      <v-btn color="secondary" variant="text" @click="emit('close', true)">{{ t('button.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="submitForm">{{ t('button.submit') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
