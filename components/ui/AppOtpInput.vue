<script setup lang="ts">
const props = defineProps<{
  status: "idle" | "verifying" | "verified" | "wrong"
}>()

const emit = defineEmits<{
  complete: [otp: string]
  reset: []
}>()

const digits = ref<string[]>(Array(6).fill(""))
const inputRefs = ref<(HTMLInputElement | null)[]>(Array(6).fill(null))

function setRef(el: unknown, i: number) {
  inputRefs.value[i] = el as HTMLInputElement | null
}

function handleInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value.replace(/\D/g, "").slice(-1)
  digits.value[index] = val
  input.value = val
  if (val && index < 5) {
    nextTick(() => inputRefs.value[index + 1]?.focus())
  }
  if (digits.value.every((d) => d !== "")) {
    emit("complete", digits.value.join(""))
  }
}

function handleKeydown(index: number, e: KeyboardEvent) {
  if (e.key === "Backspace") {
    if (!digits.value[index] && index > 0) {
      digits.value[index - 1] = ""
      nextTick(() => inputRefs.value[index - 1]?.focus())
    } else {
      digits.value[index] = ""
    }
  } else if (e.key === "ArrowLeft" && index > 0) {
    inputRefs.value[index - 1]?.focus()
  } else if (e.key === "ArrowRight" && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData("text").replace(/\D/g, "").slice(0, 6) ?? ""
  if (text.length === 6) {
    text.split("").forEach((c, i) => { digits.value[i] = c })
    nextTick(() => {
      inputRefs.value[5]?.focus()
      emit("complete", text)
    })
  }
}

// After wrong: shake for 1.5s then clear for retry
watch(() => props.status, (s) => {
  if (s === "wrong") {
    setTimeout(() => {
      digits.value = Array(6).fill("")
      emit("reset")
      nextTick(() => inputRefs.value[0]?.focus())
    }, 1500)
  }
})

function boxClass(index: number) {
  const base = "w-10 h-12 rounded-xl border-2 text-center text-xl font-bold caret-transparent transition-all duration-150 focus:outline-none"
  if (props.status === "verified") return `${base} border-green-400 bg-green-50 text-green-700 cursor-default`
  if (props.status === "wrong") return `${base} border-red-400 bg-red-50 text-red-600 animate-shake`
  if (props.status === "verifying") return `${base} border-brand-300 bg-brand-50 text-dark-700 cursor-wait`
  if (digits.value[index]) return `${base} border-brand-500 bg-white text-dark-900`
  return `${base} border-gray-200 bg-white text-dark-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100`
}
</script>

<template>
  <div class="flex items-center gap-3">
    <!-- 6 digit boxes -->
    <div class="flex gap-2">
      <input
        v-for="i in 6"
        :key="i"
        :ref="(el) => setRef(el, i - 1)"
        :value="digits[i - 1]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        autocomplete="one-time-code"
        :disabled="status === 'verified' || status === 'verifying'"
        :class="boxClass(i - 1)"
        @input="handleInput(i - 1, $event)"
        @keydown="handleKeydown(i - 1, $event)"
        @paste="handlePaste" />
    </div>

    <!-- Status icon -->
    <div class="flex-shrink-0 w-9">
      <!-- Spinner while verifying -->
      <div
        v-if="status === 'verifying'"
        class="h-9 w-9 rounded-full border-[3px] border-brand-100 border-t-brand-500 animate-spin" />

      <!-- Green tick on success -->
      <div
        v-else-if="status === 'verified'"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 shadow-sm">
        <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <!-- Red cross on wrong -->
      <div
        v-else-if="status === 'wrong'"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 shadow-sm">
        <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>
  </div>
</template>
