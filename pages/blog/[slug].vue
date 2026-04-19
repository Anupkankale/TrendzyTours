<script setup lang="ts">
const route = useRoute()
const { data: post } = await useAsyncData(`blog-${route.params.slug}`, () =>
  queryContent(`/blog/${route.params.slug}`).findOne()
)

if (!post.value) throw createError({ statusCode: 404, statusMessage: "Post not found" })

useSeoMeta({
  title: `${post.value.title} | Trendzy Tours`,
  description: post.value.description,
  ogImage: post.value.image,
})
</script>

<template>
  <div v-if="post">
    <section class="bg-dark-900 py-20">
      <div class="container-max px-4 text-center sm:px-6 lg:px-8">
        <UiAppBadge v-if="post.category" :label="post.category" />
        <h1 class="mt-3 font-heading text-4xl font-bold text-white lg:text-5xl">{{ post.title }}</h1>
        <p class="mt-3 text-sm text-gray-400">{{ post.publishedAt }} · {{ post.author ?? "Trendzy Tours Team" }}</p>
      </div>
    </section>
    <section class="section-padding bg-white">
      <div class="container-max px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl">
          <NuxtImg
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            class="mb-10 h-72 w-full rounded-2xl object-cover shadow-md"
            :width="900"
            :height="400"
            loading="eager" />
          <ContentRenderer :value="post" class="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-gold-600" />
          <div class="mt-12 border-t pt-8">
            <NuxtLink to="/blog" class="text-sm font-semibold text-gold-600 hover:underline">← Back to Blog</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
