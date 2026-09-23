# 🏔️ Vocab Mountain

> **Climb the mountain. Master the words. Reach the summit.**

**Vocab Mountain** is a lightweight, single-page vocabulary learning application designed to help users memorize and master **959 challenging vocabulary words**.

The vocabulary database is organized into **32 progressive camps**, turning vocabulary study into a mountain-climbing experience. Users progress along the **Trail** through interactive flashcards and test their knowledge at the **Summit** with multiple quiz modes.

---

## ✨ Features

### 🏕️ Base Camp Dashboard

A centralized progress dashboard that gives you a quick overview of your vocabulary journey.

- Total words
- Mastered words
- Words currently being learned
- Unstarted words
- Overall learning progress
- Daily study streak

### 🥾 Trail — Flashcards

Study vocabulary through an interactive flashcard interface organized by camp.

For each word, users can update their learning status:

- **New** — Haven't started learning yet
- **Learning** — Still practicing
- **Mastered** — Got it ✓

Your progress is automatically saved in the browser.

### 🏔️ Summit — Quiz System

Test your vocabulary knowledge using several quiz modes.

| Quiz Mode | Description |
|---|---|
| ⚡ **Quick Quiz** | 10 randomized words from your active learning pool |
| 🏕️ **Camp Quiz** | Test vocabulary from a specific camp |
| 🎯 **Weak Spots** | Focus exclusively on words you haven't mastered |
| 💀 **Full Mountain** | A 20-question randomized challenge from all 959 words |

### 📖 All Words Dictionary

Explore the complete vocabulary database in one place.

- Search words instantly
- Filter vocabulary
- Browse the entire 959-word collection
- Review definitions and vocabulary information

### 🔥 Progress & Streak Tracking

Vocab Mountain automatically tracks your learning activity using browser `localStorage`.

Your progress includes:

- Word mastery status
- Daily study streak
- Last active date
- Quiz statistics

---

## 🛠️ Architecture & Tech Stack

Vocab Mountain is intentionally designed to be **fast, portable, dependency-free, and build-free**.

It uses standard web technologies and requires no framework, package manager, or compilation step.

### Core Technologies

- **HTML5** — Semantic application structure
- **CSS3** — Custom UI styling using:
  - CSS variables
  - Flexbox
  - CSS Grid
  - 3D transforms
  - Flashcard animations
- **Vanilla JavaScript** — Application logic and state management

### Project Structure

```text
Vocab Mountain/
│
├── index.html       # Main application interface
├── app.js           # Application logic, routing, state & quiz system
├── words_data.js    # Complete 959-word vocabulary database
└── README.md        # Project documentation
