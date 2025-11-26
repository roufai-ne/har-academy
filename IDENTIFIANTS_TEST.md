# 🔐 Identifiants de Test - HAR Academy

## Date: 2025-11-21

---

## 📋 Comptes de Test Disponibles

### 👨‍🏫 Compte Instructeur

```
Email: instructor@har-academy.com
Mot de passe: Instructor123!
Rôle: instructor
```

**Accès:**
- Dashboard instructeur: `/instructor/dashboard`
- Créer des cours: `/instructor/create`
- Éditer des cours: `/instructor/courses/:id/edit`
- Voir les analytics

---

### 👨‍🎓 Compte Étudiant

```
Email: student@har-academy.com
Mot de passe: Student123!
Rôle: student
```

**Accès:**
- Dashboard étudiant: `/dashboard`
- Parcourir les cours: `/courses`
- S'inscrire aux cours
- Espace d'apprentissage: `/learning/:courseId`

---

### 👨‍💼 Compte Administrateur

```
Email: admin@har-academy.com
Mot de passe: Admin123!
Rôle: admin
```

**Accès:**
- Tous les accès instructeur
- Tous les accès étudiant
- Gestion des utilisateurs
- Modération

---

## 🚀 Comment Créer les Comptes de Test

### Option 1: Via l'Interface (Recommandé)

1. **Démarrer l'application**
   ```bash
   # Terminal 1: Frontend
   cd packages/frontend
   npm run dev
   
   # Terminal 2: Backend (si pas déjà démarré)
   docker-compose up -d
   ```

2. **Créer un compte instructeur**
   - Aller sur `http://localhost:3000/signup`
   - Remplir le formulaire:
     - Prénom: `Jean`
     - Nom: `Dupont`
     - Email: `instructor@har-academy.com`
     - Mot de passe: `Instructor123!`
     - Rôle: **Instructeur** (sélectionner dans le dropdown)
   - Cliquer sur "S'inscrire"

3. **Créer un compte étudiant**
   - Se déconnecter
   - Aller sur `http://localhost:3000/signup`
   - Remplir le formulaire:
     - Prénom: `Marie`
     - Nom: `Martin`
     - Email: `student@har-academy.com`
     - Mot de passe: `Student123!`
     - Rôle: **Étudiant**
   - Cliquer sur "S'inscrire"

---

### Option 2: Via Script MongoDB

Si vous avez accès à MongoDB directement:

```javascript
// Connectez-vous à MongoDB
use har_academy_auth

// Créer l'instructeur
db.users.insertOne({
  firstName: "Jean",
  lastName: "Dupont",
  email: "instructor@har-academy.com",
  password: "$2a$10$...", // Hash de "Instructor123!"
  role: "instructor",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Créer l'étudiant
db.users.insertOne({
  firstName: "Marie",
  lastName: "Martin",
  email: "student@har-academy.com",
  password: "$2a$10$...", // Hash de "Student123!"
  role: "student",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** Les mots de passe doivent être hashés avec bcrypt. Utilisez plutôt l'Option 1.

---

### Option 3: Via API (cURL)

```bash
# Créer un instructeur
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "instructor@har-academy.com",
    "password": "Instructor123!",
    "role": "instructor"
  }'

# Créer un étudiant
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marie",
    "lastName": "Martin",
    "email": "student@har-academy.com",
    "password": "Student123!",
    "role": "student"
  }'
```

---

## 🧪 Tester la Connexion

### Via l'Interface Web

1. Aller sur `http://localhost:3000/login`
2. Entrer les identifiants (voir ci-dessus)
3. Cliquer sur "Se connecter"
4. Vous serez redirigé vers le dashboard approprié

### Via API (cURL)

