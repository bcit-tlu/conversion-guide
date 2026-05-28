# AGENTS.md

## Setup Commands

- Install dependencies: `npm install`
- Build (gulp): `npm run build`
- Dev server (browser-sync): `npm run watch`
- Helm lint: `helm lint charts/`
- Helm validate: `helm template test charts/ | kubeconform -strict -summary -schema-location default -ignore-missing-schemas`

## Code Style

- Follow conventional commit format for PR titles
- License: MPL-2.0

## Project Structure

- `/charts` — Helm chart for Kubernetes deployment (flat layout)
- `/conf.d` — Nginx server configuration and routing logic
- `/js` — Frontend logic for UI transformations and analytics
- `/pages` — Source HTML documentation and interactive guides
- `/partials` — Reusable HTML components and interaction templates
- `/scss` — Styling for Word simulations and course elements
- `/assets` — Templates, design sources, and static media
- `/gulpfile.mjs` — Asset compilation and build pipeline (Gulp)
- `/.github/workflows/` — CI/CD pipelines

## Architecture

- **Runtime**: Nginx-unprivileged on port 8080 (static site served by nginx)
- **Build**: Gulp pipeline compiles SCSS, assembles HTML partials, and outputs to `dist/`
- **Analytics**: OpenTelemetry browser instrumentation for usage analytics (logs exported via OTLP to Loki/Grafana)
- **Health endpoint**: Nginx responds to probe requests on `/`

## Development Workflow

- Create feature branches from `main`
- Use pull requests for code review
- PR titles must follow conventional commit format (enforced by `pr-title-lint.yaml`)
- Squash commits before merging

## CI/CD

- CI uses shared `bcit-tlu/.github` OCI build reusable workflow
- `helm-lint` validates Helm charts on every push and PR
- `release-please` manages versioning via conventional commits (`release-type: "simple"`)
- Version is tracked in `.release-please-manifest.json` and `Chart.yaml` (`# x-release-please-version` annotations)
- Images are published to `ghcr.io/bcit-tlu/conversion-guide/conversion-guide`
- Charts are published to `oci://ghcr.io/bcit-tlu/conversion-guide/charts`
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` is set in all workflows

## Deployment

- Deployed to Kubernetes via Flux CD (see `bcit-tlu/flux-fleet`)
- Ingress: `conversion-guide.<CLUSTER_ENV>.ltc.bcit.ca`
