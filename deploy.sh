#!/bin/bash
# ============================================
# HOMEWORK BUDDY - Script de déploiement
# ============================================
# Usage:
#   ./deploy.sh              → Déploiement complet (build + start)
#   ./deploy.sh update       → Mise à jour (pull + rebuild + restart)
#   ./deploy.sh stop         → Arrêter l'application
#   ./deploy.sh logs         → Voir les logs
#   ./deploy.sh reset-db     → Réinitialiser la base de données
#   ./deploy.sh status       → État du conteneur
#   ./deploy.sh backup       → Sauvegarder la base de données

set -e

APP_NAME="homework-buddy"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERREUR]${NC} $1"; }

# ==================
# Vérifications
# ==================
check_requirements() {
  if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé."
    echo "  → Installe Docker : https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé."
    exit 1
  fi

  # Détecter la commande compose
  if docker compose version &> /dev/null; then
    COMPOSE="docker compose"
  else
    COMPOSE="docker-compose"
  fi
}

# ==================
# Fichier .env
# ==================
setup_env() {
  if [ ! -f .env ]; then
    warn "Fichier .env manquant. Création à partir de .env.example..."
    cp .env.example .env

    # Générer un secret de session aléatoire
    SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)
    sed -i "s/change-me-to-a-random-string/$SESSION_SECRET/" .env

    warn "IMPORTANT : édite le fichier .env pour ajouter ta clé API Anthropic :"
    echo ""
    echo "  nano .env"
    echo ""
    echo "  → Remplace sk-ant-xxxxx par ta vraie clé API"
    echo "  → Change le mot de passe parent si besoin"
    echo ""
    read -p "Appuie sur Entrée quand c'est fait (ou Ctrl+C pour annuler)..."
  fi

  # Vérifier que la clé API est configurée
  source .env 2>/dev/null || true
  if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "sk-ant-xxxxx" ]; then
    error "La clé API Anthropic n'est pas configurée dans .env"
    echo "  → Édite .env et ajoute ta clé : ANTHROPIC_API_KEY=sk-ant-api03-..."
    exit 1
  fi
}

# ==================
# Déploiement
# ==================
deploy() {
  info "Déploiement de $APP_NAME..."

  check_requirements
  setup_env

  # Créer le dossier data pour la persistance
  mkdir -p data

  info "Construction de l'image Docker..."
  $COMPOSE build --no-cache

  info "Démarrage du conteneur..."
  $COMPOSE up -d

  # Attendre que l'app soit prête
  info "Attente du démarrage..."
  for i in {1..30}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-3000} 2>/dev/null | grep -q "200"; then
      echo ""
      info "Homework Buddy est prêt !"
      echo ""
      echo "  ┌─────────────────────────────────────────┐"
      echo "  │                                         │"
      echo "  │   http://localhost:${PORT:-3000}              │"
      echo "  │                                         │"
      echo "  │   Réseau local :                        │"
      LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "???")
      echo "  │   http://${LOCAL_IP}:${PORT:-3000}     │"
      echo "  │                                         │"
      echo "  └─────────────────────────────────────────┘"
      echo ""
      info "Les enfants peuvent se connecter depuis leur téléphone !"
      return 0
    fi
    sleep 1
    echo -n "."
  done

  warn "L'application met du temps à démarrer. Vérifie les logs :"
  echo "  ./deploy.sh logs"
}

# ==================
# Mise à jour
# ==================
update() {
  info "Mise à jour de $APP_NAME..."

  check_requirements

  # Pull les dernières modifications
  if git rev-parse --git-dir > /dev/null 2>&1; then
    info "Récupération des dernières modifications..."
    git pull origin "$(git branch --show-current)" || warn "Pas de remote configuré, on continue avec le code local"
  fi

  info "Reconstruction de l'image..."
  $COMPOSE build --no-cache

  info "Redémarrage..."
  $COMPOSE down
  $COMPOSE up -d

  info "Mise à jour terminée !"
  echo "  → ./deploy.sh logs pour vérifier"
}

