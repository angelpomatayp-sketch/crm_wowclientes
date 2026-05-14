#!/bin/bash
# Script de despliegue - Backend (backend.wowtechperu.com)
# Plesk lo ejecuta automáticamente después de cada git pull

set -e

echo ">>> Instalando dependencias del backend (solo producción)..."
cd backend
npm install --omit=dev

echo ">>> Ejecutando migraciones de base de datos..."
npx sequelize-cli db:migrate

echo ">>> Creando admin inicial (si no existe)..."
node seeders/admin.js || true

echo ">>> Backend listo. Node.js reiniciará el proceso automáticamente."
