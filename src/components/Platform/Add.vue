<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { requiredRule } from '@/utils/rules';
import type { Platform } from '@/misc/type';

const { createPlatform } = usePlatform();
const { uploadFilesAndGetPublicUrls } = useStorage();
const { success, error, warning } = useAppSnackbar();

const { t } = useI18n();
const emit = defineEmits(['done', 'close']);
const formRef = ref();

const platform = ref<Platform>({
  platform_id: '',
  platform_name: '',
  platform_image: null,
});

const buffer_image = ref<Array<{ files?: File[], src: string }>>([]);
const platformNameRules = [requiredRule(t, t('platform.platform_name'))];

const submitForm = async () => {
  const validation = await formRef.value?.validate();
  if (!validation?.valid) {
    warning(t('validation.form_invalid'));
    return;
  }

  try {
    const files = buffer_image.value.flatMap((entry) => entry.files ?? []);
    const image_urls = await uploadFilesAndGetPublicUrls(files);

    await createPlatform({
      platform_name: platform.value.platform_name.trim(),
      image_urls,
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
  <FormDialogFrame
    icon="mdi-desktop-classic"
    :title="t('platform.add_title')"
    :submit-text="t('button.submit')"
    :cancel-text="t('button.cancel')"
    @close="emit('close', true)"
    @cancel="emit('close', true)"
    @submit="submitForm"
  >
    <v-form ref="formRef" validate-on="blur lazy" @submit.prevent="submitForm">
      <v-row class="form-grid">
        <v-col cols="12">
          <v-text-field v-model="platform.platform_name" :label="t('platform.platform_name')" :rules="platformNameRules"
            variant="outlined" density="comfortable" />
        </v-col>
        <v-col cols="12">
          <v-file-input accept="image/*" @change="uploadFile" :label="t('platform.platform_image')"
            variant="outlined" density="comfortable" prepend-icon="mdi-camera" />
        </v-col>
      </v-row>
    </v-form>
  </FormDialogFrame>
</template>
