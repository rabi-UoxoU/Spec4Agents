#!/usr/bin/env bash
set -euo pipefail
: "${RELEASE_TAG:?RELEASE_TAG is required}"
if ! [[ "$RELEASE_TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid release tag: $RELEASE_TAG" >&2
  exit 2
fi
# Each command gates publishing. Never use artifacts after a failed current build.
make check
make test
make all
node scripts/verify-dist.mjs
args=(release create "$RELEASE_TAG" dist/markdown/AGENTS.md#AGENTS.md dist/skill/SKILL.spec4agents.tgz#SKILL.spec4agents.tgz --title "$RELEASE_TAG" --generate-notes)
if [ "${GITHUB_EVENT_NAME:-}" = "workflow_dispatch" ]; then
  args+=(--target "${GITHUB_SHA:?GITHUB_SHA is required for manual release}")
fi
gh "${args[@]}"
