<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { formatDate } from '@/utils/date-func';
import type { User } from "@/misc/type";
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { searchUser, deleteUser: removeUser } = useUser();
const { confirmAndRun } = useConfirmAction();
const { t } = useI18n();
const router = useRouter();

const users = ref<User[]>([]);
const listPage = useListPage({});
const loading = listPage.loading;
const search_query = listPage.searchQuery;
const user_id_current = ref('');

const add_paltform_dialog = computed({
    get: () => listPage.dialogs.add_user ?? false,
    set: (value: boolean) => {
        listPage.dialogs.add_user = value;
    },
});

const edit_paltform_dialog = computed({
    get: () => listPage.dialogs.edit_user ?? false,
    set: (value: boolean) => {
        listPage.dialogs.edit_user = value;
    },
});

onMounted(async () => {
    await fetchData();
});

const fetchData = async () => {
    listPage.setLoading(true);
    try {
        const response = await searchUser();
        users.value = response;
    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        listPage.setLoading(false);
    }
};

const headers = computed(() => [
    { title: t('user.user_id'), align: 'start' as const, key: 'user_id' },
    { title: t('user.user_image'), align: 'start' as const, key: 'user_image' },
    { title: t('user.username'), align: 'start' as const, key: 'username' },
    { title: t('user.email'), align: 'start' as const, key: 'email' },
    { title: t('user.actions'), align: 'center' as const, key: 'actions' }
]);

const filteredUsers = computed(() => {
    if (!search_query.value) return users.value;
    return users.value.filter(user =>
        user.user_id.toLowerCase().includes(search_query.value.toLowerCase()) ||
        user.username.toLowerCase().includes(search_query.value.toLowerCase()) ||
        user.email.toLowerCase().includes(search_query.value.toLowerCase())
    );
});

const deleteUser = async (user_id: string) => {
    await confirmAndRun(async () => {
        await removeUser(user_id);
        await fetchData();
    }, {
        confirmButtonText: t('button.delete'),
        successText: 'User deleted successfully!',
    });
};

const detailUser = (user_id: string) => {
    router.push(`/user/profile?user_id=${user_id}`);
};

const addUser = () => {
    listPage.openDialog('add_user');
};

const Done = async () => {
    listPage.closeDialog('add_user');
    listPage.closeDialog('edit_user');
    await fetchData();
};

const editUser = (user_id: string) => {
    user_id_current.value = user_id
    listPage.openDialog('edit_user');
};
</script>

<template>
    <section class="page-shell">
        <div class="page-header">
            <div class="page-heading">
                <h1 class="page-title">{{ t('user.title') }}</h1>
                <p class="page-subtitle">{{ t('user.description') }}</p>
            </div>
            <div class="page-actions">
                <v-btn @click="addUser" color="primary" class="page-primary-action">{{ t('user.add_btn') }}</v-btn>
            </div>
        </div>

        <ListToolbar v-model="search_query" :search-label="t('expense.search')" :loading="loading" @search="fetchData"
            @clear="() => { listPage.clearSearch(); fetchData(); }" />

        <template v-if="loading" class="d-flex justify-center align-center">
            <Loading />
        </template>

        <div class="table-shell" v-else>
            <v-data-table :items="filteredUsers" :headers="headers" item-key="user_id" class="elevation-1">

            <template v-slot:item.user_image="{ item }">
                <v-avatar :image="Array.isArray(item.user_image) && item.user_image.length ? item.user_image[0] : '/default-user.png'" size="40">
                </v-avatar>
            </template>

            <template v-slot:item.createdAt="{ item }">
                <span>{{ formatDate(item.createdAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.updatedAt="{ item }">
                <span>{{ formatDate(item.updatedAt, "dd/MM/yyyy HH:mm") }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
                <TableActionMenu
                    show-detail
                    :detail-text="t('button.detail')"
                    :edit-text="t('button.edit')"
                    :delete-text="t('button.delete')"
                    @detail="detailUser(item.user_id)"
                    @edit="editUser(item.user_id)"
                    @delete="deleteUser(item.user_id)"
                />
            </template>
            </v-data-table>
        </div>

        <v-dialog v-model="add_paltform_dialog" max-width="720" scrollable>
            <UserAdd @done="Done" @close="() => { add_paltform_dialog = false }" />
        </v-dialog>

        <v-dialog v-model="edit_paltform_dialog" max-width="720" scrollable>
            <UserEdit :user_id="user_id_current" @done="Done" @close="() => { edit_paltform_dialog = false }" />
        </v-dialog>

    </section>
</template>
