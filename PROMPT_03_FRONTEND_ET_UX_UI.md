# PROMPT_03_FRONTEND_ET_UX_UI

## 🎯 Rôle de l'Agent IA

**Agent Développeur Frontend (React/Vue) & Designer UX/UI**

- **Mission:** Implémenter l'interface utilisateur complète du LMS Har Academy avec design professionnel (inspiré Great Learning), responsive, accessible et multilingue (FR/EN).
- **Critère de Succès:**
  - Interface responsive (desktop, tablet, mobile)
  - Connexion complète aux endpoints Backend
  - Support i18n Français/Anglais
  - Accessibilité WCAG 2.1 AA
  - Performance LCP < 2.5s, CLS < 0.1

---

## 📋 Objectif du Fichier/Module

Créer une **interface utilisateur intuitive et professionnelle** permettant:
- Authentification des utilisateurs
- Navigation et découverte des cours
- Expérience d'apprentissage engageante
- Gestion du tableau de bord utilisateur
- Administration basique pour instructeurs

---

## 🏗️ Requirements Fonctionnels Détaillés

### 1. Pages Publiques (Pas d'Authentification Requise)

#### Page 1: Landing Page (`/`)

**Sections:**
```
[Header avec logo + nav principale]

1. Hero Section
   - Headline: "Maîtrisez l'Analyse de Données"
   - Subheadline: "Excel | R | Python - Apprenez des experts"
   - CTA Buttons: "Commencer Gratuitement" + "Explorer les Cours"
   - Background: Image professionnelle (data visualization)
   
2. Featured Courses (3-4 courses populaires)
   - Course cards avec image, titre, rating, prix
   - Lien vers catalogue complet

3. Benefits Section (3 colonnes)
   - ✓ Certifications Reconnues
   - ✓ Instructeurs Experts
   - ✓ Communauté Active

4. Testimonials (Carousel, 5 témoignages)
   - Avatar + Name + Quote + Rating
   - Auto-rotate chaque 5 secondes

5. Pricing Plans (3 tiers)
   - Pay-as-you-go
   - Abonnement Mensuel
   - Abonnement Annuel
   - Features comparison table

6. FAQ (Accordion)
   - 8-10 questions fréquentes
   - Smooth expand/collapse

7. CTA Final
   - "Prêt à commencer?" + "S'inscrire Maintenant"

[Footer avec liens + copyright]
```

**Design:**
- Couleurs: Primary #0066CC, Secondary #F7931E (professionnel)
- Font: Montserrat (headings), Inter (body)
- Spacing: 16px grid system
- Images: S3 hosted, lazy-loaded

---

#### Page 2: Authentification (`/auth/login` et `/auth/signup`)

**Page Login:**
```
[Minimal layout, centered]

Logo + Titre "Connexion"

Form:
- Email input (validation en temps réel)
- Password input + toggle visibility
- "Se souvenir de moi" checkbox
- "Mot de passe oublié?" link
- [Connexion] button (disabled si form invalide)

Divider "OU"

Social Auth:
- [Continuer avec Google] button
- [Continuer avec GitHub] button

Footer:
- "Pas de compte?" + "S'inscrire" link

Erreurs:
- Affichées inline rouge sous champ
- "Email ou mot de passe incorrect" (générique pour sécurité)
```

**Page Signup:**
```
Similar layout mais multi-step:

Step 1: Données Personnelles
- First Name
- Last Name
- Email
- Password (strength indicator)
- Confirm Password

Step 2: Rôle + Préférences
- Radio: "Apprenant" selected, "Instructeur"
- Checkbox: "J'accepte les CGV"
- Language select: FR / EN

Step 3: Confirmation
- Afficher données saisies
- [Créer Compte] button

Success Screen:
- Confirmation email
- Lien vers dashboard ou premium courses
```

---

### 2. Pages Authentifiées - Apprenant

#### Page 3: Catalogue de Cours (`/courses`)

**Layout:**
```
[Header sticky avec search + language switcher]

Sidebar Filtres (ou burger menu mobile):
├─ Search box (full-text)
├─ Domain Filter (checkboxes)
│  ├─ Excel
│  ├─ R
│  └─ Python
├─ Stack Filter (tags)
├─ Price Range (slider)
├─ Rating Filter (stars ≥ 4.0, 4.5, etc)
└─ Sort by (Popularity, Newest, Rating)

Main Area:
- Grid de course cards (3 colonnes desktop, 1 mobile)
- Pagination (10 items per page)

Course Card:
┌─────────────────────┐
│ [Image thumbnail]   │
├─────────────────────┤
│ Titre Course        │ (max 2 lignes)
│ ⭐ 4.5 (124 reviews)│
│ Par: Instructor Name│
│ 12h • Intermédiaire │
│ $29.99 ou "Gratuit" │
├─────────────────────┤
│ [Voir les détails]  │
└─────────────────────┘

Interactions:
- Click card → Course details page
- Hover → Affiche description courte
- Add to wishlist (heart icon)
```

