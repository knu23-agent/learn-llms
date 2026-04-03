#!/usr/bin/env bash
# deploy.sh — Build and push to gh-pages, auto-busting the SW cache.
# Usage: ./deploy.sh
# Run from the repo root.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

# Must be on main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Must be on main branch (currently on $CURRENT_BRANCH)"
  exit 1
fi

# Commit everything first if there are staged/unstaged changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  Uncommitted changes detected. Committing them first..."
  git add -A
  git commit -m "chore: pre-deploy commit"
fi

# Get short commit hash (7 chars)
COMMIT=$(git rev-parse --short HEAD)
echo "🔨 Deploy commit: $COMMIT"

# Stamp the SW with this commit hash
sed "s/__COMMIT_HASH__/$COMMIT/g" sw.js > sw.tmp.js && mv sw.tmp.js sw.js.deploy

# Switch to gh-pages and sync all files from main
git checkout gh-pages

# Copy all files from main (tracked by git)
git checkout main -- .

# Apply stamped SW
cp sw.js.deploy sw.js
rm -f sw.js.deploy

git add -A
git commit -m "deploy: $COMMIT — cache busted to learn-llms-$COMMIT"
git push origin gh-pages

# Restore sw.js template on main
git checkout main
# sw.js on main still has the __COMMIT_HASH__ placeholder (untouched)

echo ""
echo "✅ Deployed!"
echo "   Cache key: learn-llms-$COMMIT"
echo "   Site: https://knu23-agent.github.io/learn-llms/"
