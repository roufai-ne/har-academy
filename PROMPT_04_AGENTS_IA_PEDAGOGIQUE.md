# PROMPT_04_AGENTS_IA_PEDAGOGIQUE (Version Améliorée)

## 🎯 Rôle de l'Agent IA

**Agent ML/IA (Spécialiste Traitement Langage Naturel & Apprentissage Adaptatif)**

- **Mission:** Développer le **AI Core Service** qui optimise l'expérience pédagogique via recommandations personnalisées, génération de contenu et support chatbot intelligent.
- **Critère de Succès:**
  - Service recommandation fonctionnel et fiable
  - Génération automatique de quiz basée sur contenu
  - Chatbot capable de répondre questions spécifiques du cours
  - Intégration fluide avec Backend
  - Documentation et tests complets

---

## 📋 Objectif du Fichier/Module

Intégrer l'intelligence artificielle comme **élément différenciateur** majeur de Har Academy, offrant:
- Parcours d'apprentissage personnalisés
- Assistance automatisée pour créateurs de contenu
- Support 24/7 via Coach IA

---

## 🏗️ Requirements Fonctionnels Détaillés

### 1. Système de Recommandation Personnalisée

#### A. Déclenchement & Logique

**Quand?**
- Après inscription (early recommendations)
- Fin de chaque module
- 1 fois par semaine
- En cas d'inactivité > 7 jours

**Logique (Collaborative + Content-Based Filtering):**

```
INPUT:
- user_id
- courses_completed: [course_ids]
- courses_in_progress: [course_ids]
- average_quiz_scores: { domain: score }
- time_spent_per_domain: { domain: hours }
- user_preferences: { domains: [], stacks: [], level: 'beginner|intermediate|advanced' }

PROCESSING:
1. Identifier Domain Préféré
   - Calculer temps moyen par domaine
   - Si inactif dans domaine, suggérer dans ce domaine
   
2. Analyser Points Faibles
   - Score moyen < 70% dans un domaine?
   - Suggérer cours review/remedial
   
3. Filtrer Courses Disponibles
   - Exclure courses déjà complétées
   - Exclure courses déjà en cours
   - Exclure courses non publiés
   
4. Score Recommandation
   Pour chaque course:
   score = (
     0.4 * domain_match_score +
     0.3 * difficulty_progression_score +
     0.2 * popularity_score +
     0.1 * rating_score
   )
   
5. Retourner Top 3-5 Courses
   Sorted par score DESC

OUTPUT:
{
  recommendations: [
    {
      course_id: ObjectId,
      title: String,
      reason: String (ex: "Parce que vous aimez Python")
    }
  ],
  timestamp: ISODate
}
```

#### B. Endpoints Recommandation

```
POST /api/v1/ai/recommendations
├─ Auth: Required (JWT)
├─ Body: {} (user_id from JWT)
├─ Response: {
│   success: true,
│   data: {
│     recommendations: [
│       {
│         course_id: ObjectId,
│         title: String,
│         domain: String,
│         reason: String,
│         estimated_duration: Number (hours),
│         difficulty_level: String
│       }
│     ]
│   }
├─ Cache: Redis 1h (pour même user)
└─ Erreurs: 401 (unauthorized), 500 (DB error)

GET /api/v1/ai/recommendations/:user_id
├─ Accès: Admin ou Self
├─ Response: Similar to POST (cached result if available)
└─ Erreurs: 403 (forbidden), 404 (user not found)
```

---

### 2. Génération Automatique de Quiz

#### A. Logique & Algorithme

**Input:** Contenu de leçon (texte ou transcription vidéo)

