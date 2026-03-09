#!/bin/bash
# ============================================
# Script de réinstallation Homework Buddy
# Supprime la DB, rebuild et relance le tout
# ============================================

set -e

echo "🔧 Réinstallation de Homework Buddy..."
echo ""

# Se placer dans le dossier du projet
cd "$(dirname "$0")"

# 1. Arrêter le container
echo "⏹️  Arrêt du container..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null
echo "   ✅ Container arrêté"
echo ""

# 2. Récupérer la dernière version du code
echo "📥 Mise à jour du code depuis GitHub..."
git pull origin claude/homework-help-app-YBqDC 2>/dev/null || echo "   ⚠️  Git pull ignoré (pas de remote ou branche différente)"
echo ""

# 3. Supprimer les anciennes bases de données
echo "🗑️  Suppression des anciennes bases de données..."
rm -f homework.db
rm -f sessions.db
rm -f data/homework.db
rm -f data/sessions.db
echo "   ✅ Bases supprimées"
echo ""

# 4. Rebuild complet de l'image Docker (sans cache)
echo "🏗️  Reconstruction de l'image Docker..."
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache 2>/dev/null
echo "   ✅ Image reconstruite"
echo ""

# 5. Relancer le container
echo "🚀 Lancement du container..."
docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null
echo "   ✅ Container démarré"
echo ""

# 6. Vérifier que ça tourne
echo "⏳ Vérification du démarrage (10s)..."
sleep 10
if docker ps | grep -q homework-buddy; then
    echo "   ✅ Homework Buddy est en ligne !"
    echo ""
    echo "🎓 Accès : http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'ton-nas'):3000"
else
    echo "   ❌ Le container ne semble pas tourner. Vérifie les logs :"
    echo "   docker logs homework-buddy"
fi
echo ""
echo "✨ Réinstallation terminée !"
