#!/bin/bash

# Script para sincronizar cambios automáticamente con GitHub
# Se ejecuta cada vez que detecta cambios en los archivos

echo "🔄 Auto-sync iniciado..."

while true; do
  # Detectar si hay cambios
  if ! git diff-index --quiet HEAD --; then
    echo "📝 Cambios detectados..."
    git add -A
    
    # Crear commit con timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "Auto-sync: $TIMESTAMP" 2>/dev/null || echo "Sin cambios para commitear"
    
    # Push a GitHub
    git push origin main 2>/dev/null || git push origin master 2>/dev/null
    echo "✅ Cambios subidos a GitHub"
  fi
  
  # Esperar 5 segundos antes de verificar de nuevo
  sleep 5
done
