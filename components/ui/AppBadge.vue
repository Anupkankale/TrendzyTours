<script setup lang="ts">
defineProps<{
  label: string
  variant?: "brand" | "dark" | "green"
}>()
</script>

<template>
  <span
    :class="[
      'inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm',
      variant === 'dark'
        ? 'bg-dark-900/80 text-white'
        : variant === 'green'
          ? 'bg-green-100/90 text-green-800'
          : 'bg-white/80 text-brand-700',
    ]">
    {{ label }}
  </span>
</template>
