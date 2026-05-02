<script setup lang="ts">
import type { TourCategory, TourFormInput, TourItineraryDay } from "@/types/tour"

const props = withDefaults(defineProps<{
  initialValue?: TourFormInput
  submitting?: boolean
  submitLabel?: string
}>(), {
  initialValue: undefined,
  submitting: false,
  submitLabel: "Save Tour",
})

const emit = defineEmits<{
  submit: [payload: TourFormInput]
}>()

const categoryOptions: { value: TourCategory; label: string }[] = [
  { value: "domestic", label: "Domestic" },
  { value: "world-travellers", label: "World Travellers" },
  { value: "cruise", label: "Cruise" },
  { value: "ladies-only", label: "Ladies Only" },
]

const form = reactive<TourFormInput>({
  slug: "",
  name: "",
  category: "domestic",
  region: "",
  destination: "",
  duration: 1,
  groupSize: { min: 1, max: 10 },
  pricePerPerson: 0,
  heroImage: "",
  gallery: [""],
  shortDescription: "",
  description: "",
  seoDescription: "",
  highlights: [],
  inclusions: [],
  exclusions: [],
  itinerary: [{ day: 1, title: "", description: "", meals: [], accommodation: "" }],
  featured: false,
  publishedAt: null,
})

const listFields = reactive({
  highlights: "",
  inclusions: "",
  exclusions: "",
})

const itineraryMeals = ref<string[]>([])
const slugTouched = ref(false)
const formError = ref("")

function normalizeLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean)
}

function hydrateForm(data?: TourFormInput) {
  const source = data ?? {
    slug: "",
    name: "",
    category: "domestic" as TourCategory,
    region: "",
    destination: "",
    duration: 1,
    groupSize: { min: 1, max: 10 },
    pricePerPerson: 0,
    heroImage: "",
    gallery: [""],
    shortDescription: "",
    description: "",
    seoDescription: "",
    highlights: [],
    inclusions: [],
    exclusions: [],
    itinerary: [{ day: 1, title: "", description: "", meals: [], accommodation: "" }],
    featured: false,
    publishedAt: null,
  }

  form.slug = source.slug
  form.name = source.name
  form.category = source.category
  form.region = source.region
  form.destination = source.destination
  form.duration = source.duration
  form.groupSize = { ...source.groupSize }
  form.pricePerPerson = source.pricePerPerson
  form.heroImage = source.heroImage
  form.gallery = source.gallery.length ? [...source.gallery] : [""]
  form.shortDescription = source.shortDescription
  form.description = source.description
  form.seoDescription = source.seoDescription
  form.highlights = [...source.highlights]
  form.inclusions = [...source.inclusions]
  form.exclusions = [...source.exclusions]
  form.itinerary = source.itinerary.length
    ? source.itinerary.map((day) => ({
      day: day.day,
      title: day.title,
      description: day.description,
      meals: [...day.meals],
      accommodation: day.accommodation ?? "",
    }))
    : [{ day: 1, title: "", description: "", meals: [], accommodation: "" }]
  form.featured = source.featured
  form.publishedAt = source.publishedAt

  listFields.highlights = form.highlights.join("\n")
  listFields.inclusions = form.inclusions.join("\n")
  listFields.exclusions = form.exclusions.join("\n")
  itineraryMeals.value = form.itinerary.map((day) => day.meals.join(", "))
  formError.value = ""
}

watch(() => props.initialValue, (value) => {
  hydrateForm(value)
  slugTouched.value = Boolean(value?.slug)
}, { immediate: true })

watch(() => form.name, (value) => {
  if (slugTouched.value || !value.trim()) return
  form.slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
})

function addGalleryImage() {
  form.gallery.push("")
}

function removeGalleryImage(index: number) {
  if (form.gallery.length === 1) {
    form.gallery[0] = ""
    return
  }
  form.gallery.splice(index, 1)
}

function addItineraryDay() {
  form.itinerary.push({
    day: form.itinerary.length + 1,
    title: "",
    description: "",
    meals: [],
    accommodation: "",
  })
  itineraryMeals.value.push("")
}

function removeItineraryDay(index: number) {
  if (form.itinerary.length === 1) return
  form.itinerary.splice(index, 1)
  itineraryMeals.value.splice(index, 1)
  form.itinerary.forEach((day, dayIndex) => {
    day.day = dayIndex + 1
  })
}