```bash
# Se connecter en tant qu'instructeur
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@har-academy.com",
    "password": "Instructor123!"
  }'

# Réponse attendue:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "instructor@har-academy.com",
      "role": "instructor",
      "firstName": "Jean",
      "lastName": "Dupont"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📊 Données de Test pour les Cours

### Cours Exemple 1: Python pour Débutants

```json
{
  "title": "Introduction à Python",
  "description": "Apprenez les bases de la programmation Python",
  "price": 49.99,
  "category": "Programmation",
  "level": "beginner",
  "thumbnail": "https://via.placeholder.com/400x300?text=Python+Course"
}
```

### Cours Exemple 2: Développement Web

```json
{
  "title": "Développement Web avec React",
  "description": "Créez des applications web modernes avec React",
  "price": 79.99,
  "category": "Développement Web",
  "level": "intermediate",
  "thumbnail": "https://via.placeholder.com/400x300?text=React+Course"
}
```

### Cours Exemple 3: Data Science

```json
{
  "title": "Data Science avec Python",
  "description": "Analysez et visualisez des données",
  "price": 99.99,
  "category": "Data Science",
  "level": "advanced",
  "thumbnail": "https://via.placeholder.com/400x300?text=Data+Science"
}
```

---

## 🎯 Scénarios de Test Recommandés

### Scénario 1: Parcours Instructeur

1. **Se connecter** avec `instructor@har-academy.com`
2. **Voir le dashboard** - Vérifier les statistiques
3. **Créer un cours**:
   - Aller sur `/instructor/create`
   - Remplir le formulaire
   - Soumettre
4. **Éditer le cours**:
   - Cliquer sur "Modifier" dans le dashboard
   - Ajouter des modules
   - Ajouter des leçons
5. **Publier le cours**:
   - Cliquer sur "Publier"
   - Vérifier que le statut change

### Scénario 2: Parcours Étudiant

1. **Se connecter** avec `student@har-academy.com`
2. **Parcourir les cours** - `/courses`
3. **Voir les détails** d'un cours
4. **S'inscrire** à un cours
5. **Accéder à l'espace d'apprentissage**
6. **Compléter des leçons**
7. **Voir la progression** dans le dashboard

### Scénario 3: Test des Fonctionnalités AI

1. **Se connecter** (instructeur ou étudiant)
2. **Voir les recommandations** sur le dashboard
3. **Générer un quiz** depuis une leçon
4. **Poser une question** au chatbot

---

## 🔒 Sécurité des Mots de Passe

### Format Requis:
- ✅ Minimum 8 caractères
- ✅ Au moins une majuscule
- ✅ Au moins une minuscule
- ✅ Au moins un chiffre
- ✅ Au moins un caractère spécial (!@#$%^&*)

### Exemples Valides:
- `Instructor123!`
- `Student123!`
- `Admin123!`
- `Test1234!`
- `MyP@ssw0rd`

### Exemples Invalides:
- `password` (pas de majuscule, chiffre, ou caractère spécial)
- `Password` (pas de chiffre ou caractère spécial)
- `Pass123` (pas de caractère spécial)
- `Pass!` (trop court)

---

## 🐛 Dépannage

### Problème: "Email already exists"
**Solution:** L'email est déjà utilisé. Essayez un autre email ou supprimez le compte existant.

### Problème: "Invalid credentials"
**Solution:** Vérifiez que:
- L'email est correct
- Le mot de passe est correct (sensible à la casse)
- Le compte existe dans la base de données

### Problème: "Cannot connect to backend"
**Solution:** Vérifiez que:
- Les services backend sont démarrés (`docker-compose up -d`)
- L'API Gateway est accessible (`http://localhost:8000/health`)
- MongoDB est en cours d'exécution

### Problème: "Unauthorized" après connexion
**Solution:**
- Vérifiez que le token JWT est valide
- Vérifiez que le rôle de l'utilisateur est correct
- Essayez de vous reconnecter

---

## 📝 Notes Importantes

1. **Environnement de Développement Seulement**
   - Ces identifiants sont pour le développement/test uniquement
   - Ne jamais utiliser en production

2. **Réinitialisation de la Base de Données**
   - Pour repartir de zéro:
     ```bash
     docker-compose down -v
     docker-compose up -d
     ```
   - Cela supprimera toutes les données

3. **Tokens JWT**
   - Les tokens expirent après 24 heures par défaut
   - Reconnectez-vous si vous obtenez "Token expired"

4. **Rôles Disponibles**
   - `student` - Accès étudiant
   - `instructor` - Accès instructeur + étudiant
   - `admin` - Accès complet

---

## 🎓 Prochaines Étapes

1. ✅ Créer les comptes de test
2. ✅ Se connecter et explorer l'interface
3. ✅ Créer un cours en tant qu'instructeur
4. ✅ S'inscrire à un cours en tant qu'étudiant
5. ✅ Tester les fonctionnalités AI
6. ✅ Vérifier la progression et les analytics

---

## 📞 Besoin d'Aide?

Si vous rencontrez des problèmes:
1. Vérifiez que tous les services sont démarrés
2. Consultez les logs: `docker-compose logs -f`
3. Vérifiez la console du navigateur (F12)
4. Demandez de l'aide! 😊

---

**Bon test!** 🚀
