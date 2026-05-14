#!/bin/bash
# Script de despliegue - Frontend (crmwow.wowtechperu.com)
# Plesk lo ejecuta automáticamente después de cada git pull

set -e

echo ">>> Instalando dependencias del frontend..."
cd frontend
npm install --legacy-peer-deps

echo ">>> Construyendo para producción..."
npm run build

echo ">>> Frontend construido correctamente en frontend/dist/"
