#!/usr/bin/env bash
set -euo pipefail

# Usage: test-manifests.sh <manifests> <workspace> <github-output>
# - manifests: newline-separated list of manifest paths
# - workspace: root of the repository checkout
# - github-output: path to $GITHUB_OUTPUT file

MANIFESTS="$1"
WORKSPACE="$2"
GITHUB_OUTPUT="$3"
IMAGE="ghcr.io/dolphindepot/indexer:latest"

FAILED=0
COMMENT=""

while IFS= read -r manifest; do
  [ -z "$manifest" ] && continue
  SLUG=$(basename "$(dirname "$manifest")")
  echo "::group::Testing $manifest"

  PASSED=true
  OUTPUT=$(docker run --rm \
    ${DOCKER_PLATFORM:+--platform "$DOCKER_PLATFORM"} \
    -e GITHUB_TOKEN="${GITHUB_TOKEN:-}" \
    -v "${WORKSPACE}:/workspace:ro" \
    "$IMAGE" \
    test-manifest "/workspace/$manifest" 2>&1) || PASSED=false

  echo "$OUTPUT"
  echo "::endgroup::"

  DIST_TREE=$(echo "$OUTPUT" | sed -n '/^--- distDir contents ---$/,/^---$/p' | sed '1d;$d')

  if [ "$PASSED" = true ]; then
    COMMENT="${COMMENT}### ✓ \`${SLUG}\`
"
  else
    COMMENT="${COMMENT}### ✗ \`${SLUG}\`
"
  fi

  if [ -n "$DIST_TREE" ]; then
    COMMENT="${COMMENT}
Distribution package contents:
\`\`\`
${DIST_TREE}
\`\`\`
"
  fi

  if [ "$PASSED" = false ]; then
    ERROR=$(echo "$OUTPUT" | tail -1)
    COMMENT="${COMMENT}
> ${ERROR}
"
    echo "::error file=$manifest::Manifest test failed"
    FAILED=1
  fi

  COMMENT="${COMMENT}
"
done <<< "$MANIFESTS"

echo "comment<<EOF" >> "$GITHUB_OUTPUT"
echo "$COMMENT" >> "$GITHUB_OUTPUT"
echo "EOF" >> "$GITHUB_OUTPUT"
echo "failed=$FAILED" >> "$GITHUB_OUTPUT"