**Processing:**
```
STEP 1: Preprocessing
- Tokenization (split en phrases)
- Sentence importance scoring
- Extract key concepts + entities

STEP 2: Question Generation (3 stratégies)

Stratégie 1: Key Term Extraction
- Identifier termes importants (TF-IDF)
- Générer questions: "What is [term]?" ou "[term] is..."
- Réponse: Phrase originale contenant le terme

Stratégie 2: Cloze Test
- Sélectionner phrases avec termes importants
- Remplacer terme par "______"
- Proposer 4 options (1 correcte, 3 distracteurs)

Stratégie 3: Multiple Choice Factual
- Extraire facts (ex: "Excel 2019 was released in...")
- Générer questions: "When was Excel 2019 released?"
- Distracteurs: Années proches

STEP 3: Diversification
- Limiter à max 2 questions par stratégie
- Total: 5-8 questions par leçon (configurable)

STEP 4: Validation
- Vérifier réponse correcte distinguée dans options
- Vérifier distracteurs plausibles
- Exclure questions ambiguës

STEP 5: Structuration
Output: Objet Quiz complet (JSON)
```

#### B. Endpoints Génération Quiz

```
POST /api/v1/ai/generate-quiz
├─ Auth: Required, Role: 'instructor'
├─ Body: {
│   content: String (texte ou transcription),
│   num_questions?: 5,
│   language: 'fr' | 'en',
│   difficulty?: 'easy' | 'medium' | 'hard'
│ }
├─ Response: {
│   success: true,
│   data: {
│     quiz: {
│       questions: [
│         {
│           id: UUID,
│           text: String,
│           type: 'multiple-choice',
│           options: [
│             { id: '1', text: String, is_correct: Boolean }
│           ],
│           difficulty: String,
│           explanation: String (optionnel)
│         }
│       ]
│     }
│   }
├─ Processing Time: ~2-5 secondes
└─ Erreurs: 400 (empty content), 401 (unauthorized), 500 (processing error)

POST /api/v1/ai/generate-quiz-batch
├─ Body: { lesson_ids: [ObjectId] }
├─ Response: { success: true, data: { quizzes: [quiz_per_lesson] } }
└─ Cas d'usage: Générer quizzes pour tout un cours
```

---

### 3. Coach IA / Chatbot (RAG - Retrieval-Augmented Generation)

#### A. Architecture RAG (Retrieval-Augmented Generation)

```
[Architecture Simplifiée]

┌──────────────────────────────────────┐
│  Cours Contenu (Ingestion)           │
│  ├─ Lessons text                     │
│  ├─ Video transcriptions             │
│  ├─ Syllabus                         │
│  └─ Q&A historique                   │
└────────────┬─────────────────────────┘
             │
             ↓ (Chunking + Embedding)
┌──────────────────────────────────────┐
│  Vector Database (ChromaDB/Pinecone) │
│  - Store embeddings                  │
│  - Semantic search capability        │
└────────────┬─────────────────────────┘
             │
             ↓ (User Query)
┌──────────────────────────────────────┐
│  Retrieval Module                    │
│  1. Embed user question              │
│  2. Search top-K (default K=3)       │
│  3. Return context passages          │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  LLM (Claude / GPT-3.5)              │
│  Prompt: [Context] + [Question]      │
│  → Generate contextual answer        │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Response Guardrails                 │
│  - Verify answer cites context       │
│  - Reject off-topic questions        │
│  - Suggest relevant lessons          │
└──────────────────────────────────────┘
```

#### B. Logique Chatbot Détaillée

**Context Awareness:**
```
System Prompt Template:
"Tu es un assistant pédagogique pour le cours [COURSE_TITLE].
Tu aides les étudiants à comprendre le contenu du cours.
Réponds UNIQUEMENT basé sur le contenu du cours fourni.

RÈGLES STRICTES:
1. Répondre UNIQUEMENT aux questions sur le cours
2. Citer les parties pertinentes du cours dans tes réponses
3. Pour questions ouvertes (ex: 'write Python code'), 
   fournir guidance/hints au lieu de solution complète
4. Si question off-topic, dire poliment: 
   'Je peux seulement aider sur le contenu du cours [COURSE]'
5. Suggérer leçons pertinentes si pertinent

CONTEXTE DU COURS:
[COURSE_CONTENT_RETRIEVED]

Question étudiant: [USER_QUESTION]"
```

**Handling Different Question Types:**

