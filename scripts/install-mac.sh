#!/usr/bin/env bash
#
# install-mac.sh — Instala la build de Michi en /Applications de forma segura.
#
# SIEMPRE fuerza el cierre de la app antes de reemplazarla (con reintentos), para
# que macOS no bloquee el reemplazo del bundle si la app estaba abierta. Luego
# instala con ditto, limpia la cuarentena, re-registra con LaunchServices y deja
# una copia del DMG en el Escritorio. NO abre la app (la abre el usuario).
#
# La app se llamaba «Nihongo» antes de la beta 6.0. El identificador interno
# (com.nihongo.app) NO cambió, así que la base de datos y todo el progreso se
# conservan. Este script cierra y elimina el Nihongo.app viejo de /Applications
# en la transición para que no queden dos apps duplicadas.
#
# Uso:  npm run install:mac      (o)   bash scripts/install-mac.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_DIR="$ROOT/src-tauri/target/release/bundle"
APP_SRC="$BUNDLE_DIR/macos/Michi.app"
APP_DEST="/Applications/Michi.app"
LEGACY_DEST="/Applications/Nihongo.app"
DESKTOP="$HOME/Desktop"

if [ ! -d "$APP_SRC" ]; then
  echo "✖ No encuentro $APP_SRC — corre primero 'npm run tauri build'." >&2
  exit 1
fi

echo "→ Forzando cierre de Michi/Nihongo (si están abiertas)…"
closed=0
for i in 1 2 3 4 5; do
  for NAME in Michi Nihongo; do
    osascript -e "tell application \"$NAME\" to quit" >/dev/null 2>&1 || true
    pkill -x "$NAME" >/dev/null 2>&1 || true
    pkill -9 -x "$NAME" >/dev/null 2>&1 || true
    pkill -9 -f "$NAME.app/Contents/MacOS/$NAME" >/dev/null 2>&1 || true
  done
  sleep 1
  if ! pgrep -x Michi >/dev/null 2>&1 && ! pgrep -x Nihongo >/dev/null 2>&1; then
    closed=1
    break
  fi
  echo "  intento $i: aún corriendo, reintentando…"
done

if [ "$closed" -ne 1 ]; then
  echo "✖ No pude cerrar la app. Ciérrala manualmente (⌘Q) y vuelve a correr el script." >&2
  pgrep -lx Michi >&2 || true
  pgrep -lx Nihongo >&2 || true
  exit 1
fi
echo "  ✓ cerrada"

echo "→ Reemplazando ${APP_DEST} ..."
rm -rf "$APP_DEST"
ditto "$APP_SRC" "$APP_DEST"
xattr -dr com.apple.quarantine "$APP_DEST" 2>/dev/null || true
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_DEST" || true

# Limpieza de transición: quitar el Nihongo.app viejo para no dejar duplicados.
# (Los datos NO viven dentro del .app, así que esto no borra tu progreso.)
if [ -d "$LEGACY_DEST" ]; then
  rm -rf "$LEGACY_DEST"
  echo "  ✓ eliminado el viejo $LEGACY_DEST (tus datos se conservan)"
fi

# Copiar el DMG (si existe) al Escritorio como instalador visible.
# Antes limpiamos: dejamos SOLO un DMG de Michi y borramos cualquier resto de
# Nihongo, para que el Escritorio no se llene de compilaciones viejas.
rm -f "$DESKTOP"/Nihongo_*.dmg 2>/dev/null || true
rm -f "$DESKTOP"/Michi_*.dmg 2>/dev/null || true
DMG_SRC="$(ls -t "$BUNDLE_DIR"/dmg/Michi_*.dmg 2>/dev/null | head -1 || true)"
if [ -n "${DMG_SRC:-}" ]; then
  cp -f "$DMG_SRC" "$DESKTOP/$(basename "$DMG_SRC")"
  echo "  ✓ DMG copiado a $DESKTOP/$(basename "$DMG_SRC") (único de Michi)"
fi

echo "✓ Instalada en $APP_DEST a las $(date '+%H:%M:%S'). Ábrela tú cuando quieras."
