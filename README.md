🏔️ Vocab Mountain
​Vocab Mountain is a lightweight, single-page web application designed to help you memorize and master 959 challenging vocabulary words.
​The vocabulary list is divided into 32 distinct "camps," simulating a climb up a mountain. Users study flashcards on the "Trail" and test their knowledge at the "Summit."
​✨ Features
​Base Camp Dashboard: A visual overview of your progress, showing how many words are mastered, currently learning, or unstarted.
​Trail (Flashcards): An interactive flashcard interface organized by camp. Users self-report their knowledge (e.g., "Still learning" or "Got it ✓") to advance a word's status.
​Summit Quiz: Multiple quiz modes using multiple-choice questions to test mastery:
​Quick Quiz: 10 random words from your active pool.
​Camp Quiz: Test your knowledge on a specific camp.
​Weak Spots: Focus purely on words you haven't mastered yet.
​Full Mountain: A brutal 20-question randomized test from the entire 959-word database.
​All Words Dictionary: A searchable, filterable directory of the entire vocabulary dataset.
​Progress Tracking & Streaks: Automatically saves your progress to your browser's local storage and tracks daily study streaks.
​🛠️ Architecture & Tech Stack
​Vocab Mountain is built to be extremely fast, portable, and require absolutely zero build steps. It relies on standard web technologies.
​HTML5: Semantic structure found in index.html.
​CSS3: Custom styling utilizing CSS variables, Flexbox, CSS Grid, and 3D transforms for the flashcard flipping animation. (No external CSS frameworks are used).
​Vanilla JavaScript:
​app.js: Contains all routing, state management, UI rendering, and quiz logic.
​words_data.js: A standalone JS file containing the 959-word dictionary.
​Why words_data.js instead of .json?
​Browsers impose strict CORS (Cross-Origin Resource Sharing) policies that prevent local HTML files (opened via file://) from fetching local .json files. By wrapping the JSON data in a JavaScript variable within words_data.js, the app can load the data natively via a standard <script> tag, allowing the app to run entirely offline without needing a local web server.
​🚀 How to Run
​Because of its architecture, running Vocab Mountain is incredibly simple:
​Download or clone this repository.
​Open the index.html file in any modern web browser (Chrome, Firefox, Safari, Edge).
​Start climbing!
​💾 State Management
​Your progress is saved automatically in your browser using localStorage.
​The data is stored under the key vocabMountainProgress_v1 and tracks:
​Word states (0 = new, 1 = learning, 2 = mastered)
​Your current streak
​Your last active date
​Overall quiz statistics
​Note: Clearing your browser's site data or cache will erase your progress.
