<template>
  <div flex="~ col justify-center items-center gap-4" class="full-height">
    <NuxtLink to="/wuziqi">五子棋</NuxtLink>
    <NuxtLink to="/2048">2048</NuxtLink>
    <NuxtLink to="/snake">贪吃蛇</NuxtLink>
  </div>
</template>

<script setup>
useHead({
  title: '网页小游戏',
  meta: [
    { name: 'description', content: '网页小游戏' },
    { name: 'keywords', content: '游戏,在线,单机,网页' }
  ],
  link: [{ rel: 'icon', type: 'image/svg', href: '/icon.svg' }]
})
</script>

<style>
@import '../assets/css/index.css';
</style>