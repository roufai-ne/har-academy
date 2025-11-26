# 🚀 Guide de Démarrage Rapide - HAR Academy

## Démarrage en 5 Minutes

### Étape 1: Démarrer les Services Backend ⚙️

```bash
# Démarrer MongoDB, Redis et tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

**Attendez ~30 secondes** que tous les services démarrent.

---

### Étape 2: Créer les Comptes de Test 👥

```bash
# Installer les dépendances du script (si nécessaire)
npm install mongoose bcryptjs

# Exécuter le script de création
node scripts/create-test-users.js
```

**Résultat attendu:**
```
✅ INSTRUCTOR    créé:
   📧 Email: instructor@har-academy.com
   🔑 Mot de passe: Instructor123!

✅ STUDENT       créé:
   📧 Email: student@har-academy.com
   🔑 Mot de passe: Student123!

✅ ADMIN         créé:
   📧 Email: admin@har-academy.com
   🔑 Mot de passe: Admin123!
```

---

### Étape 3: Démarrer le Frontend 🎨

```bash
cd packages/frontend
npm run dev
```

**L'application sera disponible sur:** `http://localhost:3000`

---

### Étape 4: Démarrer le Service AI (Optionnel) 🤖

```bash
# Dans un nouveau terminal
python packages/backend/ai-service/mock_server.py
```

**Le service AI sera disponible sur:** `http://localhost:8001`

---

## ✅ Vérification Rapide

### 1. Vérifier les Services Backend

```bash
# Health check de l'API Gateway
curl http://localhost:8000/health

# Devrait retourner: {"status":"ok"}
```

### 2. Vérifier le Service AI

```bash
curl http://localhost:8001/health

# Devrait retourner: {"status":"ok","service":"ai-service-mock"}
```

### 3. Vérifier le Frontend

Ouvrir dans le navigateur: `http://localhost:3000`

---

## 🔐 Se Connecter

### Compte Instructeur
```
Email: instructor@har-academy.com
Mot de passe: Instructor123!
```
👉 Accès: Dashboard instructeur, création de cours, édition

### Compte Étudiant
```
Email: student@har-academy.com
Mot de passe: Student123!
```
👉 Accès: Parcourir les cours, s'inscrire, apprendre

### Compte Admin
```
Email: admin@har-academy.com
Mot de passe: Admin123!
```
👉 Accès: Tous les privilèges

---

## 🎯 Premiers Tests

### Test 1: Créer un Cours (Instructeur)

1. Se connecter avec `instructor@har-academy.com`
2. Aller sur `/instructor/dashboard`
3. Cliquer sur "Créer un cours"
4. Remplir le formulaire:
   - Titre: "Mon Premier Cours"
   - Description: "Un cours de test"
   - Prix: 49.99
   - Catégorie: "Programmation"
   - Niveau: "Débutant"
5. Cliquer sur "Créer"

### Test 2: Ajouter du Contenu

1. Dans le dashboard instructeur, cliquer sur "Modifier"
2. Aller dans l'onglet "Curriculum"
3. Cliquer sur "Ajouter un module"
   - Titre: "Introduction"
4. Cliquer sur "Ajouter une leçon"
   - Titre: "Première leçon"
   - Description: "Bienvenue!"
5. Cliquer sur "Publier le cours"

### Test 3: S'inscrire à un Cours (Étudiant)

1. Se déconnecter
2. Se connecter avec `student@har-academy.com`
3. Aller sur `/courses`
4. Cliquer sur un cours
5. Cliquer sur "S'inscrire"
6. Accéder à l'espace d'apprentissage

---

## 🐛 Dépannage

### Problème: Services ne démarrent pas

```bash
# Arrêter tous les services
docker-compose down

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v

# Redémarrer
docker-compose up -d
```

### Problème: Port déjà utilisé

```bash
# Vérifier les ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Tuer le processus si nécessaire
taskkill /PID <PID> /F
```

### Problème: Cannot connect to MongoDB

```bash
# Vérifier que MongoDB est démarré
docker-compose ps

# Voir les logs
docker-compose logs mongodb-auth
```

---

## 📊 Services et Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| API Gateway | 8000 | http://localhost:8000 |
| AI Service | 8001 | http://localhost:8001 |
| MongoDB Auth | 27017 | mongodb://localhost:27017 |
| MongoDB Courses | 27018 | mongodb://localhost:27018 |
| Redis | 6379 | redis://localhost:6379 |

---

## 🎉 C'est Parti!

Vous êtes maintenant prêt à utiliser HAR Academy!

**Prochaines étapes:**
1. ✅ Créer des cours
2. ✅ Ajouter du contenu
3. ✅ Tester l'inscription
4. ✅ Essayer les recommandations AI
5. ✅ Générer des quiz

**Besoin d'aide?** Consultez `IDENTIFIANTS_TEST.md` pour plus de détails!

---

**Bon développement!** 🚀
