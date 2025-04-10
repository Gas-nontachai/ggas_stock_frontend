<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { Platform } from "@/misc/type";

const { getPlatformByID, updatePlatformBy } = usePlatform();

const { t } = useI18n();
const emit = defineEmits(['addDone']);

const props = defineProps({
    platform_id: {
        type: String,
        required: true,
    },
});

const platform = ref<Platform>({
    platform_id: '',
    platform_name: '',
    platform_image: '',
});

onMounted(async () => {
    try {
        const response = await getPlatformByID({ platform_id: props.platform_id });
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
        await updatePlatformBy(platform.value);

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

        emit('addDone', true);
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

        emit('addDone', false);
    }
};
</script>

<template>
    <v-container class="bg-white">
        <v-form ref="form">
            <v-text-field v-model="platform.platform_name" :label="t('platform.platform_name')" required></v-text-field>

            <v-btn color="primary" @click="submitForm">
                {{ t('button.submit') }}
            </v-btn>
        </v-form>
    </v-container>
</template>
