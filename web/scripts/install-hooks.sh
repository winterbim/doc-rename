#!/bin/sh
# Install git pre-commit hook for DOC-RENAME.
# Run once after cloning: bash web/scripts/install-hooks.sh
set -e

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || git rev-parse --show-toplevel)"
HOOK="$ROOT/.git/hooks/pre-commit"

cat > "$HOOK" <<'HOOK_BODY'
#!/bin/sh
# Pre-commit: TypeScript strict check on web/ subpackage.
set -e
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT/web"
echo "[pre-commit] Running TypeScript check..."
npx --no-install tsc --noEmit
echo "[pre-commit] TypeScript OK"
HOOK_BODY

chmod +x "$HOOK"
echo "Pre-commit hook installed at $HOOK"
