#!/bin/sh
# ░░ Injection du domaine dans les balises Open Graph au démarrage ░░
# nginx:alpine exécute tout script placé dans /docker-entrypoint.d/ avant de démarrer.
# On remplace le placeholder __SITE_URL__ (dans les .html) par la variable SITE_URL
# définie dans docker-compose.yml. Sans elle, on retombe sur le domaine de prod par défaut.
set -e

: "${SITE_URL:=https://techno-pole.asso.centrale-med.fr}"
SITE_URL="${SITE_URL%/}"   # retire un éventuel slash final

find /usr/share/nginx/html -name '*.html' -exec \
  sed -i "s|__SITE_URL__|${SITE_URL}|g" {} +

echo "[site-url] Open Graph → ${SITE_URL}"
