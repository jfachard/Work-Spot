# 🗺️ Work Spot

> Trouvez le spot de travail idéal près de chez vous

Application mobile moderne pour découvrir des cafés, bibliothèques et espaces de coworking adaptés au travail. Filtrez par wifi, prises électriques, ambiance sonore, et trouvez votre lieu parfait avec des recommandations musicales Spotify.

## 🎯 Concept

**Work Spot** simplifie la recherche de lieux de travail pour les développeurs, freelances et étudiants en offrant :

- 🗺️ **Carte interactive** avec géolocalisation en temps réel
- 🔍 **Filtres intelligents** (wifi, prises, niveau sonore, horaires)
- ⭐ **Avis communautaires** et galerie photos
- 🎵 **Playlists Spotify** recommandées pour chaque ambiance
- 📍 **Contribution** - Ajoutez vos spots favoris à la communauté

## 🛠️ Stack Technique

### Frontend Mobile
- **React Native** + **TypeScript** - Framework cross-platform
- **Expo** - Toolchain et runtime pour un développement simplifié
- **NativeWind** - Tailwind CSS pour React Native
- **React Navigation** - Navigation native
- **React Query** - Gestion d'état et cache API
- **React Native Maps** - Carte interactive

### Backend
- **NestJS** + **TypeScript** - Framework Node.js scalable et structuré
- **Prisma** - ORM moderne avec typage fort
- **PostgreSQL** - Base de données relationnelle
- **Docker** - Containerisation de la base de données
- **JWT** - Authentification sécurisée
- **Socket.io** - Communication temps réel (notifications)

### APIs & Services
- **Google Maps Platform** - Places API, Geocoding
- **Spotify Web API** - Recommandations musicales

## 🚀 Getting Started

### Prérequis
- Node.js 18+
- Docker Desktop
- Expo CLI (`npm install -g expo-cli`)
- NestJS CLI (`npm install -g @nestjs/cli`)

### Installation

```bash
# Cloner le repository
git clone https://github.com/jfachard/work-spot.git
cd work-spot
```

### Backend

```bash
cd workspot-api

# Installer les dépendances
npm install

# Démarrer PostgreSQL avec Docker
docker-compose up -d

# Créer et appliquer les migrations
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate

# Lancer le serveur de développement
npm run start:dev
```

Le backend sera disponible sur `http://localhost:3000`

### Frontend

```bash
cd workspot-app

# Installer les dépendances
npm install

# Lancer l'application
npx expo start
```

Scannez le QR code avec l'app Expo Go (iOS/Android) pour tester l'application.

## 🎯 Objectifs du Projet

Ce projet full-stack est conçu pour démontrer :
- ✅ Architecture moderne et scalable (NestJS + Prisma)
- ✅ Développement mobile cross-platform (React Native + Expo)
- ✅ Base de données relationnelle avec PostgreSQL
- ✅ Containerisation avec Docker
- ✅ Intégration d'APIs tierces
- ✅ Bonnes pratiques TypeScript et patterns professionnels

## 🛠️ Commandes Utiles

### Backend
```bash
# Démarrer la base de données
docker-compose up -d

# Arrêter la base de données
docker-compose down

# Voir les logs PostgreSQL
docker-compose logs -f postgres

# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Ouvrir Prisma Studio (interface GUI)
npx prisma studio
```

### Frontend
```bash
# Démarrer avec expo
npx expo start

# Démarrer sur iOS
npx expo start --ios

# Démarrer sur Android
npx expo start --android

# Nettoyer le cache
npx expo start --clear
```

---

## 👨‍💻 Auteur

**Jean-Francis Achard** - Full-Stack Developer

- 🌐 Portfolio: [jfachard.github.io](https://jfachard.github.io/)
- 💼 LinkedIn: [Jean-Francis Achard](https://linkedin.com/in/jfachard)
- 🐙 GitHub: [@jfachard](https://github.com/jfachard)

---

⭐ Star ce projet si vous le trouvez intéressant !

## 📝 License

MIT © Jean-Francis Achard
