# 🎓 HAR Academy - Plateforme d'Apprentissage en Ligne

Une plateforme LMS (Learning Management System) moderne avec intelligence artificielle intégrée.

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Démarrage Rapide](#-démarrage-rapide)
- [Identifiants de Test](#-identifiants-de-test)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Développement](#-développement)

---

## ✨ Fonctionnalités

### Pour les Étudiants 👨‍🎓
- ✅ Parcourir et rechercher des cours
- ✅ S'inscrire aux cours
- ✅ Suivre les cours dans l'espace d'apprentissage
- ✅ Suivre sa progression
- ✅ Recevoir des recommandations personnalisées (AI)
- ✅ Générer des quiz automatiquement (AI)
- ✅ Poser des questions au chatbot (AI)

### Pour les Instructeurs 👨‍🏫
- ✅ Créer et gérer des cours
- ✅ Organiser le contenu en modules et leçons
- ✅ Publier des cours
- ✅ Voir les statistiques et analytics
- ✅ Gérer les inscriptions
- ✅ Suivre les revenus

### Pour les Administrateurs 👨‍💼
- ✅ Tous les privilèges instructeur
- ✅ Gestion des utilisateurs
- ✅ Modération du contenu
- ✅ Analytics globaux

---

## 🛠 Technologies

### Frontend
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Vite** - Build tool rapide
- **React Query** - Gestion de l'état serveur
- **React Router** - Navigation
- **Zustand** - Gestion d'état global
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données NoSQL
- **Redis** - Cache et sessions
- **JWT** - Authentification
- **Docker** - Containerisation

### AI Service
- **Python** - Langage de programmation
- **FastAPI** - Framework web (version complète)
- **HTTP Server** - Version simplifiée (mock)

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- Python 3.11+ (pour le service AI)

### Installation en 3 Étapes

#### 1. Cloner et Installer
```bash
git clone <repository-url>
cd har-academy
npm install
```

#### 2. Démarrer les Services
```bash
# Démarrer MongoDB, Redis, et tous les services backend
docker-compose up -d

# Créer les comptes de test
node scripts/create-test-users.js

# Démarrer le frontend
cd packages/frontend
npm run dev

# Démarrer le service AI (optionnel)
python packages/backend/ai-service/mock_server.py
```

#### 3. Accéder à l'Application
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **AI Service**: http://localhost:8001

---

## 🔐 Identifiants de Test

### Instructeur
```
Email: instructor@har-academy.com
Mot de passe: Instructor123!
```

### Étudiant
```
Email: student@har-academy.com
Mot de passe: Student123!
```

### Admin
```
Email: admin@har-academy.com
Mot de passe: Admin123!
```

📖 **Guide complet**: Voir `IDENTIFIANTS_TEST.md`

---

## 📚 Documentation

### Guides Principaux
- 📘 **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** - Démarrage en 5 minutes
- 🔐 **[IDENTIFIANTS_TEST.md](IDENTIFIANTS_TEST.md)** - Comptes de test et scénarios
- 📊 **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Vue d'ensemble complète
- 🤖 **[packages/backend/ai-service/SETUP_GUIDE.md](packages/backend/ai-service/SETUP_GUIDE.md)** - Configuration du service AI

### Documentation Technique
- 🔧 **[BACKEND_ROUTES_UPDATE.md](BACKEND_ROUTES_UPDATE.md)** - Routes API backend
- 📝 **[IMPLEMENTATION_SUMMARY_PHASE_3_4.md](IMPLEMENTATION_SUMMARY_PHASE_3_4.md)** - Phases 3 & 4
- 📋 **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Résumé des sessions

---

## 🏗 Architecture

### Microservices
```
har-academy/
├── packages/
│   ├── frontend/          # Application React
│   └── backend/
│       ├── api-gateway/   # Point d'entrée API
│       ├── auth-service/  # Authentification
│       ├── course-service/# Gestion des cours
│       ├── payment-service/# Paiements
│       └── ai-service/    # Intelligence artificielle
```

### Base de Données
- **MongoDB** - Données principales (auth, courses, payments)
- **Redis** - Cache et sessions

### Services Externes
- **Stripe** - Paiements (à configurer)
- **AWS S3** - Stockage de fichiers (à configurer)

---

## 💻 Développement

### Structure du Projet
```
har-academy/
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/    # Composants réutilisables
│   │   │   ├── pages/         # Pages de l'application
│   │   │   ├── services/      # Services API
│   │   │   ├── hooks/         # Hooks personnalisés
│   │   │   └── lib/           # Utilitaires
│   │   └── package.json
│   └── backend/
│       ├── auth-service/
│       ├── course-service/
│       ├── payment-service/
│       ├── ai-service/
│       └── api-gateway/
├── scripts/                   # Scripts utilitaires
├── docker-compose.yml         # Configuration Docker
└── README.md
```

### Commandes Utiles

#### Frontend
```bash
cd packages/frontend
npm run dev          # Démarrer en mode développement
npm run build        # Build de production
npm run lint         # Linter le code
```

#### Backend
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f [service-name]

# Arrêter les services
docker-compose down

# Réinitialiser (⚠️ supprime les données)
docker-compose down -v
```

#### AI Service
```bash
# Version mock (sans dépendances)
python packages/backend/ai-service/mock_server.py

# Version complète (avec FastAPI)
cd packages/backend/ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

---

## 🧪 Tests

### Frontend
```bash
cd packages/frontend
npm run test
```

### Backend
```bash
cd packages/backend/[service-name]
npm test
```

---

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env` dans chaque service:

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

#### Backend Services (.env)
```env
MONGODB_URI=mongodb://localhost:27017/har_academy_[service]
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

#### AI Service (.env)
```env
BACKEND_URL=http://localhost:8000
AI_SERVICE_PORT=8001
```

---

## 📊 Statut du Projet

### Fonctionnalités Complétées ✅
- [x] Authentification et autorisation
- [x] Gestion des cours (CRUD complet)
- [x] Inscription et progression
- [x] Dashboard étudiant
- [x] Dashboard instructeur
- [x] Éditeur de cours
- [x] Service AI (mock)
- [x] Recommandations personnalisées
- [x] Génération de quiz
- [x] Chatbot

### En Cours de Développement 🚧
- [ ] Intégration Stripe
- [ ] Upload de vidéos
- [ ] Analytics avancés
- [ ] Notifications
- [ ] Service AI complet (avec ML)

### Planifié 📋
- [ ] Application mobile
- [ ] Certificats
- [ ] Gamification
- [ ] Forums de discussion
- [ ] Live streaming

---

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Équipe

- **Développeur Principal** - PAES
- **Assistant AI** - Antigravity (Google Deepmind)

---

## 📞 Support

- 📧 Email: support@har-academy.com
- 📖 Documentation: Voir les fichiers `.md` dans le projet
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🎉 Remerciements

Merci d'utiliser HAR Academy!

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-11-21  
**Statut**: ✅ Production Ready (MVP)

---

**Fait avec ❤️ et ☕**
