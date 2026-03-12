<script setup lang="ts">
const props = withDefaults(defineProps<{
  showDetail?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  detailText?: string;
  editText?: string;
  deleteText?: string;
}>(), {
  showDetail: false,
  showEdit: true,
  showDelete: true,
  detailText: 'Detail',
  editText: 'Edit',
  deleteText: 'Delete',
});

const emit = defineEmits<{
  (event: 'detail'): void;
  (event: 'edit'): void;
  (event: 'delete'): void;
}>();
</script>

<template>
  <v-menu bottom right>
    <template #activator="{ props: activatorProps }">
      <v-btn icon variant="text" size="small" v-bind="activatorProps">
        <v-chip color="red">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-chip>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-if="props.showDetail" @click="emit('detail')">
        <div class="d-flex">
          <v-icon>mdi-account-badge-outline</v-icon>
          <v-list-item-title>{{ props.detailText }}</v-list-item-title>
        </div>
      </v-list-item>
      <v-list-item v-if="props.showEdit" @click="emit('edit')">
        <div class="d-flex">
          <v-icon>mdi-pencil</v-icon>
          <v-list-item-title>{{ props.editText }}</v-list-item-title>
        </div>
      </v-list-item>
      <v-list-item v-if="props.showDelete" @click="emit('delete')">
        <div class="d-flex">
          <v-icon>mdi-delete</v-icon>
          <v-list-item-title>{{ props.deleteText }}</v-list-item-title>
        </div>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
