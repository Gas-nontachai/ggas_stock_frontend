import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';
import DatePicker from '@/components/DatePicker.vue';
import type { DateRange } from '@/utils/date-picker';

const VMenuStub = defineComponent({
  name: 'VMenuStub',
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { slots, emit }) {
    return () =>
      h('div', [
        slots.activator?.({
          props: {
            onClick: () => emit('update:modelValue', !props.modelValue),
          },
        }),
        props.modelValue ? slots.default?.() : null,
      ]);
  },
});

const VBtnStub = defineComponent({
  name: 'VBtnStub',
  props: {
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { slots, attrs, emit }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          disabled: props.disabled,
          onClick: (event: MouseEvent) => {
            if (typeof attrs.onClick === 'function') {
              (attrs.onClick as (e: MouseEvent) => void)(event);
            }
            emit('click', event);
          },
        },
        slots.default?.(),
      );
  },
});

const WrapperStub = (name: string) =>
  defineComponent({
    name,
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });

const mountDatePicker = (modelValue: DateRange = null) =>
  mount(DatePicker, {
    props: {
      modelValue,
      locale: 'en',
      placeholder: 'Select date',
      cancelText: 'Cancel',
      selectText: 'Select',
      previewFormat: 'dd MMMM yyyy',
      markers: [{ date: new Date('2026-03-13') }],
    },
    global: {
      stubs: {
        VMenu: VMenuStub,
        VBtn: VBtnStub,
        VCard: WrapperStub('VCardStub'),
        VCardTitle: WrapperStub('VCardTitleStub'),
        VCardText: WrapperStub('VCardTextStub'),
        VCardActions: WrapperStub('VCardActionsStub'),
        VIcon: WrapperStub('VIconStub'),
      },
    },
  });

describe('DatePicker', () => {
  it('opens calendar when trigger is clicked', async () => {
    const wrapper = mountDatePicker();
    expect(wrapper.find('[data-testid="date-picker-card"]').exists()).toBe(false);
    await wrapper.get('[data-testid="date-picker-trigger"]').trigger('click');
    expect(wrapper.find('[data-testid="date-picker-card"]').exists()).toBe(true);
  });

  it('emits selected range on apply', async () => {
    const wrapper = mountDatePicker();
    await wrapper.get('[data-testid="date-picker-trigger"]').trigger('click');

    const inMonthDays = wrapper.findAll('.date-picker-day').filter((item) => !item.classes('is-outside'));
    await inMonthDays[0].trigger('click');
    await inMonthDays[3].trigger('click');
    await wrapper.get('[data-testid="date-picker-apply"]').trigger('click');

    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    const payload = emitted?.[0][0] as DateRange;
    expect(payload).not.toBeNull();
    expect(Array.isArray(payload)).toBe(true);
    expect(payload?.[0] instanceof Date).toBe(true);
    expect(payload?.[1] instanceof Date).toBe(true);
  });

  it('does not emit on cancel when range is not applied', async () => {
    const wrapper = mountDatePicker();
    await wrapper.get('[data-testid="date-picker-trigger"]').trigger('click');
    const inMonthDays = wrapper.findAll('.date-picker-day').filter((item) => !item.classes('is-outside'));
    await inMonthDays[0].trigger('click');
    await wrapper.get('[data-testid="date-picker-cancel"]').trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('shows today marker dot in calendar', async () => {
    const wrapper = mountDatePicker();
    await wrapper.get('[data-testid="date-picker-trigger"]').trigger('click');
    expect(wrapper.find('.date-picker-day.is-today .date-picker-dot').exists()).toBe(true);
  });

  it('clears current value and emits null', async () => {
    const wrapper = mountDatePicker([new Date('2026-03-10'), new Date('2026-03-13')]);
    await wrapper.get('[data-testid="date-picker-clear"]').trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted?.[0][0]).toBeNull();
  });
});

describe('DatePicker integration smoke', () => {
  const createHarness = () =>
    defineComponent({
      components: { DatePicker },
      setup() {
        const range = ref<DateRange>(null);
        return { range };
      },
      template: `
        <div>
          <DatePicker v-model="range" range locale="en" placeholder="Select date" cancelText="Cancel" selectText="Select" />
          <button id="clear-filter" @click="range = null">Clear</button>
          <span id="has-range">{{ Array.isArray(range) ? 'yes' : 'no' }}</span>
        </div>
      `,
    });

  it('updates filter model when date range is selected', async () => {
    const wrapper = mount(createHarness(), {
      global: {
        stubs: {
          VMenu: VMenuStub,
          VBtn: VBtnStub,
          VCard: WrapperStub('VCardStub'),
          VCardTitle: WrapperStub('VCardTitleStub'),
          VCardText: WrapperStub('VCardTextStub'),
          VCardActions: WrapperStub('VCardActionsStub'),
          VIcon: WrapperStub('VIconStub'),
        },
      },
    });

    await wrapper.get('[data-testid="date-picker-trigger"]').trigger('click');
    const inMonthDays = wrapper.findAll('.date-picker-day').filter((item) => !item.classes('is-outside'));
    await inMonthDays[0].trigger('click');
    await inMonthDays[2].trigger('click');
    await wrapper.get('[data-testid="date-picker-apply"]').trigger('click');

    expect(wrapper.get('#has-range').text()).toBe('yes');
  });

  it('resets date range to null on clear action', async () => {
    const wrapper = mount(createHarness(), {
      global: {
        stubs: {
          VMenu: VMenuStub,
          VBtn: VBtnStub,
          VCard: WrapperStub('VCardStub'),
          VCardTitle: WrapperStub('VCardTitleStub'),
          VCardText: WrapperStub('VCardTextStub'),
          VCardActions: WrapperStub('VCardActionsStub'),
          VIcon: WrapperStub('VIconStub'),
        },
      },
    });

    await wrapper.get('[data-testid="date-picker-trigger"]').trigger('click');
    const inMonthDays = wrapper.findAll('.date-picker-day').filter((item) => !item.classes('is-outside'));
    await inMonthDays[0].trigger('click');
    await inMonthDays[2].trigger('click');
    await wrapper.get('[data-testid="date-picker-apply"]').trigger('click');
    expect(wrapper.get('#has-range').text()).toBe('yes');

    await wrapper.get('#clear-filter').trigger('click');
    expect(wrapper.get('#has-range').text()).toBe('no');
  });
});