# ==================
# Arrêt
# ==================
stop() {
  check_requirements
  info "Arrêt de $APP_NAME..."
  $COMPOSE down
  info "Application arrêtée."
}

# ==================
# Logs
# ==================
logs() {
  check_requirements
  $COMPOSE logs -f --tail=100
}

# ==================
# Status
# ==================
status() {
  check_requirements
  echo ""
  $COMPOSE ps
  echo ""

  if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT:-3000} 2>/dev/null | grep -q "200"; then
    info "L'application répond sur http://localhost:${PORT:-3000}"
  else
    warn "L'application ne répond pas"
  fi
}

# ==================
# Backup DB
# ==================
backup() {
  check_requirements
  BACKUP_DIR="$SCRIPT_DIR/backups"
  mkdir -p "$BACKUP_DIR"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/homework_${TIMESTAMP}.db"

  # Copier la DB depuis le conteneur
  if docker cp ${APP_NAME}:/app/homework.db "$BACKUP_FILE" 2>/dev/null; then
    info "Backup créé : $BACKUP_FILE"
    echo "  Taille : $(du -h "$BACKUP_FILE" | cut -f1)"

    # Garder les 10 derniers backups
    ls -t "$BACKUP_DIR"/homework_*.db 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
    info "$(ls "$BACKUP_DIR"/homework_*.db 2>/dev/null | wc -l) backup(s) conservé(s)"
  else
    error "Impossible de copier la DB. Le conteneur tourne ?"
  fi
}

# ==================
# Reset DB
# ==================
reset_db() {
  warn "ATTENTION : Cela va supprimer toutes les données (progression, historique chat, etc.)"
  read -p "Confirmer ? (oui/non) : " confirm
  if [ "$confirm" != "oui" ]; then
    info "Annulé."
    return
  fi

  check_requirements

  # Backup avant reset
  backup 2>/dev/null || true

  info "Arrêt du conteneur..."
  $COMPOSE down

  info "Suppression de la base de données..."
  docker run --rm -v "$(pwd)/data:/app/data" alpine rm -f /app/data/homework.db 2>/dev/null || true
  rm -f homework.db 2>/dev/null || true

  info "Redémarrage (la DB sera recréée avec le contenu initial)..."
  $COMPOSE up -d

  info "Base de données réinitialisée !"
}

# ==================
# Déploiement sans Docker (Node.js direct)
# ==================
deploy_local() {
  info "Déploiement local (sans Docker)..."

  if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé."
    echo "  → Installe Node.js 20+ : https://nodejs.org/"
    exit 1
  fi

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ requis (version actuelle : $(node -v))"
    exit 1
  fi

  setup_env

  info "Installation des dépendances..."
  npm install --production

  info "Démarrage de l'application..."
  echo ""
  echo "  ┌─────────────────────────────────────────┐"
  echo "  │  Lancement : node server.js              │"
  echo "  │  Arrêt : Ctrl+C                          │"
  echo "  │  URL : http://localhost:${PORT:-3000}           │"
  echo "  └─────────────────────────────────────────┘"
  echo ""

  node server.js
}

# ==================
# Main
# ==================
case "${1:-deploy}" in
  deploy)    deploy ;;
  update)    update ;;
  stop)      stop ;;
  logs)      logs ;;
  status)    status ;;
  backup)    backup ;;
  reset-db)  reset_db ;;
  local)     deploy_local ;;
  *)
    echo "Usage: $0 {deploy|update|stop|logs|status|backup|reset-db|local}"
    echo ""
    echo "  deploy    → Déploiement complet Docker (build + start)"
    echo "  update    → Mise à jour (pull + rebuild + restart)"
    echo "  stop      → Arrêter l'application"
    echo "  logs      → Voir les logs en temps réel"
    echo "  status    → État du conteneur"
    echo "  backup    → Sauvegarder la base de données"
    echo "  reset-db  → Réinitialiser la DB (avec backup auto)"
    echo "  local     → Déploiement local sans Docker (Node.js)"
    ;;
esac
