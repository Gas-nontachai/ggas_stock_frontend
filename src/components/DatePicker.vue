<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  addMonths,
  buildMarkerSet,
  formatDateByPattern,
  getMonthStart,
  isInRange,
  isSameDay,
  normalizeDate,
  toDate,
  toDateKey,
  type DateMarker,
  type DateRange,
} from '@/utils/date-picker';

const props = withDefaults(defineProps<{
  modelValue: DateRange;
  range?: boolean;
  locale?: string;
  placeholder?: string;
  cancelText?: string;
  selectText?: string;
  dark?: boolean;
  teleport?: boolean;
  enableTimePicker?: boolean;
  previewFormat?: string;
  markers?: DateMarker[];
}>(), {
  range: true,
  locale: 'en',
  placeholder: 'Select date',
  cancelText: 'Cancel',
  selectText: 'Select',
  dark: false,
  teleport: false,
  enableTimePicker: false,
  previewFormat: 'dd MMMM yyyy',
  markers: () => [],
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateRange): void;
}>();

const menu = ref(false);
const viewMonth = ref(getMonthStart(new Date()));
const tempStart = ref<Date | null>(null);
const tempEnd = ref<Date | null>(null);

const isSelected = computed(() => !!(props.modelValue?.[0] && props.modelValue?.[1]));

function setTempFromModel() {
  const range = props.modelValue;
  if (range?.length === 2) {
    tempStart.value = toDate(range[0]);
    tempEnd.value = toDate(range[1]);
    viewMonth.value = getMonthStart(tempStart.value || new Date());
    return;
  }
  tempStart.value = null;
  tempEnd.value = null;
  viewMonth.value = getMonthStart(new Date());
}

watch(
  () => props.modelValue,
  () => {
    if (!menu.value) {
      setTempFromModel();
    }
  },
  { deep: true, immediate: true },
);

watch(menu, (open) => {
  if (open) {
    setTempFromModel();
  }
});

const weekdayLabels = computed(() => {
  const base = new Date(Date.UTC(2026, 0, 4));
  return Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(base);
    day.setUTCDate(base.getUTCDate() + i);
    return new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format(day);
  });
});

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(viewMonth.value),
);

const markerSet = computed(() => buildMarkerSet(props.markers, new Date()));

const calendarDays = computed(() => {
  const firstDay = getMonthStart(viewMonth.value);
  const startOffset = firstDay.getDay();
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }).map((_, index) => {
    const date = normalizeDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index));
    const key = toDateKey(date);
    return {
      date,
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === viewMonth.value.getMonth(),
      isToday: isSameDay(date, normalizeDate(new Date())),
      isMarked: markerSet.value.has(key),
      isStart: isSameDay(date, tempStart.value),
      isEnd: isSameDay(date, tempEnd.value),
      isInRange: isInRange(date, tempStart.value, tempEnd.value),
    };
  });
});

const selectedText = computed(() => {
  if (!props.modelValue || props.modelValue.length !== 2) {
    return props.placeholder;
  }
  const start = toDate(props.modelValue[0]);
  const end = toDate(props.modelValue[1]);
  if (!start || !end) {
    return props.placeholder;
  }
  return `${formatDateByPattern(start, props.previewFormat, props.locale)} - ${formatDateByPattern(end, props.previewFormat, props.locale)}`;
});

const canSelect = computed(() => !!(tempStart.value && tempEnd.value));

function pickDate(date: Date) {
  if (!tempStart.value || tempEnd.value) {
    tempStart.value = date;
    tempEnd.value = null;
    return;
  }

  if (date.getTime() < tempStart.value.getTime()) {
    tempStart.value = date;
    return;
  }

  tempEnd.value = date;
}

function moveMonth(diff: number) {
  viewMonth.value = addMonths(viewMonth.value, diff);
}

function cancelSelection() {
  setTempFromModel();
  menu.value = false;
}

function applySelection() {
  if (!tempStart.value || !tempEnd.value) {
    return;
  }
  emit('update:modelValue', [normalizeDate(tempStart.value), normalizeDate(tempEnd.value)]);
  menu.value = false;
}

function clearSelection() {
  tempStart.value = null;
  tempEnd.value = null;
  emit('update:modelValue', null);
  menu.value = false;
}
</script>

<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    location="bottom"
    min-width="320"
    max-width="340"
    :attach="teleport ? 'body' : undefined"
    class="date-picker-menu"
  >
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="outlined"
        class="date-picker-trigger w-100 justify-start"
        data-testid="date-picker-trigger"
      >
        <v-icon class="mr-2">mdi-calendar</v-icon>
        <span class="date-picker-trigger__text">{{ selectedText }}</span>
        <button
          v-if="isSelected"
          type="button"
          class="date-picker-clear"
          aria-label="clear-date-range"
          data-testid="date-picker-clear"
          @click.stop="clearSelection"
        >
          <v-icon size="small">mdi-close</v-icon>
        </button>
      </v-btn>
    </template>

    <v-card class="date-picker-card" data-testid="date-picker-card">
      <v-card-title class="d-flex align-center justify-space-between py-3">
        <v-btn icon size="small" variant="text" data-testid="date-picker-prev" @click="moveMonth(-1)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div class="text-subtitle-2 font-weight-medium">{{ monthLabel }}</div>
        <v-btn icon size="small" variant="text" data-testid="date-picker-next" @click="moveMonth(1)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-0">
        <div class="date-picker-weekdays">
          <div v-for="day in weekdayLabels" :key="day" class="date-picker-weekday">{{ day }}</div>
        </div>

        <div class="date-picker-grid">
          <button
            v-for="cell in calendarDays"
            :key="cell.key"
            type="button"
            class="date-picker-day"
            :class="{
              'is-outside': !cell.inMonth,
              'is-range': cell.isInRange,
              'is-start': cell.isStart,
              'is-end': cell.isEnd,
              'is-today': cell.isToday,
            }"
            :data-date="cell.key"
            @click="pickDate(cell.date)"
          >
            <span>{{ cell.day }}</span>
            <span v-if="cell.isMarked" class="date-picker-dot" />
          </button>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" color="secondary" data-testid="date-picker-cancel" @click="cancelSelection">
          {{ cancelText }}
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          :disabled="!canSelect"
          data-testid="date-picker-apply"
          @click="applySelection"
        >
          {{ selectText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<style scoped>
.date-picker-trigger {
  min-height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  overflow: hidden;
}

.date-picker-trigger__text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.date-picker-clear {
  border: 0;
  background: transparent;
  color: var(--app-text-muted);
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 999px;
}

.date-picker-clear:hover {
  background: var(--app-surface-muted);
  color: var(--app-text);
}

.date-picker-card {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
}

.date-picker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  gap: 2px;
}

.date-picker-weekday {
  text-align: center;
  color: var(--app-text-muted);
  font-size: 0.8rem;
}

.date-picker-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-picker-day {
  height: 36px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--app-text);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-picker-day:hover {
  background: var(--app-surface-muted);
}

.date-picker-day.is-outside {
  color: var(--app-text-muted);
  opacity: 0.6;
}

.date-picker-day.is-range {
  background: rgb(var(--v-theme-primary) / 0.16);
}

.date-picker-day.is-start,
.date-picker-day.is-end {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.date-picker-day.is-today {
  border-color: var(--app-focus);
}

.date-picker-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgb(var(--v-theme-warning));
  position: absolute;
  bottom: 4px;
}
</style>
