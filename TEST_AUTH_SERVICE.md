# 🧪 Test Guide - Auth Service

## Démarrage Rapide

### 1. Démarrer MongoDB et Redis

```bash
# Depuis la racine du projet
docker compose up -d mongodb-auth redis

# Vérifier que c'est bien démarré
docker compose ps
```

### 2. Installer et Démarrer Auth Service

```bash
cd packages/backend/auth-service

# Installer les dépendances
npm install

# Créer .env si pas déjà fait
cp .env.example .env

# Démarrer en mode dev
npm run dev
```

Le service devrait démarrer sur `http://localhost:3001`

---

## 🧪 Tests Manuels avec curl

### Test 1: Health Check ✅

```bash
curl http://localhost:3001/api/v1/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T..."
}
```

---

### Test 2: Register (Inscription) ✅

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "first_name": "Alice",
    "last_name": "Dupont",
    "language": "fr"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "alice@example.com",
      "first_name": "Alice",
      "last_name": "Dupont",
      "role": "learner",
      "status": "active",
      "language": "fr",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ Sauvegarder le token pour les tests suivants !**

---

### Test 3: Login (Connexion) ✅

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

---

### Test 4: Get Profile (GET /me) ✅

```bash
# Remplacer YOUR_TOKEN par le token reçu lors du login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "alice@example.com",
      "first_name": "Alice",
      "last_name": "Dupont",
      ...
    }
  }
}
```

---

### Test 5: Update Profile ✅

```bash
curl -X PUT http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice Updated",
    "language": "en"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "user": {
      "first_name": "Alice Updated",
      "language": "en",
      ...
    }
  }
}
```

---

### Test 6: Change Password ✅

```bash
curl -X POST http://localhost:3001/api/v1/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### Test 7: Request Password Reset ✅

```bash
curl -X POST http://localhost:3001/api/v1/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com"
  }'
```

**Réponse attendue (dev mode):**
```json
{
  "success": true,
  "message": "If the email exists, a reset link will be sent",
  "resetToken": "abc123..." // Seulement en dev
}
```

---

### Test 8: Reset Password ✅

```bash
# Utiliser le resetToken reçu dans le test précédent
RESET_TOKEN="abc123..."

curl -X POST http://localhost:3001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'"$RESET_TOKEN"'",
    "newPassword": "ResetPass789!"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### Test 9: Verify JWT ✅

```bash
curl -X GET http://localhost:3001/api/v1/auth/verify-jwt \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "...",
      "email": "alice@example.com",
      "role": "learner",
      "name": "Alice Dupont"
    }
  }
}
```

---

### Test 10: Refresh Token ✅

```bash
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'"$REFRESH_TOKEN"'"
  }'
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token...",
    "refreshToken": "new_refresh_token..."
  }
}
```

---

### Test 11: Verify Email ✅

```bash
# Le verification_token est généré lors de l'inscription
# En production, il serait envoyé par email
VERIFICATION_TOKEN="..."

curl -X POST http://localhost:3001/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "'"$VERIFICATION_TOKEN"'"
  }'
```

---

## 🧪 Tests d'Erreur

### Test: Email déjà utilisé (400)

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Test123!",
    "first_name": "Bob",
    "last_name": "Martin"
  }'
```

**Réponse attendue:**
```json
{
  "success": false,
  "error": {
    "message": "Email already registered"
  }
}
```

---

### Test: Mauvais mot de passe (401)

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "WrongPassword!"
  }'
```

**Réponse attendue:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials"
  }
}
```

---

### Test: Token invalide (401)

```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

**Réponse attendue:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid token"
  }
}
```

---

### Test: Validation d'email (400)

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Réponse attendue:**
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": ["email must be a valid email"]
  }
}
```

---

### Test: Mot de passe trop court (400)

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Réponse attendue:**
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": ["password must be at least 8 characters"]
  }
}
```

---

## 🧪 Tests avec Postman (Optionnel)

Si vous préférez utiliser Postman:

1. **Créer une collection "Har Academy Auth"**
2. **Importer les variables:**
   - `BASE_URL` = `http://localhost:3001/api/v1`
   - `TOKEN` = (sera rempli automatiquement)
3. **Ajouter un test pour sauvegarder le token:**

```javascript
// Dans l'onglet "Tests" de la requête /login ou /register
if (pm.response.code === 200 || pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("TOKEN", jsonData.data.token);
  pm.environment.set("REFRESH_TOKEN", jsonData.data.refreshToken);
}
```

---

## ✅ Checklist de Validation

### Fonctionnalités Principales
- [ ] ✅ Register fonctionne
- [ ] ✅ Login fonctionne
- [ ] ✅ Get profile (avec JWT) fonctionne
- [ ] ✅ Update profile fonctionne
- [ ] ✅ Change password fonctionne
- [ ] ✅ Request password reset fonctionne
- [ ] ✅ Reset password fonctionne
- [ ] ✅ Verify JWT fonctionne
- [ ] ✅ Refresh token fonctionne
- [ ] ✅ Verify email fonctionne

### Gestion d'Erreurs
- [ ] ✅ Email déjà utilisé → 400
- [ ] ✅ Mauvais credentials → 401
- [ ] ✅ Token invalide → 401
- [ ] ✅ Validation email → 400
- [ ] ✅ Validation password → 400
- [ ] ✅ User suspendu ne peut pas login → 401

### Sécurité
- [ ] ✅ Password hashé avec bcrypt
- [ ] ✅ JWT signé correctement
- [ ] ✅ Refresh token valide 7 jours
- [ ] ✅ Access token valide 24h
- [ ] ✅ Endpoints protégés nécessitent JWT

### Base de Données
- [ ] ✅ User créé dans MongoDB
- [ ] ✅ Email en lowercase
- [ ] ✅ Indexes fonctionnent
- [ ] ✅ last_login_at mis à jour
- [ ] ✅ updated_at mis à jour

---

## 🐛 Troubleshooting

### Erreur: "Cannot connect to MongoDB"
```bash
# Vérifier que MongoDB est démarré
docker compose ps

# Si pas démarré:
docker compose up -d mongodb-auth

# Vérifier les logs:
docker compose logs mongodb-auth
```

### Erreur: "JWT_SECRET is not defined"
```bash
# Vérifier .env existe
cat .env | grep JWT_SECRET

# Si manquant, copier .env.example:
cp .env.example .env
```

### Erreur: "Port 3001 already in use"
```bash
# Trouver le processus:
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Tuer le processus ou changer le port dans .env
```

---

## 📊 Résultat Attendu

Si tous les tests passent:

✅ **Auth Service est OPÉRATIONNEL !**

Vous pouvez maintenant:
1. Passer aux tests unitaires (80% coverage requis)
2. Implémenter Course Service
3. Intégrer avec API Gateway

---

**Prochain fichier à consulter:** [PHASE_1_STATUS.md](PHASE_1_STATUS.md)