function setPublished(event: Event) {
  const checked = (event.target as HTMLInputElement | null)?.checked ?? false
  form.publishedAt = checked ? new Date().toISOString().slice(0, 10) : null
}

function submitForm() {
  form.highlights = normalizeLines(listFields.highlights)
  form.inclusions = normalizeLines(listFields.inclusions)
  form.exclusions = normalizeLines(listFields.exclusions)
  form.gallery = form.gallery.map((item) => item.trim()).filter(Boolean)
  form.itinerary = form.itinerary.map((day, index) => ({
    ...day,
    day: index + 1,
    meals: itineraryMeals.value[index]?.split(",").map((meal) => meal.trim()).filter(Boolean) ?? [],
    accommodation: day.accommodation?.trim() || undefined,
  })) as TourItineraryDay[]

  if (!form.name || !form.slug || !form.region || !form.destination || !form.heroImage) {
    formError.value = "Please fill in the required tour details."
    return
  }

  if (!form.gallery.length || !form.highlights.length || !form.inclusions.length || !form.exclusions.length) {
    formError.value = "Gallery, highlights, inclusions, and exclusions cannot be empty."
    return
  }

  if (form.itinerary.some((day) => !day.title || !day.description || day.meals.length === 0)) {
    formError.value = "Each itinerary day needs a title, description, and at least one meal."
    return
  }

  if (form.groupSize.max < form.groupSize.min) {
    formError.value = "Maximum group size must be greater than or equal to minimum group size."
    return
  }

  formError.value = ""
  emit("submit", {
    ...form,
    groupSize: { ...form.groupSize },
    gallery: [...form.gallery],
    highlights: [...form.highlights],
    inclusions: [...form.inclusions],
    exclusions: [...form.exclusions],
    itinerary: form.itinerary.map((day) => ({ ...day, meals: [...day.meals] })),
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submitForm">
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <label class="tour-form-label">Tour Name *</label>
        <input v-model="form.name" type="text" class="tour-form-input" placeholder="Bali Bliss" />
      </div>
      <div>
        <label class="tour-form-label">Slug *</label>
        <input
          v-model="form.slug"
          type="text"
          class="tour-form-input"
          placeholder="bali-bliss-7-nights"
          @input="slugTouched = true" />
      </div>
      <div>
        <label class="tour-form-label">Category *</label>
        <select v-model="form.category" class="tour-form-input">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
      <div>
        <label class="tour-form-label">Region *</label>
        <input v-model="form.region" type="text" class="tour-form-input" placeholder="asia" />
      </div>
      <div>
        <label class="tour-form-label">Destination *</label>
        <input v-model="form.destination" type="text" class="tour-form-input" placeholder="Bali, Indonesia" />
      </div>
      <div>
        <label class="tour-form-label">Hero Image URL *</label>
        <input v-model="form.heroImage" type="url" class="tour-form-input" placeholder="https://..." />
      </div>
      <div>
        <label class="tour-form-label">Duration (days) *</label>
        <input v-model.number="form.duration" min="1" type="number" class="tour-form-input" />
      </div>
      <div>
        <label class="tour-form-label">Price Per Person (INR) *</label>
        <input v-model.number="form.pricePerPerson" min="0" type="number" class="tour-form-input" />
      </div>
      <div>
        <label class="tour-form-label">Min Group Size *</label>
        <input v-model.number="form.groupSize.min" min="1" type="number" class="tour-form-input" />
      </div>
      <div>
        <label class="tour-form-label">Max Group Size *</label>
        <input v-model.number="form.groupSize.max" min="1" type="number" class="tour-form-input" />
      </div>
    </div>

    <div>
      <label class="tour-form-label">Short Description *</label>
      <textarea v-model="form.shortDescription" rows="3" class="tour-form-input resize-none" />
    </div>

    <div>
      <label class="tour-form-label">Description *</label>
      <textarea v-model="form.description" rows="6" class="tour-form-input resize-y" />
    </div>

    <div>
      <label class="tour-form-label">SEO Description *</label>
      <textarea v-model="form.seoDescription" rows="3" class="tour-form-input resize-none" />
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div>
        <label class="tour-form-label">Highlights *</label>
        <textarea v-model="listFields.highlights" rows="6" class="tour-form-input resize-y" placeholder="One item per line" />
      </div>
      <div>
        <label class="tour-form-label">Inclusions *</label>
        <textarea v-model="listFields.inclusions" rows="6" class="tour-form-input resize-y" placeholder="One item per line" />
      </div>
      <div>
        <label class="tour-form-label">Exclusions *</label>
        <textarea v-model="listFields.exclusions" rows="6" class="tour-form-input resize-y" placeholder="One item per line" />
      </div>
    </div>

    <section class="rounded-2xl border border-dark-100 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-heading text-lg font-semibold text-dark-900">Gallery Images</h2>
          <p class="mt-0.5 text-sm text-dark-400">Add one image URL per gallery slot.</p>
        </div>
        <button type="button" class="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50" @click="addGalleryImage">
          Add Image
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <div v-for="(image, index) in form.gallery" :key="index" class="flex gap-3">
          <input v-model="form.gallery[index]" type="url" class="tour-form-input flex-1" placeholder="https://..." />
          <button type="button" class="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50" @click="removeGalleryImage(index)">
            Remove
          </button>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-dark-100 bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-heading text-lg font-semibold text-dark-900">Itinerary</h2>
          <p class="mt-0.5 text-sm text-dark-400">Each day needs meals as a comma-separated list.</p>
        </div>
        <button type="button" class="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50" @click="addItineraryDay">
          Add Day
        </button>
      </div>

      <div class="mt-4 space-y-4">
        <div v-for="(day, index) in form.itinerary" :key="index" class="rounded-2xl border border-dark-100 p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-heading text-base font-semibold text-dark-900">Day {{ index + 1 }}</h3>
            <button
              type="button"
              class="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-dark-300"
              :disabled="form.itinerary.length === 1"
              @click="removeItineraryDay(index)">
              Remove
            </button>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="tour-form-label">Title *</label>
              <input v-model="day.title" type="text" class="tour-form-input" />
            </div>
            <div>
              <label class="tour-form-label">Accommodation</label>
              <input v-model="day.accommodation" type="text" class="tour-form-input" />
            </div>
          </div>

          <div class="mt-4">
            <label class="tour-form-label">Description *</label>
            <textarea v-model="day.description" rows="3" class="tour-form-input resize-y" />
          </div>

          <div class="mt-4">
            <label class="tour-form-label">Meals *</label>
            <input
              v-model="itineraryMeals[index]"
              type="text"
              class="tour-form-input"
              placeholder="Breakfast, Lunch, Dinner" />
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex items-center gap-3 rounded-2xl border border-dark-100 bg-white px-4 py-3 shadow-sm">
        <input v-model="form.featured" type="checkbox" class="h-4 w-4 rounded border-dark-300 text-brand-500 focus:ring-brand-300" />
        <div>
          <p class="text-sm font-semibold text-dark-800">Featured tour</p>
          <p class="text-xs text-dark-400">Shows in featured sections on the public site.</p>
        </div>
      </label>

      <label class="flex items-center gap-3 rounded-2xl border border-dark-100 bg-white px-4 py-3 shadow-sm">
        <input
          :checked="Boolean(form.publishedAt)"
          type="checkbox"
          class="h-4 w-4 rounded border-dark-300 text-brand-500 focus:ring-brand-300"
          @change="setPublished" />
        <div>
          <p class="text-sm font-semibold text-dark-800">Published</p>
          <p class="text-xs text-dark-400">Unpublished tours remain in draft status.</p>
        </div>
      </label>
    </div>

    <p v-if="formError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ formError }}
    </p>

    <div class="flex items-center justify-end gap-3">
      <NuxtLink
        to="/dashboard/tours"
        class="rounded-full border border-dark-200 px-5 py-2.5 text-sm font-semibold text-dark-600 hover:bg-dark-50">
        Cancel
      </NuxtLink>
      <button
        type="submit"
        :disabled="submitting"
        class="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300">
        {{ submitting ? "Saving..." : submitLabel }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.tour-form-label {
  @apply mb-1.5 block text-sm font-medium text-dark-700;
}

.tour-form-input {
  @apply w-full rounded-xl border border-dark-200 bg-white px-3 py-2.5 text-sm text-dark-700 placeholder-dark-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100;
}
</style>
