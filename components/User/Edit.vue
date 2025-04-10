<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { User } from "@/misc/type";

const { getUserByID, updateUserBy } = useUser();

const { t } = useI18n();
const emit = defineEmits(['addDone']);

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
});

onMounted(async () => {
    try {
        const response = await getUserByID({ user_id: props.user_id });
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
        await updateUserBy(user.value);

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
            <v-text-field v-model="user.username" :label="t('user.username')" required></v-text-field>
            <v-text-field v-model="user.username" :label="t('user.email')" required></v-text-field>
            <v-text-field v-model="user.username" :label="t('user.password')" required></v-text-field>

            <v-btn color="primary" @click="submitForm">
                {{ t('button.submit') }}
            </v-btn>
        </v-form>
    </v-container>
</template>
