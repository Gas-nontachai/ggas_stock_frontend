<script setup lang="ts">
import Swal from 'sweetalert2';
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import type { User } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'; 

const { getUserBy, deleteUserBy } = useUser();
const { t } = useI18n();
const router = useRouter();

const users = ref<User[]>([]);
const loading = ref(true);
const add_paltform_dialog = ref(false);
const edit_paltform_dialog = ref(false);
const user_id_current = ref('');
const searchQuery = ref('');

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await getUserBy();
        users.value = response;
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        loading.value = false;
    }
};

const headers = computed(() => [
    { title: t('user.user_id'), align: 'start' as const, key: 'user_id' },
    { title: t('user.username'), align: 'start' as const, key: 'username' },
    { title: t('user.email'), align: 'start' as const, key: 'email' },
    { title: t('user.actions'), align: 'center' as const, key: 'actions' }
]);

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value;
    return users.value.filter(user =>
        user.user_id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

const deleteUser = (user_id: string) => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass: {
            confirmButton: 'swal2-confirm-white',
            cancelButton: 'swal2-cancel-white',
        },
        preConfirm: async () => {
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
                await deleteUserBy({ user_id });
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'User deleted successfully!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                });
            } catch (error) {
                Swal.close();
                await fetchData();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'There was an issue deleting the user. Please try again.',
                    showConfirmButton: true,
                });
            }
        }
    });
};

const detailUser = (user_id: string) => {
    router.push(`/user/profile?user_id=${user_id}`);
};

const addUser = () => {
    add_paltform_dialog.value = true;
};

const Done = async () => {
    add_paltform_dialog.value = false;
    edit_paltform_dialog.value = false;
    await fetchData();
};

const editUser = (user_id: string) => {
    user_id_current.value = user_id
    edit_paltform_dialog.value = true;
};
</script>

<template>
    <v-container> 
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h1 class="text-h5 font-weight-bold">{{ t('user.title') }}</h1>
                <p>{{ t('user.description') }}</p>
            </div>
            <v-btn @click="addUser" color="primary">{{ t('user.add_btn') }}</v-btn>
        </div>

        <v-text-field v-model="searchQuery" max-width="40%" label="Search" clearable prepend-inner-icon="mdi-magnify"
            class="mb-4 w-4/16" />

        <template v-if="loading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="24" class="d-flex justify-center align-center" />
            <span> Loading..</span>
        </template>

        <v-data-table v-else :items="filteredUsers" :headers="headers" item-key="user_id" class="elevation-1">
            <template v-slot:item.createdAt="{ item }">
                <span>{{ formatDate(item.createdAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.updatedAt="{ item }">
                <span>{{ formatDate(item.updatedAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-menu bottom right>
                    <template v-slot:activator="{ props }">
                        <v-btn icon variant="text" size="small" v-bind="props">
                            <v-chip color="red">
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-chip>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item @click="detailUser(item.user_id)">
                            <div class="d-flex">
                                <v-icon>mdi-account-badge-outline</v-icon>
                                <v-list-item-title>{{ t('button.detail') }}</v-list-item-title>
                            </div>
                        </v-list-item>
                        <v-list-item @click="editUser(item.user_id)">
                            <div class="d-flex">
                                <v-icon>mdi-pencil</v-icon>
                                <v-list-item-title>{{ t('button.edit') }}</v-list-item-title>
                            </div>
                        </v-list-item>
                        <v-list-item @click="deleteUser(item.user_id)">
                            <div class="d-flex">
                                <v-icon>mdi-delete</v-icon>
                                <v-list-item-title>{{ t('button.delete') }}</v-list-item-title>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </v-data-table>

        <v-dialog v-model="add_paltform_dialog" max-width="600px">
            <UserAdd @addDone="Done" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="600px">
            <UserEdit :user_id="user_id_current" @addDone="Done" />
        </v-dialog>

    </v-container>
</template>