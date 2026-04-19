<script setup lang="ts">
useSeoMeta({
  title: "Travel Blog | Trendzy Tours",
  description: "Travel tips, destination guides, and holiday inspiration from the Trendzy Tours team. Plan your next adventure.",
})

const { data: posts } = await useAsyncData("blog-posts", () =>
  queryContent("blog").sort({ publishedAt: -1 }).find()
)
</script>

<template>
  <div>
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <h1 class="font-heading text-4xl font-bold text-white lg:text-5xl">Travel Blog</h1>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-300">
          Expert tips, destination guides, and travel inspiration — straight from our team of travel lovers.
        </p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <div v-if="posts?.length" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="post in posts"
            :key="post._path"
            :to="post._path"
            class="group flex flex-col overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl">
            <NuxtImg
              v-if="post.image"
              :src="post.image"
              :alt="post.title"
              class="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              :width="600"
              :height="300"
              loading="lazy" />
            <div class="flex flex-1 flex-col p-5">
              <UiAppBadge v-if="post.category" :label="post.category" />
              <h2 class="mt-3 font-heading text-lg font-bold text-dark-900">{{ post.title }}</h2>
              <p class="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">{{ post.description }}</p>
              <p class="mt-4 text-xs text-gray-400">{{ post.publishedAt }}</p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="py-16 text-center">
          <p class="text-gray-500">Blog posts coming soon. Check back shortly!</p>
        </div>
      </div>
    </section>
  </div>
</template>
