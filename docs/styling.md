# Styling Guide

## Tailwind CSS

The project uses **Tailwind CSS v3** configured in `tailwind.config.ts`.

- `@tailwindcss/typography` is installed for rich text / blog content styling (use the `prose` class)
- `prettier-plugin-tailwindcss` enforces consistent class ordering on save

## Conventions

- Use Tailwind utility classes directly in templates — avoid custom CSS unless necessary
- Responsive prefixes: `sm:` `md:` `lg:` `xl:` (mobile-first)
- Dark mode: configure in `tailwind.config.ts` if needed

## Google Fonts

Fonts are loaded via `@nuxtjs/google-fonts` configured in `nuxt.config.ts`.

## Component Class Patterns

| Pattern | Where Used |
|---------|-----------|
| `prose` | Blog post content rendered by Nuxt Content |
| Section containers | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Cards | `rounded-2xl shadow-md overflow-hidden` |
| Buttons (base) | Handled by `AppButton.vue` — use that component |

## Images

Images are served through `@nuxt/image` (`<NuxtImg>` / `<NuxtPicture>`) for automatic optimisation and lazy loading.
