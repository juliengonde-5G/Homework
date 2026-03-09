#!/bin/bash
# ============================================
# Script de réinstallation Homework Buddy
# Supprime la DB, rebuild et relance le tout
# ============================================

echo "🔧 Réinstallation de Homework Buddy..."
echo ""

# Se placer dans le dossier du projet
cd "$(dirname "$0")"

# Détecter la commande docker compose
if sudo docker compose version >/dev/null 2>&1; then
  DC="sudo docker compose"
elif sudo docker-compose version >/dev/null 2>&1; then
  DC="sudo docker-compose"
else
  echo "❌ Docker Compose non trouvé !"
  exit 1
fi
echo "   Utilisation de: $DC"

# 1. Arrêter le container (avec timeout pour éviter le blocage)
echo ""
echo "⏹️  Arrêt du container..."
timeout 30 $DC down || {
  echo "   ⚠️  docker compose down bloqué, arrêt forcé..."
  sudo docker kill homework-buddy 2>/dev/null || true
  sudo docker rm -f homework-buddy 2>/dev/null || true
  $DC rm -f 2>/dev/null || true
}
echo "   ✅ Container arrêté"

# 2. Récupérer la dernière version du code
echo ""
echo "📥 Mise à jour du code depuis GitHub..."
git pull origin claude/homework-help-app-YBqDC || echo "   ⚠️  Git pull ignoré"

# 3. Supprimer les anciennes bases de données
echo ""
echo "🗑️  Suppression des anciennes bases de données..."
rm -f homework.db sessions.db data/homework.db data/sessions.db
echo "   ✅ Bases supprimées"

# 4. Rebuild complet de l'image Docker (sans cache, BuildKit désactivé pour Synology)
echo ""
echo "🏗️  Reconstruction de l'image Docker..."
DOCKER_BUILDKIT=0 $DC build --no-cache
if [ $? -ne 0 ]; then
  echo "   ❌ Échec du build ! Vérifiez les erreurs ci-dessus."
  exit 1
fi
echo "   ✅ Image reconstruite"

# 5. Relancer le container
echo ""
echo "🚀 Lancement du container..."
$DC up -d
if [ $? -ne 0 ]; then
  echo "   ❌ Échec du lancement !"
  exit 1
fi
echo "   ✅ Container démarré"

# 6. Vérifier que ça tourne
echo ""
echo "⏳ Vérification du démarrage (10s)..."
sleep 10
if sudo docker ps | grep -q homework-buddy; then
    echo "   ✅ Homework Buddy est en ligne !"
    echo ""
    echo "🎓 Accès : http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'ton-nas'):3000"
else
    echo "   ❌ Le container ne semble pas tourner. Vérifie les logs :"
    echo "      sudo docker logs homework-buddy"
fi
echo ""
echo "✨ Réinstallation terminée !"
