<script setup lang="ts">
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue"
import { XMarkIcon, ChevronDownIcon } from "@heroicons/vue/24/outline"
import { navigation } from "@/data/navigation"
import { useUIStore } from "@/stores/ui"

const ui = useUIStore()
</script>

<template>
  <Dialog :open="ui.mobileMenuOpen" class="relative z-50 lg:hidden" @close="ui.closeMobileMenu()">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-brand-950/30 backdrop-blur-sm" aria-hidden="true" />
    <div class="fixed inset-0 flex justify-end">
      <DialogPanel class="glass w-full max-w-sm overflow-y-auto px-6 py-6">
        <div class="mb-6 flex items-center justify-between">
          <span class="font-heading text-xl font-bold text-brand-900">Trendzy<span class="text-brand-500">Tours</span></span>
          <button class="rounded-full p-1.5 text-dark-500 transition hover:bg-brand-50 hover:text-brand-600" @click="ui.closeMobileMenu()">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <nav class="flex flex-col gap-1">
          <template v-for="item in navigation" :key="item.label">
            <Disclosure v-if="item.children" v-slot="{ open }">
              <DisclosureButton
                class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-medium text-dark-700 transition hover:bg-brand-50 hover:text-brand-600">
                {{ item.label }}
                <ChevronDownIcon :class="['h-5 w-5 text-brand-400 transition', open ? 'rotate-180' : '']" />
              </DisclosureButton>
              <DisclosurePanel class="ml-4 mt-1 flex flex-col gap-1">
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.href"
                  :to="child.href"
                  class="block rounded-xl px-3 py-2 text-sm text-dark-500 transition hover:bg-brand-50 hover:text-brand-600"
                  @click="ui.closeMobileMenu()">
                  {{ child.label }}
                </NuxtLink>
              </DisclosurePanel>
            </Disclosure>
            <NuxtLink
              v-else
              :to="item.href!"
              class="block rounded-xl px-3 py-2.5 text-base font-medium text-dark-700 transition hover:bg-brand-50 hover:text-brand-600"
              @click="ui.closeMobileMenu()">
              {{ item.label }}
            </NuxtLink>
          </template>
        </nav>
        <div class="mt-8 flex flex-col gap-3">
          <NuxtLink
            to="/login"
            class="block w-full rounded-full border border-brand-200 px-5 py-3 text-center font-semibold text-brand-600 transition hover:bg-brand-50"
            @click="ui.closeMobileMenu()">
            Login
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="block w-full rounded-full bg-brand-500 px-5 py-3 text-center font-semibold text-white shadow-md transition hover:bg-brand-600"
            @click="ui.closeMobileMenu()">
            Get a Quote
          </NuxtLink>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