---

#### Page 4: Détails du Cours (`/courses/:id`)

**Layout Multi-Tabs:**

```
[Hero Banner]
- Course cover image (large)
- Titre + Rating overlay
- [Inscrire Maintenant] ou [Voir dans le Tableau de Bord]

[Tabs Navigation]
├─ Aperçu (par défaut)
├─ Curriculum
├─ Avis
└─ Instructeur

TAB 1: Aperçu
┌─────────────────────────────────────────────┐
│ Colonne Gauche (70%)                        │
│                                             │
│ Description (rich text)                     │
│                                             │
│ "À qui s'adresse ce cours:"                 │
│ • Point 1                                   │
│ • Point 2                                   │
│                                             │
│ "Ce que vous apprendrez:"                   │
│ • Objectif 1                                │
│ • Objectif 2                                │
│                                             │
│ "Prérequis:"                                │
│ • Connaissance Excel basique                │
│ • Python installation                       │
├─────────────────────────────────────────────┤
│ Colonne Droite (30%, sticky en scroll)      │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ $29.99                                  │ │
│ │ ou Inclus dans abonnement Pro           │ │
│ │                                         │ │
│ │ [Inscrire Maintenant]  [Wishlist ♡]   │ │
│ │                                         │ │
│ │ Inclus:                                 │ │
│ │ • 12 heures de vidéo                    │ │
│ │ • 3 projets pratiques                   │ │
│ │ • Accès illimité                        │ │
│ │ • Certificat                            │ │
│ │                                         │ │
│ │ ⭐ 4.5 / 5 (124 avis)                    │ │
│ │ 2,340 étudiants                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

TAB 2: Curriculum
┌─────────────────────────────────────────┐
│ Module 1: Introduction (6 lessons)      │
│ ├─ 📹 Lesson 1: Overview (15 min)       │
│ ├─ 📹 Lesson 2: Installation (10 min)   │
│ ├─ 📝 Lesson 3: Setup Guide (text)      │
│ ├─ ✓ Lesson 4: Quiz (5 questions)       │
│ └─ ...                                  │
│                                         │
│ Module 2: Core Concepts (8 lessons)     │
│ └─ ...                                  │
│                                         │
│ Total: 12h de contenu                   │
└─────────────────────────────────────────┘

TAB 3: Avis
┌─────────────────────────────────────────┐
│ Rating Distribution                     │
│ ⭐⭐⭐⭐⭐ 50 (40%)                        │
│ ⭐⭐⭐⭐  30 (24%)                        │
│ ⭐⭐⭐   20 (16%)                        │
│                                         │
│ Sort: Helpful | Newest                  │
│                                         │
│ Review 1:                               │
│ ⭐⭐⭐⭐⭐ "Excellent cours!" - Alice    │
│ "Très bien structuré, RAS"             │
│ 2 days ago | 45 "Helpful" votes        │
│                                         │
│ Review 2:                               │
│ ...                                     │
└─────────────────────────────────────────┘

TAB 4: Instructeur
┌─────────────────────────────────────────┐
│ [Avatar large]                          │
│ Nom Instructeur                         │
│ Titre/Bio                               │
│ ⭐ 4.7 | 1,234 étudiants | 8 cours      │
│                                         │
│ Bio détaillée (rich text)               │
│                                         │
│ Expertise: Python, Data Analysis, etc   │
│                                         │
│ Autres Cours:                           │
│ [Course Card] [Course Card] ...         │
│                                         │
│ [Message] button                        │
└─────────────────────────────────────────┘
```

---

#### Page 5: Espace d'Apprentissage (`/learn/:course_id`)

