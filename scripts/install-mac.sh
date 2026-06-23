#!/usr/bin/env bash
#
# install-mac.sh — Instala la build de Nihongo en /Applications de forma segura.
#
# SIEMPRE fuerza el cierre de la app antes de reemplazarla (con reintentos), para
# que macOS no bloquee el reemplazo del bundle si la app estaba abierta. Luego
# instala con ditto, limpia la cuarentena, re-registra con LaunchServices y deja
# una copia del DMG en el Escritorio. NO abre la app (la abre el usuario).
#
# Uso:  npm run install:mac      (o)   bash scripts/install-mac.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_DIR="$ROOT/src-tauri/target/release/bundle"
APP_SRC="$BUNDLE_DIR/macos/Nihongo.app"
APP_DEST="/Applications/Nihongo.app"
DESKTOP="$HOME/Desktop"

if [ ! -d "$APP_SRC" ]; then
  echo "✖ No encuentro $APP_SRC — corre primero 'npm run tauri build'." >&2
  exit 1
fi

echo "→ Forzando cierre de Nihongo (si está abierta)…"
closed=0
for i in 1 2 3 4 5; do
  osascript -e 'tell application "Nihongo" to quit' >/dev/null 2>&1 || true
  pkill -x Nihongo >/dev/null 2>&1 || true
  pkill -9 -x Nihongo >/dev/null 2>&1 || true
  pkill -9 -f "Nihongo.app/Contents/MacOS/Nihongo" >/dev/null 2>&1 || true
  sleep 1
  if ! pgrep -x Nihongo >/dev/null 2>&1; then closed=1; break; fi
  echo "  intento $i: aún corriendo, reintentando…"
done

if [ "$closed" -ne 1 ]; then
  echo "✖ No pude cerrar Nihongo. Ciérrala manualmente (⌘Q) y vuelve a correr el script." >&2
  pgrep -lx Nihongo >&2 || true
  exit 1
fi
echo "  ✓ cerrada"

echo "→ Reemplazando ${APP_DEST} ..."
rm -rf "$APP_DEST"
ditto "$APP_SRC" "$APP_DEST"
xattr -dr com.apple.quarantine "$APP_DEST" 2>/dev/null || true
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_DEST" || true

# Copiar el DMG (si existe) al Escritorio como instalador visible
DMG_SRC="$(ls -t "$BUNDLE_DIR"/dmg/Nihongo_*.dmg 2>/dev/null | head -1 || true)"
if [ -n "${DMG_SRC:-}" ]; then
  cp -f "$DMG_SRC" "$DESKTOP/$(basename "$DMG_SRC")"
  echo "  ✓ DMG copiado a $DESKTOP/$(basename "$DMG_SRC")"
fi

echo "✓ Instalada en $APP_DEST a las $(date '+%H:%M:%S'). Ábrela tú cuando quieras."
