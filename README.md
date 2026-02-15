# Dolphin Depot Registry

The central registry of homebrew applications for [Dolphin Depot](https://gcstore.webhdx.dev). App authors submit their projects here via pull request.

## How It Works

1. You add a `dolphin-depot.json` manifest to the root of your app's repository
2. You open a PR here adding a `registry/<your-app-slug>/source.yaml` file
3. CI validates your submission automatically
4. A maintainer reviews and merges

Once merged, the Indexer picks up your app on the next scan cycle.

## Prerequisites

Your app repository must have a `dolphin-depot.json` in its root. See the [manifest specification](../docs/manifest.md) for the full schema.

Minimal example:

```json
{
  "name": "My App",
  "maintainer": "yourname",
  "description_short": "A short description of your app",
  "category": "utilities",
  "source": {
    "type": "github_release",
    "asset_pattern": "myapp-*.zip"
  },
  "treatments": []
}
```

### Categories

| Slug | Description |
|---|---|
| `games` | Original homebrew games |
| `emulators` | Console and computer emulators |
| `utilities` | Tools and utilities |
| `demos` | Demoscene productions |
| `media` | Media players and related apps |

## Submitting Your App

### 1. Choose a slug

Your app slug is the directory name under `registry/`. It must:

- Be lowercase alphanumeric with hyphens (e.g. `my-cool-app`)
- Match the pattern `^[a-z0-9]+(-[a-z0-9]+)*$`
- Be unique across the registry

### 2. Create `source.yaml`

```yaml
source:
  type: github
  repository: https://github.com/your-username/your-repo
```

### 3. Open a pull request

Add your file at `registry/<slug>/source.yaml` and open a PR against `main`.

## Local Validation

```bash
npm install
npm run validate -- --all
```

This runs all 6 checks against every entry in the registry. Individual entries are validated automatically in CI when you open a PR.

### Checks performed

1. **yaml-syntax** -- source.yaml is valid YAML
2. **required-fields** -- all required fields present and valid
3. **repo-exists** -- GitHub repository is publicly accessible
4. **manifest-exists** -- dolphin-depot.json found in repository root
5. **manifest-valid** -- manifest passes schema validation
6. **slug-unique** -- slug format is valid and unique

## Development

```bash
npm install
npm run lint        # TypeScript type check
npm run validate -- --all   # Validate all entries
```

Set `GITHUB_TOKEN` to avoid API rate limits:

```bash
export GITHUB_TOKEN=ghp_...
npm run validate -- --all
```
