FROM node:20-alpine

WORKDIR /app

# Dépendances pour better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install --production

COPY . .

# Créer le dossier pour la base de données
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server.js"]
