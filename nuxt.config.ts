// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: '网页小游戏',
      link: [{ rel: 'icon', type: 'image/svg', href: '/icon.svg' }],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: '网页小游戏' },
        { name: 'keywords', content: '游戏,在线,单机,网页' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in', duration: 300 },
  },
  css: ['~/assets/css/index.css'],
  modules: ['@nuxt/eslint', '@unocss/nuxt']
})