```
Type 1: Concept Questions
Q: "Qu'est-ce qu'une Pivot Table?"
A: Chercher "Pivot Table" dans context
   → Retourner définition + exemple du cours
   
Type 2: How-to Questions
Q: "Comment créer une Pivot Table dans Excel?"
A: Chercher steps/instructions dans context
   → Retourner step-by-step instructions
   
Type 3: Code Questions
Q: "Comment écrire une boucle for en Python?"
A: Chercher exemple de code dans context
   → Retourner exemple + explications
   RESTRICTION: Ne pas écrire code complet si c'est exercice
   
Type 4: Open-ended / Opinion
Q: "Pourquoi devrait-je apprendre Python?"
A: Si dans contenu course → répondre
   Sinon → "Bonne question, mais c'est en dehors de ce cours"
   
Type 5: Out-of-scope
Q: "Comment apprendre le JavaScript?"
A: "Je peux seulement aider avec contenu du cours [COURSE]"
```

#### C. Endpoints Chatbot

```
POST /api/v1/ai/chat
├─ Auth: Required (JWT)
├─ Body: {
│   message: String,
│   course_id: ObjectId,
│   lesson_id?: ObjectId (optionnel),
│   conversation_id?: UUID (pour context)
│ }
├─ Response: {
│   success: true,
│   data: {
│     reply: String,
│     sources: [
│       { lesson_id, lesson_title, excerpt: String }
│     ],
│     suggested_lessons?: [lesson_ids]
│   }
│ }
├─ Processing Time: ~1-3 secondes
└─ Erreurs: 401 (unauthorized), 404 (course not found)

GET /api/v1/ai/chat/history/:conversation_id
├─ Auth: Required
├─ Response: { success: true, data: { messages: [...] } }
└─ Erreurs: 404 (conversation not found)

DELETE /api/v1/ai/chat/history/:conversation_id
├─ Auth: Required, Owner
├─ Response: { success: true, message: "History deleted" }
└─ Erreurs: 403 (not owner), 404 (not found)
```

---

## 🔧 Stack AI Service

| Aspect | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Runtime** | Python | 3.10+ | Écosystème ML/NLP riche |
| **Framework Web** | FastAPI ou Flask | - | Async support, type hints |
| **Vector DB** | ChromaDB (local) | Latest | Lightweight, embedded |
| **Embeddings** | Hugging Face (all-MiniLM-L6-v2) | - | Open-source, performant |
| **LLM** | Claude API / OpenAI GPT | - | Quality, costs |
| **NLP** | spaCy ou nltk | - | Text processing |
| **ML** | scikit-learn | - | Recommendations, scoring |
| **Async** | asyncio + aiohttp | - | Concurrent requests |
| **Logging** | Python logging + Sentry | - | Error tracking |
| **Testing** | pytest | - | Unit + integration tests |

---

## 📁 Structure AI Service

```
ai-core-service/
├── src/
│   ├── config/
│   │   ├── settings.py (env vars)
│   │   └── llm_config.py (LLM setup)
│   ├── models/
│   │   ├── quiz_model.py
│   │   ├── recommendation_model.py
│   │   └── embeddings_model.py
│   ├── services/
│   │   ├── recommendation_service.py
│   │   ├── quiz_generation_service.py
│   │   ├── rag_service.py (RAG logic)
│   │   ├── chatbot_service.py
│   │   └── vector_db_service.py
│   ├── routes/
│   │   ├── recommendations.py
│   │   ├── quiz.py
│   │   └── chat.py
│   ├── utils/
│   │   ├── text_processing.py
│   │   ├── embeddings.py
│   │   └── validators.py
│   └── main.py (FastAPI app)
├── tests/
│   ├── test_recommendations.py
│   ├── test_quiz_generation.py
│   └── test_chatbot.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## ⚙️ Configuration & Setup

**requirements.txt:**
```
fastapi==0.104.0
uvicorn==0.24.0
python-dotenv==1.0.0
pydantic==2.4.0
requests==2.31.0
aiohttp==3.9.0

# ML/NLP
scikit-learn==1.3.0
spacy==3.7.0
nltk==3.8.0

