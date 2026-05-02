<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel, PopoverGroup } from "@headlessui/vue"
import { Bars3Icon } from "@heroicons/vue/24/outline"
import { ChevronDownIcon } from "@heroicons/vue/20/solid"
import { navigation } from "@/data/navigation"
import { useUIStore } from "@/stores/ui"

const ui = useUIStore()
</script>

<template>
  <header class="glass-nav sticky top-0 z-50">
    <nav class="container-max flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <NuxtImg src="/images/tours/logo/TrendzyTourslogo.png" alt="Trendzy Tours" class="h-12 w-auto" />
      </NuxtLink>

      <!-- Desktop nav -->
      <PopoverGroup class="hidden items-center gap-1 lg:flex">
        <template v-for="item in navigation" :key="item.label">
          <!-- Dropdown item -->
          <Popover v-if="item.children" class="relative">
            <PopoverButton
              class="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-dark-700 transition hover:bg-brand-50 hover:text-brand-600 focus:outline-none">
              {{ item.label }}
              <ChevronDownIcon class="h-4 w-4 text-brand-400" />
            </PopoverButton>
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1">
              <PopoverPanel class="glass-dropdown absolute left-0 mt-2 w-68 rounded-2xl">
                <div class="p-2">
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.href"
                    :to="child.href"
                    class="block rounded-xl px-4 py-3 transition hover:bg-brand-50">
                    <p class="font-medium text-dark-900">{{ child.label }}</p>
                    <p v-if="child.description" class="mt-0.5 text-sm text-dark-400">{{ child.description }}</p>
                  </NuxtLink>
                </div>
              </PopoverPanel>
            </Transition>
          </Popover>
          <!-- Simple link -->
          <NuxtLink
            v-else
            :to="item.href!"
            class="rounded-full px-4 py-2 text-sm font-medium text-dark-700 transition hover:bg-brand-50 hover:text-brand-600"
            active-class="text-brand-600 bg-brand-50">
            {{ item.label }}
          </NuxtLink>
        </template>
      </PopoverGroup>

      <!-- CTA + mobile toggle -->
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/login"
          class="hidden rounded-full border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 lg:block">
          Login
        </NuxtLink>
      
        <button
          class="rounded-full p-2 text-dark-600 transition hover:bg-brand-50 hover:text-brand-600 lg:hidden"
          aria-label="Open menu"
          @click="ui.openMobileMenu()">
          <Bars3Icon class="h-6 w-6" />
        </button>
      </div>
    </nav>

    <TheMobileMenu />
  </header>
</template>
