// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(
  {
    // The Laravel app and the Node API are separate packages with their own
    // tooling; backend/vendor in particular is composer-installed third-party
    // JS that is gitignored, so linting it makes results differ between a
    // local checkout and CI.
    ignores: ["backend/**"],
  },
)
