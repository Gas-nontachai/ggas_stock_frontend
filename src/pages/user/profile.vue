<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import type { User } from '@/misc/type';

const route = useRoute();
const { getUserByID } = useUser();
const userId = route.query.user_id as string;

const profile = ref<User>({
    user_id: '',
    username: '',
    email: '',
    user_image: '',
});

onMounted(async () => {
    try {
        const response = await getUserByID({ user_id: userId });
        profile.value = response;
    } catch (error) {
        console.error('Error fetching user:', error);
    }
});
</script>

<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="6">
                <v-card class="pa-6" elevation="4">
                    <v-row align="center" justify="center">
                        <v-avatar :image="profile.user_image
                            ? `${useRuntimeConfig().public.apiBaseUrl}${profile.user_image}`
                            : '/default-user.png'" size="100">
                        </v-avatar>
                    </v-row>
                    <v-card-title class="text-center mt-4">
                        {{ profile.username }}
                    </v-card-title>

                    <v-card-text class="text-center">
                        <p><strong>User ID:</strong> {{ profile.user_id }}</p>
                        <p><strong>Email:</strong> {{ profile.email }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>