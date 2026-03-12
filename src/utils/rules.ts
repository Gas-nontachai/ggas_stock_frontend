type RuleResult = true | string;
type Rule<T = any> = (value: T) => RuleResult;
type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

export const requiredRule = (t: TranslateFn, fieldLabel: string): Rule =>
  (value) => {
    const str = typeof value === 'string' ? value.trim() : value;
    return (!!str || str === 0) || t('validation.required', { field: fieldLabel });
  };

export const minLengthRule = (t: TranslateFn, min: number): Rule<string> =>
  (value) => (value?.length ?? 0) >= min || t('validation.min_length', { min });

export const emailRule = (t: TranslateFn): Rule<string> =>
  (value) => emailRegex.test((value || '').trim()) || t('validation.email');

export const selectRequiredRule = (t: TranslateFn, fieldLabel: string): Rule =>
  (value) => !!value || t('validation.required', { field: fieldLabel });

export const PasswordRules = (t: TranslateFn): Rule[] => [
  requiredRule(t, t('user.password')),
  (v: string) => (v?.length ?? 0) >= 8 || t('validation.password_min'),
];

export const EmailRules = (t: TranslateFn): Rule[] => [
  requiredRule(t, t('user.email')),
  emailRule(t),
];

export const positiveDecimalRules = (
  t: TranslateFn,
  fieldLabel: string,
  maxDecimals = 2,
): Rule[] => [
  requiredRule(t, fieldLabel),
  (value) => {
    const normalized = sanitizePositiveDecimalInput(value, maxDecimals);
    if (!normalized) {
      return t('validation.positive_number', { field: fieldLabel });
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return t('validation.positive_number', { field: fieldLabel });
    }

    const decimalPart = normalized.split('.')[1] || '';
    return decimalPart.length <= maxDecimals || t('validation.max_decimals', { max: maxDecimals });
  },
];

export const blockInvalidNumericKeys = (event: KeyboardEvent): void => {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
};

export const sanitizePositiveDecimalInput = (value: unknown, maxDecimals = 2): string => {
  const raw = String(value ?? '').replace(/,/g, '');
  if (!raw) {
    return '';
  }

  let sanitized = raw.replace(/[^\d.]/g, '');

  const firstDotIndex = sanitized.indexOf('.');
  if (firstDotIndex !== -1) {
    const before = sanitized.slice(0, firstDotIndex + 1);
    const after = sanitized.slice(firstDotIndex + 1).replace(/\./g, '');
    sanitized = before + after;
  }

  if (sanitized.startsWith('.')) {
    sanitized = `0${sanitized}`;
  }

  const [integer = '', decimal = ''] = sanitized.split('.');
  const trimmedInteger = integer.replace(/^0+(?=\d)/, '');
  const trimmedDecimal = decimal.slice(0, maxDecimals);

  return trimmedDecimal.length > 0 ? `${trimmedInteger}.${trimmedDecimal}` : trimmedInteger;
};

export const normalizePositiveDecimal = (value: unknown, maxDecimals = 2): number | null => {
  const sanitized = sanitizePositiveDecimalInput(value, maxDecimals);
  if (!sanitized) {
    return null;
  }

  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Number(parsed.toFixed(maxDecimals));
};

export const normalizeSubmitPayload = <T extends Record<string, any>>(
  payload: T,
  numericFields: Array<keyof T>,
  maxDecimals = 2,
): T => {
  const next = { ...payload };
  for (const field of numericFields) {
    const normalized = normalizePositiveDecimal(next[field], maxDecimals);
    next[field] = (normalized ?? 0) as T[keyof T];
  }
  return next;
};
