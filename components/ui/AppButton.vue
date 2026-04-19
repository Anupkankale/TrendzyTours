<script setup lang="ts">
defineProps<{
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  href?: string
  disabled?: boolean
  loading?: boolean
  iconRight?: boolean
}>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :disabled="disabled || loading"
    :class="[
      'group relative inline-flex items-center justify-center gap-2.5 font-semibold',
      'overflow-hidden transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-55',
      size === 'sm'
        ? 'rounded-full px-5 py-2 text-sm'
        : size === 'lg'
          ? 'rounded-full px-9 py-4 text-base'
          : 'rounded-full px-7 py-3 text-sm',
      variant === 'outline'
        ? 'border-2 border-white/80 text-white backdrop-blur-sm hover:bg-white/15 active:bg-white/25'
        : variant === 'secondary'
          ? 'bg-white/85 text-brand-700 shadow-glass backdrop-blur-sm hover:bg-white hover:shadow-glass-lg active:scale-[0.98]'
          : variant === 'ghost'
            ? 'text-brand-600 hover:bg-brand-50 active:bg-brand-100'
            : 'bg-brand-500 text-white shadow-md hover:bg-brand-600 hover:shadow-lg active:scale-[0.97]',
    ]">
    <!-- Shimmer on primary hover -->
    <span
      v-if="!variant || variant === 'primary'"
      class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

    <!-- Loading spinner -->
    <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>

    <slot />

    <!-- Arrow icon on right -->
    <svg
      v-if="iconRight && !loading"
      class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  </component>
</template>