# Embeddings
chromadb==0.4.0
sentence-transformers==2.2.0

# LLM
openai==1.3.0
anthropic==0.8.0

# Utilities
numpy==1.24.0
pandas==2.0.0

# Testing
pytest==7.4.0
pytest-asyncio==0.21.0
```

**Env Variables (.env.example):**
```
# Service
AI_SERVICE_PORT=5000
LOG_LEVEL=info

# LLM
LLM_PROVIDER=anthropic  # ou openai
OPENAI_API_KEY=sk_...
ANTHROPIC_API_KEY=sk_...
LLM_MODEL=claude-3-sonnet

# Vector DB
VECTOR_DB_PATH=./data/chromadb
VECTOR_DB_TYPE=chromadb

# External APIs
BACKEND_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60  # seconds
```

---

## 📊 Workflows d'Ingestion Contenu

**Quand nouveau cours publié:**
```
1. Webhook reçu du Backend (event: course.published)
2. Récupérer toutes les lessons du cours
3. Pour chaque lesson:
   ├─ Récupérer texte + transcription vidéo
   ├─ Chunking (chunks ~500 tokens)
   ├─ Embed chaque chunk
   └─ Store dans Vector DB (avec metadata: lesson_id, course_id)
4. Trigger: "Cours prêt pour chat IA"
```

**Quand lesson mise à jour:**
```
1. Webhook reçu du Backend
2. Supprimer anciennes embeddings (pour ce lesson)
3. Répéter ingestion (step 3-4 ci-dessus)
```

---

## 📁 Livrables Attendus

1. **Recommendation Engine** complètement fonctionnel
2. **Quiz Generator** capable de créer questions qualité
3. **RAG + Chatbot** avec context awareness
4. **Vector DB** setup et populée
5. **6+ endpoints** testés
6. **Unit + Integration tests** (min 70% couverture)
7. **Docker setup** pour déploiement
8. **Documentation** complète (README + docstrings)
9. **Error handling** robuste et logging

---

## ✅ Checklist de Validation

- [ ] `docker-compose up` start AI service sans erreurs
- [ ] Endpoints `/api/v1/ai/recommendations` répond correctement
- [ ] Endpoints `/api/v1/ai/generate-quiz` génère questions valides
- [ ] Endpoints `/api/v1/ai/chat` répond sur cours content
- [ ] Chatbot refuse questions off-topic
- [ ] Vector DB populée avec contenu courses
- [ ] Embeddings générés correctement
- [ ] Rate limiting actif
- [ ] Error handling complet (try-except, logging)
- [ ] Tests unitaires passent (pytest)
- [ ] Latency < 3s pour endpoints
- [ ] Memory usage stable (no leaks)

---

## 🔗 Intégration avec Backend

**API Gateway routes pour AI Service:**
```
GET /api/v1/ai/recommendations → AI Service POST /api/v1/ai/recommendations
GET /api/v1/ai/quiz/generate → AI Service POST /api/v1/ai/generate-quiz
POST /api/v1/ai/chat → AI Service POST /api/v1/ai/chat
GET /api/v1/ai/chat/history/:id → AI Service GET /api/v1/ai/chat/history/:id
```

**Webhooks Backend → AI:**
```
POST http://localhost:5000/api/v1/ingest/course
Body: { course_id, content: [...lessons] }
Response: { success: true, message: "Ingested X lessons" }
```

---

## ⚠️ Considérations Importantes

1. **LLM Cost:** Chaque chat = 1-2 API calls. Monitor usage!
2. **Vector DB Scale:** ChromaDB pour dev, Pinecone/Weaviate pour prod
3. **Rate Limiting:** Limiter AI calls par user/IP (risque abuse)
4. **Guardrails:** Prompt injection prevention (input validation)
5. **Accuracy:** Quiz generation peut avoir erreurs. Manual review recommandé
6. **Privacy:** Pas de stockage données utilisateur sans consentement

---

**Statut:** Prêt pour l'Agent ML/IA
**Priorité:** 🟡 Moyenne (peut être fait après Phase 1-3)
**Durée Estimée:** 5-7 jours