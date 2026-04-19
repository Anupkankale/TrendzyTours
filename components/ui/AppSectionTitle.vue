<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
  center?: boolean
  light?: boolean
}>()
</script>

<template>
  <div :class="['mb-12', center ? 'text-center' : '']">
    <!-- Eyebrow pill label -->
    <div v-if="eyebrow" :class="['mb-4', center ? 'flex justify-center' : '']">
      <span :class="[
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest',
        light ? 'bg-white/15 text-white ring-1 ring-white/25' : 'bg-brand-50 text-brand-600 ring-1 ring-brand-100',
      ]">
        <span class="h-1.5 w-1.5 rounded-full bg-current" />
        {{ eyebrow }}
      </span>
    </div>

    <!-- Heading -->
    <h2 :class="[
      'font-heading font-bold',
      light ? 'text-white' : 'text-heading',
    ]">
      {{ title }}
    </h2>

    <!-- Accent line -->
    <div :class="[
      'mt-4 flex gap-1',
      center ? 'justify-center' : '',
    ]">
      <div :class="['h-1 w-10 rounded-full', light ? 'bg-white' : 'bg-brand-500']" />
      <div :class="['h-1 w-3 rounded-full opacity-40', light ? 'bg-white' : 'bg-brand-500']" />
      <div :class="['h-1 w-1.5 rounded-full opacity-20', light ? 'bg-white' : 'bg-brand-500']" />
    </div>

    <!-- Subtitle -->
    <p v-if="subtitle" :class="[
      'mt-5 max-w-2xl text-lg leading-relaxed',
      light ? 'text-white/75' : 'text-muted',
      center ? 'mx-auto' : '',
    ]">
      {{ subtitle }}
    </p>
  </div>
</template>
