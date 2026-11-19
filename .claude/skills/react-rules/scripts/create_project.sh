#!/usr/bin/env bash
# Genera un proyecto React + TypeScript con Vite (plantilla oficial react-ts) en el
# directorio del workspace, sin sobrescribir archivos existentes (CLAUDE.md, .claude/...).
#
# Uso:
#   bash create_project.sh [directorio-workspace]
#
# Stack: React >= 19.3.1, TypeScript, Vite, Tailwind CSS 4, React Router,
#        TanStack Query (+ devtools), Zustand, Zod, React Hook Form + @hookform/resolvers.
set -euo pipefail

MIN_REACT="19.3.1"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$SKILL_DIR/assets/template"

WORKSPACE="$(cd "${1:-.}" && pwd)"
APP_NAME="$(basename "$WORKSPACE")"
# Nombre npm válido: minúsculas y solo [a-z0-9-._], sin '.' ni '_' al inicio.
PKG_NAME="$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9._-]+/-/g; s/^[._-]+//')"
[[ -n "$PKG_NAME" ]] || PKG_NAME="react-app"

if [[ -f "$WORKSPACE/package.json" ]]; then
  echo "ERROR: ya existe $WORKSPACE/package.json; el proyecto ya fue generado." >&2
  exit 1
fi
for cmd in node npm npx; do
  command -v "$cmd" >/dev/null || { echo "ERROR: falta '$cmd' (instala Node.js LTS)." >&2; exit 1; }
done

# Compara versiones x.y.z: éxito si $1 >= $2.
version_gte() {
  node -e '
    const [a, b] = process.argv.slice(1).map(v => v.split(".").map(Number));
    for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) process.exit(a[i] > b[i] ? 0 : 1); }
  ' "$1" "$2"
}

REACT_LATEST="$(npm view react version)"
if ! version_gte "$REACT_LATEST" "$MIN_REACT"; then
  echo "ERROR: la última versión de react en npm ($REACT_LATEST) es menor que $MIN_REACT." >&2
  exit 1
fi

echo "React       : $REACT_LATEST"
echo "Proyecto    : $APP_NAME (package: $PKG_NAME)"
echo "Workspace   : $WORKSPACE"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1. Plantilla oficial de Vite (React + TypeScript) en un directorio temporal.
(cd "$TMP" && npx --yes create-vite@latest app --template react-ts --no-interactive >/dev/null)
APP="$TMP/app"

# 2. Quitar el demo de Vite y superponer la plantilla de la skill.
rm -rf "$APP/src/App.css" "$APP/src/assets" "$APP/public/icons.svg" "$APP/README.md"
cp -R "$TEMPLATE/." "$APP/"

# 3. Nombre del proyecto, idioma y título.
node -e '
  const fs = require("fs");
  const [dir, pkgName, appName] = process.argv.slice(1);
  const pkgPath = dir + "/package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = pkgName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  const files = ["index.html", "src/components/layout/Header.tsx",
                 "src/components/layout/Footer.tsx", "src/pages/HomePage.tsx"];
  for (const f of files) {
    const p = dir + "/" + f;
    let s = fs.readFileSync(p, "utf8").replaceAll("__APP_NAME__", appName);
    if (f === "index.html") {
      s = s.replace(/<html lang="[^"]*">/, "<html lang=\"es\">")
           .replace(/<title>[^<]*<\/title>/, "<title>" + appName + "</title>");
    }
    fs.writeFileSync(p, s);
  }
' "$APP" "$PKG_NAME" "$APP_NAME"

# 4. Copiar al workspace sin sobrescribir nada que ya exista.
if command -v rsync >/dev/null; then
  rsync -a --ignore-existing "$APP/" "$WORKSPACE/"
else
  cp -Rn "$APP/." "$WORKSPACE/"
fi

# 5. Dependencias (siempre la última versión publicada).
cd "$WORKSPACE"
npm install --no-fund --no-audit
npm install --no-fund --no-audit \
  react@latest react-dom@latest react-router@latest \
  @tanstack/react-query@latest zustand@latest zod@latest \
  react-hook-form@latest @hookform/resolvers@latest \
  tailwindcss@latest @tailwindcss/vite@latest
npm install --no-fund --no-audit -D \
  @types/react@latest @types/react-dom@latest @tanstack/react-query-devtools@latest

REACT_INSTALLED="$(node -p 'require("react/package.json").version')"
if ! version_gte "$REACT_INSTALLED" "$MIN_REACT"; then
  echo "ERROR: se instaló react $REACT_INSTALLED (< $MIN_REACT)." >&2
  exit 1
fi

# 6. Verificación: tipos + build de producción.
npm run build >/dev/null

echo
echo "Proyecto creado con React $REACT_INSTALLED. Dependencias:"
node -e '
  const p = require("./package.json");
  for (const [k, v] of Object.entries({ ...p.dependencies, ...p.devDependencies })) console.log("  " + k + " " + v);
'
echo
echo "Siguiente paso: npm run dev"
