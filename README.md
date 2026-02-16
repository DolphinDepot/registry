# Dolphin Depot Registry

The central registry of homebrew applications for [Dolphin Depot](https://gcstore.webhdx.dev). App authors submit their projects here via pull request.

## How It Works

1. You open a PR adding `registry/<your-app-slug>/source.yaml` and `registry/<your-app-slug>/manifest.json`
2. CI validates your submission automatically
3. A maintainer reviews and merges

Once merged, the Indexer picks up your app on the next scan cycle.

## Manifest

Each app entry requires a `manifest.json` that describes your application. The full JSON Schema is available at `scripts/schemas/manifest.schema.json`.

Minimal example:

```json
{
  "name": "My App",
  "maintainer": "yourname",
  "description_short": "A short description of your app",
  "category": "utilities",
  "source": {
    "type": "github_release",
    "repository": "your-username/your-repo",
    "asset_pattern": "myapp-*.dol"
  },
  "treatments": []
}
```

## Submitting Your App

### 1. Choose a slug

Your app slug is the directory name under `registry/`. It must:

- Be lowercase alphanumeric with hyphens (e.g. `my-cool-app`)
- Match the pattern `^[a-z0-9]+(-[a-z0-9]+)*$`
- Be unique across the registry

### 2. Create `source.yaml`

```yaml
source:
  type: local
```

### 3. Open a pull request

Add `registry/<slug>/source.yaml` and `registry/<slug>/manifest.json` to your PR and open it against `main`.

## Development

```bash
npm install
npm run lint                # TypeScript type check
npm run validate -- --all   # Validate all entries
```

Set `GITHUB_TOKEN` to avoid API rate limits:

```bash
export GITHUB_TOKEN=ghp_...
npm run validate -- --all
```
