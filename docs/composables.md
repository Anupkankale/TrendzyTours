# Composables

All composables live under `composables/` and are auto-imported by Nuxt.

## `useContactForm.ts`

Handles the contact page form logic.

- Uses **VeeValidate** + **Zod** for schema-based validation
- Manages form submission state (`loading`, `success`, `error`)
- Validates: name, email, message fields

**Usage:**
```vue
<script setup>
const { form, onSubmit, isLoading } = useContactForm()
</script>
```

## `useNewsletterForm.ts`

Handles newsletter subscription form.

- Validates email with Zod
- Manages `subscribed` state for post-submission UI
- Can be placed in the footer or any section

**Usage:**
```vue
<script setup>
const { email, subscribe, isSubscribed } = useNewsletterForm()
</script>
```

## `useTours.ts`

Composable layer over the `tours` Pinia store.

- Exposes `tours`, `filteredTours`, and filter helpers
- Calls `fetchTours()` on mount if data is not yet loaded
- Simplifies tour-related logic in page components

**Usage:**
```vue
<script setup>
const { tours, filteredTours, setFilter } = useTours()
</script>
```
