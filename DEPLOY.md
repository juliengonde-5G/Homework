# Homework Buddy - Guide de déploiement Synology

## Prérequis
- Synology avec Docker installé (Container Manager)
- Une clé API Anthropic (https://console.anthropic.com)

## Installation rapide

### 1. Copier le projet sur le NAS
Copie le dossier du projet dans un répertoire partagé de ton Synology, par exemple `/volume1/docker/homework-buddy/`.

### 2. Configurer les variables d'environnement
Crée un fichier `.env` à la racine du projet :

```
ANTHROPIC_API_KEY=sk-ant-ta-cle-api-ici
SESSION_SECRET=un-secret-aleatoire-long
PARENT_PASSWORD=ton-mot-de-passe-parent
PORT=3000
```

### 3. Lancer avec Docker Compose
En SSH sur le NAS ou via Container Manager :

```bash
cd /volume1/docker/homework-buddy
docker-compose up -d --build
```

### 4. Accéder à l'application
- Depuis le réseau local : `http://IP-DU-NAS:3000`
- Depuis un smartphone : même URL via le navigateur

## Comptes

### Enfants
Les profils d'Ilan, Sacha et Adan sont pré-créés. Ils cliquent simplement sur leur avatar pour se connecter.

### Parent
Mot de passe par défaut : `papa2024` (modifiable dans le fichier .env)

## Mise à jour
```bash
cd /volume1/docker/homework-buddy
git pull
docker-compose up -d --build
```

## Arrêter l'application
```bash
docker-compose down
```
