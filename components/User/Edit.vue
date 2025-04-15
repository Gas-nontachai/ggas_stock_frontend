<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { User } from "@/misc/type";

const { getUserByID, updateUserBy } = useUser();

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
</script>

<template>
    <v-card>
        <v-card-title>
            <v-row justify="space-between" align="center" class="py-2 px-1">
                <v-col cols="auto">
                    <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-3" size="large">
                            mdi-account
                        </v-icon>
                        <span class="text-h5 font-weight-medium gradient-text">{{ t('user.add_title') }}</span>
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
                    <v-col cols="6">
                        <v-text-field v-model="user.username" :label="t('user.username')" variant="outlined"
                            required></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field v-model="user.email" :label="t('user.email')" variant="outlined"
                            required></v-text-field>
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
