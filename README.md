# Dolphin Depot Registry

The central registry of homebrew applications for [Dolphin Depot](https://gcstore.webhdx.dev). App authors submit their projects here via pull request.

## How It Works

1. You open a PR adding `registry/<your-app-slug>/source.yaml` and `registry/<your-app-slug>/manifest.json`
2. CI validates your submission automatically
3. A maintainer reviews and merges

Once merged, the Indexer picks up your app on the next scan cycle.

## Submitting Your App

### 1. Choose a slug

Your app slug is the directory name under `registry/`. It must:

- Be lowercase alphanumeric with hyphens (e.g. `my-cool-app`)
- Match the pattern `^[a-z0-9]+(-[a-z0-9]+)*$`
- Be unique across the registry

### 2. Create your app entry

Each entry consists of two files inside `registry/<slug>/`:

**`source.yaml`** tells the Indexer where to look for manifest file:

```yaml
source:
  type: local
```

**`manifest.json`** describes your application. The full JSON Schema is available at `scripts/schemas/manifest.schema.json`.

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

### 3. Open a pull request

Add both files and open a PR against `main`.

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

## Acknowledgements

Dolphin Depot is inspired by [Open Shop Channel](https://oscwii.org/) for Nintendo Wii. Many elements and concepts have been borrowed from the OSC project. We appreciate the work of OSC authors and encourage all Nintendo Wii users to check out Open Shop Channel.
