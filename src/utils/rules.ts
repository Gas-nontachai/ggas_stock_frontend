export const PasswordRules = (t: any) => [
    (v: string) => !!v || t('validation.required', { field: t('user.password') }),
    (v: string) => v.length >= 8 || t('validation.password_min'),
];

export const EmailRules = (t: any) => [
    (v: string) => !!v || t('validation.required', { field: t('user.email') }),
    (v: string) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v) || t('validation.email'),
];
