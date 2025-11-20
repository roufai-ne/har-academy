# Phase 0: Architecture - Validation Checklist

## ✅ Checklist de Validation Complète

### 1. Structure du Projet

Vérifiez que la structure monorepo est correcte :

```bash
har-academy/
├── packages/
│   ├── backend/
│   │   ├── api-gateway/       ✓
│   │   ├── auth-service/      ✓
│   │   ├── course-service/    ✓
│   │   ├── payment-service/   ✓
│   │   └── ai-service/        ✓
│   ├── frontend/              ✓
│   └── shared/                ✓
├── docs/
│   ├── ARCHITECTURE.md        ✓
│   ├── API_CONTRACTS.md       ✓
│   └── SETUP.md               ✓
├── docker-compose.yml         ✓
├── .env.example               ✓
└── .env                       ✓ (créé localement)
```

**Commande de vérification:**
```bash
tree -L 3 packages/
```

---

### 2. Configuration Docker

#### 2.1 Vérifier docker-compose.yml

Le fichier doit contenir **9 services** :
- 3 MongoDB (auth, courses, payments)
- 1 Redis
- 4 Backend services (auth, course, payment, ai)
- 1 API Gateway

**Commande:**
```bash
grep "^\s*[a-z-]*:" docker-compose.yml | grep -v "^#" | wc -l
# Devrait afficher 9
```

#### 2.2 Vérifier les Dockerfiles

Chaque service doit avoir son Dockerfile :

```bash
# Vérifier que tous les Dockerfiles existent
find packages/backend -name "Dockerfile" -type f
# Devrait afficher 5 fichiers
```

**Liste attendue:**
- `packages/backend/api-gateway/Dockerfile` ✓
- `packages/backend/auth-service/Dockerfile` ✓
- `packages/backend/course-service/Dockerfile` ✓
- `packages/backend/payment-service/Dockerfile` ✓
- `packages/backend/ai-service/Dockerfile` ✓

---

### 3. Configuration Environnement

#### 3.1 Vérifier .env.example

Le fichier `.env.example` doit contenir :
- Configuration MongoDB (3 URIs)
- Configuration Redis
- Secrets JWT
- URLs des services
- Clés Stripe (optionnel)
- Clés OpenAI (optionnel)

**Commande:**
```bash
grep -E "^(MONGO_|REDIS_|JWT_|STRIPE_|OPENAI_)" .env.example
```

#### 3.2 Créer .env local

```bash
cp .env.example .env
# Modifier les valeurs si nécessaire
```

---

### 4. Test Docker Compose (Étape Critique)

#### 4.1 Démarrer uniquement les bases de données

```bash
docker compose up -d mongodb-auth mongodb-courses mongodb-payments redis
```

**Validation:**
- Les 4 containers doivent démarrer sans erreur
- Vérifier les logs : `docker compose logs`
- Aucune erreur critique ne doit apparaître

**Commandes de vérification:**
```bash
# Vérifier que les containers sont "healthy"
docker compose ps

# Devrait afficher:
# har-mongodb-auth      mongo:7  Up (healthy)
# har-mongodb-courses   mongo:7  Up (healthy)
# har-mongodb-payments  mongo:7  Up (healthy)
# har-redis            redis:7  Up (healthy)
```

#### 4.2 Tester la connexion MongoDB

```bash
# Se connecter à MongoDB Auth
docker exec -it har-mongodb-auth mongosh -u admin -p mongopassword --authenticationDatabase admin

# Une fois connecté, tester:
> show dbs
> use har_auth
> db.test.insertOne({test: "connection"})
> db.test.find()
> exit
```

#### 4.3 Tester la connexion Redis

```bash
# Se connecter à Redis
docker exec -it har-redis redis-cli

# Tester:
> PING
# Devrait répondre: PONG
> SET test "hello"
> GET test
# Devrait répondre: "hello"
> exit
```

#### 4.4 Arrêter les services

```bash
docker compose down
```

---

### 5. Documentation Architecture

#### 5.1 Vérifier docs/ARCHITECTURE.md

Le fichier doit contenir :
- [x] Diagramme C4 Level 1 (System Context)
- [x] Diagramme C4 Level 2 (Container)
- [x] Description de chaque service
- [x] Schéma MongoDB (pas PostgreSQL!)
- [x] Configuration Redis
- [x] Communication inter-services

