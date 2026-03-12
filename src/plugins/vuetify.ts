// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#1f2937',
            secondary: '#475569',
            background: '#f8fafc',
            surface: '#ffffff',
            error: '#b42318',
            info: '#155eef',
            success: '#067647',
            warning: '#b54708',
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#e2e8f0',
            secondary: '#94a3b8',
            background: '#0b1220',
            surface: '#111827',
            error: '#f97066',
            info: '#84caff',
            success: '#75e0a7',
            warning: '#fdb022',
          },
        },
      },
    },
    defaults: {
      VCard: {
        rounded: 'lg',
        elevation: 0,
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VTextarea: {
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
        hideDetails: 'auto',
      },
      VBtn: {
        rounded: 'lg',
        textTransform: 'none',
      },
      VDataTable: {
        density: 'comfortable',
      },
    },
  })
  app.vueApp.use(vuetify)
})