**Layout Principal:**
```
[Header Compact]
- Course title + back button
- Progress bar (Lesson X/Y)
- User menu + language switcher

[Main Workspace]
┌────────────────────────────────────────────────────────────┐
│ Colonne Gauche: Lecteur + Contenu (70%)                    │
│                                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ [VIDÉO PLAYER]                                      │   │
│ │ - Video.js player avec controls                     │   │
│ │ - Play, Pause, Speed (0.75x, 1x, 1.25x, 1.5x)      │   │
│ │ - Timeline avec chapiters/timestamps                │   │
│ │ - Fullscreen                                        │   │
│ │ - Settings (qualité vidéo, sous-titres)            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                            │
│ [Tabs sous vidéo]                                         │
│ ├─ Aperçu (description + notes)                           │
│ ├─ Ressources (PDF, code files à télécharger)             │
│ ├─ Discussion (Threads)                                   │
│ └─ Chatbot IA (chat support)                              │
│                                                            │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Transcription (collapsible, searchable)             │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Colonne Droite: Navigation (30%, sticky)                   │
│                                                            │
│ [Arborescence Module/Lesson]                              │
│ Module 1: Introduction                                   │
│ ├─ ✓ Lesson 1 [Completed]                               │
│ ├─ ▶ Lesson 2 [Current] ← Highlighted                   │
│ ├─ ○ Lesson 3 [Not started]                             │
│ └─ ○ Lesson 4 [Locked - Complete Lesson 3]              │
│                                                            │
│ [Buttons Bottom]                                          │
│ [⬅ Précédent] [Suivant ➡]                                │
│ [Marquer comme complété] ✓                               │
│                                                            │
│ [Progress Stats]                                          │
│ Progression: 45%                                          │
│ Temps total: 5h 30min                                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Lecteur Vidéo Détail:**
```
Capacités:
- Streaming adaptatif (HLS/DASH)
- Quality selection (1080p, 720p, 480p)
- Speed control (0.5x - 2x)
- Chapiters/Timestamps (clickable)
- Fullscreen mode
- Download option (si premium)
- Subtitle toggle (FR/EN)
- Autoplay next lesson (toggle)
- Playback resume (reprendre où on s'était arrêté)

Interactions User:
- Double-click: Fullscreen
- Space: Play/Pause
- F: Fullscreen
- M: Mute
- Up/Down Arrow: Volume
- Right Arrow: +10 seconds
- L: Replay 10 seconds
```

**Quiz Inline (si lesson type = quiz):**
```
Après vidéo:
┌──────────────────────────────────────┐
│ Quiz: Les Pivot Tables               │
│ 5 questions • ~3 min                 │
│                                      │
│ [Commencer le Quiz] button           │
│                                      │
│ Question 1/5:                        │
│ "Quelle est la syntaxe pour créer..." │
│                                      │
│ ○ Option A                           │
│ ○ Option B                           │
│ ○ Option C                           │
│                                      │
│ [Précédent] [Suivant] [Soumettre]    │
└──────────────────────────────────────┘
```

---

#### Page 6: Tableau de Bord (`/dashboard`)

**Layout:**
```
[Header]
Bienvenue, [First Name]! 👋

[Stats Cards - 4 colonnes]
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 5 Cours      │ 2 Terminés   │ 45h d'études │ 3 Certificats│
│ Inscrits     │ ✓            │ Ce mois      │              │
└──────────────┴──────────────┴──────────────┴──────────────┘

[Sections à Suivre]
┌──────────────────────────────────────────────────────────┐
│ Continuer l'Apprentissage (3 courses)                   │
│                                                         │
│ [Course Card] [Course Card] [Course Card]              │
│  Excel Avancé    Python Basics    R Fundamentals       │
│  45% complet      12% complet       87% complet        │
│  7h restantes     12h restantes     1h restantes       │
│  [Continuer]      [Continuer]       [Continuer]        │
└──────────────────────────────────────────────────────────┘

[Tous les Cours (3 onglets)]
Onglet 1: Actifs
- Listed courses avec progress bar
- Options: View | Suspend | Leave

Onglet 2: Complétés
- Certificate download link
- Partager achievement (LinkedIn, social)

Onglet 3: Wishlist
- Saved courses
- Add to cart

[Statistiques Apprentissage]
- Graph: Heures étudiées par semaine (chart.js)
- Strengths vs Areas to Improve
- Skills Acquired (tags/badges)

[Certificats Obtenus]
- 3 certificate cards
- [Télécharger PDF] [Vérifier] [Partager]
```

---

#### Page 7: Profil Utilisateur (`/profile`)

**Onglets:**
```
TAB 1: Information Personnelle
- Avatar upload (drag-drop)
- First Name / Last Name
- Email (read-only)
- Bio / About Me (textarea)
- Expertise Tags (pour instructeurs)
- Language Preference
[Sauvegarder] button

TAB 2: Préférences
- Notifications: Checkboxes
  ├─ Email alerts for new courses
  ├─ Course reminders
  ├─ Newsletter
  └─ Messages from instructors
- Learning Preferences:
  ├─ Preferred video quality
  ├─ Subtitle language
  └─ Preferred learning pace

TAB 3: Sécurité
- Change Password form
- Two-Factor Auth (optional)
- Active sessions + logout other devices
- Activity log (récente)

TAB 4: Facturation (si instructeur/premium)
- Payment methods
- Invoices history
- Subscription status
```

---

### 3. Pages Authentifiées - Instructeur

#### Page 8: Dashboard Instructeur (`/instructor/dashboard`)

```
[Statistics Cards]
- Total Students Enrolled
- Total Revenue
- Average Rating
- Courses Published

[Top Performing Courses (Table)]
- Course Name | Students | Rating | Revenue
- Sortable, paginated

[Recent Student Enrollments]
- Timeline: "Alice a suivi 'Excel Basics' - 2h ago"

[Create New Course Button (Primary)]
```

---

#### Page 9: Créer/Éditer Cours (`/instructor/create`)

**Multi-Step Form:**
```
Step 1: Information de Base
- Course Title (required)
- Description (rich text editor)
- Domain select (Excel/R/Python)
- Stack multi-select
- Language (FR/EN)
- Price input
- Pricing Model (one-time/subscription)

Step 2: Image de Couverture
- Drag-drop upload
- Image preview
- Crop tool

Step 3: Modules & Lessons
- Add Module button
- Module Card (collapsible)
  ├─ Module Title
  ├─ Add Lesson button
  └─ Lesson List
    ├─ Lesson Title
    ├─ Type selector (video/text/quiz)
    ├─ Video upload (drag-drop to S3)
    ├─ Move up/down arrows
    └─ Delete button

Step 4: Review & Publish
- Summary of all data
- [Publish] button (si validation OK)
```

---

## 🎨 Design System & Accessibility

### Colors
```
Primary: #0066CC (Blue)
Secondary: #F7931E (Orange)
Success: #28A745
Warning: #FFC107
Danger: #DC3545
Background: #F8F9FA
Text: #212529
Light Gray: #E9ECEF
```

### Typography
```
H1: 2.5rem (40px) - Montserrat Bold
H2: 2rem (32px) - Montserrat Bold
H3: 1.5rem (24px) - Montserrat SemiBold
Body: 1rem (16px) - Inter Regular
Small: 0.875rem (14px) - Inter Regular
Tiny: 0.75rem (12px) - Inter Regular
```

### Spacing Grid: 8px (4px, 8px, 16px, 24px, 32px, 48px)

### Accessibility (WCAG 2.1 AA)
- Contrast ratio ≥ 4.5:1 for text
- All interactive elements keyboard accessible (Tab)
- Focus indicators visible
- Form labels associated with inputs
- ARIA attributes où nécessaire
- Alt text pour toutes les images
- Captions/Transcripts pour vidéos

---

## 📦 Stack Frontend

| Aspect | Technologie | Version |
|--------|-------------|---------|
| **Framework** | React | 18+ |
| **Build Tool** | Vite ou Next.js | - |
| **Styling** | Tailwind CSS | 3.0+ |
| **Component Library** | Headless UI / Radix UI | - |
| **HTTP Client** | Axios | 1.3+ |
| **State Management** | Redux Toolkit ou Zustand | - |
| **i18n** | i18next | 12.0+ |
| **Video Player** | Video.js | 7.0+ |
| **Charts** | Chart.js + react-chartjs-2 | - |
| **Rich Text Editor** | TipTap ou Draft.js | - |
| **Form Management** | React Hook Form | 7.0+ |
| **Validation** | Zod ou Yup | - |
| **Testing** | Vitest + React Testing Library | - |

---

## 📁 Livrables Attendus

1. **Structure complète** React/Vue app
2. **9+ pages** implémentées
3. **Responsive** (Desktop, Tablet, Mobile)
4. **i18n** (FR/EN) fully working
5. **API Integration** avec tous les endpoints Backend
6. **Accessibilité** WCAG 2.1 AA complète
7. **Performance** optimisée (images lazy-load, code splitting)
8. **Error Handling** et loading states
9. **Documentation** (README + component storybook optionnel)

---

## ✅ Checklist de Validation

- [ ] npm run dev lance le projet sans erreurs
- [ ] Toutes les pages responsive (testé sur mobile/tablet)
- [ ] Authentification flow complet (signup → login → dashboard)
- [ ] Course browsing functional (search + filters)
- [ ] Video player working (play, pause, seek, speed)
- [ ] Dashboard affiche données correctes
- [ ] i18n language switching works (FR ↔ EN)
- [ ] Accessibility audit passed (Lighthouse ≥ 90)
- [ ] Performance audit passed (Lighthouse ≥ 90)
- [ ] API calls handled correctly (errors shown)
- [ ] No console errors/warnings

---

**Statut:** Prêt pour l'Agent Frontend
**Priorité:** 🟡 Haute
**Durée Estimée:** 5-7 jours