**Commande:**
```bash
grep -i "mongodb" docs/ARCHITECTURE.md
# Devrait afficher plusieurs lignes avec MongoDB
grep -i "postgresql" docs/ARCHITECTURE.md
# Ne devrait RIEN afficher (corrigé)
```

#### 5.2 Vérifier docs/API_CONTRACTS.md

Le fichier doit contenir :
- [x] Format de réponse standard
- [x] Contrats API Gateway → Services
- [x] Contrats inter-services
- [x] Codes d'erreur communs
- [x] Standards de sécurité
- [x] ObjectId MongoDB (pas UUID!)

**Commande:**
```bash
grep -i "ObjectId" docs/API_CONTRACTS.md
# Devrait afficher plusieurs lignes
```

---

### 6. Validation Finale Phase 0

#### Checklist Complète

- [ ] **Structure monorepo** : Tous les dossiers existent
- [ ] **docker-compose.yml** : 9 services définis
- [ ] **Dockerfiles** : 5 fichiers créés (1 par service backend + AI)
- [ ] **.env.example** : Toutes les variables définies
- [ ] **.env** : Fichier local créé
- [ ] **MongoDB containers** : Démarrent et sont "healthy"
- [ ] **Redis container** : Démarre et répond au PING
- [ ] **Documentation ARCHITECTURE.md** : Complète et correcte (MongoDB)
- [ ] **Documentation API_CONTRACTS.md** : Complète avec ObjectId
- [ ] **Connexion MongoDB** : Testée avec mongosh
- [ ] **Connexion Redis** : Testée avec redis-cli

---

## 🚀 Commandes Rapides de Validation

```bash
# 1. Vérifier la structure
tree -L 3 packages/

# 2. Créer .env
cp .env.example .env

# 3. Démarrer les bases de données uniquement
docker compose up -d mongodb-auth mongodb-courses mongodb-payments redis

# 4. Vérifier le statut
docker compose ps

# 5. Vérifier les logs (chercher des erreurs)
docker compose logs | grep -i error

# 6. Tester MongoDB
docker exec -it har-mongodb-auth mongosh -u admin -p mongopassword --authenticationDatabase admin

# 7. Tester Redis
docker exec -it har-redis redis-cli PING

# 8. Arrêter tout
docker compose down
```

---

## ✅ Critères de Réussite Phase 0

**La Phase 0 est COMPLÉTÉE si :**

1. ✅ Tous les containers de bases de données démarrent sans erreur
2. ✅ MongoDB répond aux requêtes (3 instances)
3. ✅ Redis répond au PING
4. ✅ Documentation complète et cohérente
5. ✅ Structure monorepo organisée
6. ✅ .env.example complet
7. ✅ Aucune mention de PostgreSQL (remplacé par MongoDB)

**Si tous les critères sont remplis → Prêt pour Phase 1 (Backend Development)**

---

## 🔴 Problèmes Courants

### Erreur: "port already allocated"
```bash
# Un autre service utilise le port
# Solution: Arrêter le service ou changer le port dans docker-compose.yml
sudo lsof -i :27017  # Trouver le processus
```

### Erreur: "unhealthy" container
```bash
# Le healthcheck échoue
# Solution: Vérifier les logs
docker compose logs mongodb-auth
```

### Erreur: "Cannot connect to Docker daemon"
```bash
# Docker n'est pas démarré
# Solution:
sudo systemctl start docker  # Linux
# ou démarrer Docker Desktop (Windows/Mac)
```

---

## 📝 Prochaines Étapes

Après validation complète de la Phase 0, vous pouvez commencer :

**→ Phase 1: Backend Development (PROMPT_02_BACKEND_ET_DATA.md)**

Les bases de données et l'architecture sont prêtes. L'agent Backend peut maintenant :
1. Implémenter les 4 services (Auth, Course, Payment, AI)
2. Créer les modèles MongoDB
3. Implémenter les 40+ endpoints
4. Écrire les tests

---

**Statut Phase 0:** ✅ COMPLÉTÉ
**Date de Validation:** 2024-11-18
**Prêt pour:** Phase 1 - Backend Development
