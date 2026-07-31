# PostHog post-wizard report

The wizard integrated PostHog into the portfolio homepage using Vite and `posthog-js`. The SDK initializes in the browser from `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST`, preserving PostHog defaults for autocapture and session recording. The homepage now records featured project-card openings with their destination path, plus mobile navigation-menu openings. A dashboard and two related insights were created in PostHog.

| Event name | Description | File |
| --- | --- | --- |
| `portfolio_project_opened` | Tracks when a visitor opens a featured portfolio project from the homepage. | `index.html` |
| `navigation_menu_opened` | Tracks when a visitor opens the mobile navigation menu. | `index.html` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) dashboard](https://us.posthog.com/project/514951/dashboard/1857512)
- [Portfolio projects opened (wizard)](https://us.posthog.com/project/514951/insights/OH0uYqV3)
- [Mobile menu opens (wizard)](https://us.posthog.com/project/514951/insights/z1CSKqTY)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names you added to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
