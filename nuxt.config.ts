// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    // head: {
    //   link: [{ rel: 'icon', type: 'image/jpg', href: '/icon.jpg' }],
    // },
    pageTransition: { name: 'page', mode: 'out-in', duration: 300 },
  },
  css: ['~/assets/css/index.css'],
  modules: ['@nuxt/eslint', '@unocss/nuxt']
})