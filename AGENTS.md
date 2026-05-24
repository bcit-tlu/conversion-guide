# AGENTS.md

## Setup Commands

- Install dependencies: `npm install`
- Build (gulp): `npm run build`
- Dev server (browser-sync): `npm run watch`
- Lint chart: `helm lint charts/`
- Validate chart: `helm template test charts/ | kubeconform -strict -summary -schema-location default -ignore-missing-schemas`

## Code Style

- Follow conventional commit format for PR titles and commits
- License: MPL-2.0

## Project Structure

- `charts/` - Helm chart for Kubernetes deployment
- `conf.d/` - Nginx server configuration and routing logic
- `js/` - Frontend logic for UI transformations and analytics
- `pages/` - Source HTML documentation and interactive guides
- `partials/` - Reusable HTML components and interaction templates
- `scss/` - Styling for Word simulations and course elements
- `gulpfile.mjs` - Asset compilation and build pipeline (Gulp)
- `assets/` - Templates, design sources, and static media

## CI/CD

- **Versioning**: release-please with `simple` release type
- **Images & Charts**: GHCR via shared `bcit-tlu/.github` `oci-build.yaml` reusable workflow
- **PR title lint**: Conventional Commits enforced by `pr-title-lint.yaml`
- **Helm**: chart linted and kubeconform-validated on every push/PR

## Deployment

- Flux CD reconciles Helm releases from GHCR OCI artifacts
- Hosts: `conversion-guide.<CLUSTER_ENV>.ltc.bcit.ca`
