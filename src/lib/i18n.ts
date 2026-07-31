import { useLanguage } from "@/stores/language";
import type { NarrationLang } from "@/lib/tts";

/**
 * Lightweight app-wide i18n. The learner picks Spanish or English (or "system")
 * at onboarding / in Ajustes — see `useLanguage`. Besides the spoken narration,
 * that choice now also switches every UI string through this dictionary so the
 * app is usable by someone who reads neither Spanish nor Japanese.
 *
 * Usage in a component:
 *   const t = useT();
 *   <span>{t("nav.home")}</span>
 *   <span>{t("lesson.exercise", { n: 2, total: 8 })}</span>
 *
 * Keep keys dot-namespaced by area (nav, lesson, deepdive, settings, …). Every
 * key must exist in BOTH `es` and `en`; missing keys fall back to the key text.
 */

type Vars = Record<string, string | number>;

// es = Spanish, en = English. Spanish is the source of truth.
const DICT: Record<string, { es: string; en: string }> = {
  // ── Sidebar / navigation ────────────────────────────────────────────────
  "nav.section.learn": { es: "Aprender", en: "Learn" },
  "nav.section.space": { es: "Tu espacio", en: "Your space" },
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.course": { es: "Curso", en: "Course" },
  "nav.review": { es: "Repaso", en: "Review" },
  "nav.kanji": { es: "Kanji", en: "Kanji" },
  "nav.grammar": { es: "Gramática", en: "Grammar" },
  "nav.practice": { es: "Práctica", en: "Practice" },
  "nav.play": { es: "Jugar", en: "Play" },
  "nav.store": { es: "Tienda", en: "Store" },
  "nav.progress": { es: "Progreso", en: "Progress" },
  "nav.settings": { es: "Ajustes", en: "Settings" },
  "brand.tagline": { es: "el camino", en: "the path" },

  // ── Exam / level-exam ───────────────────────────────────────────────────
  "exam.question": { es: "Pregunta", en: "Question" },
  "exam.verify": { es: "Verificar", en: "Check" },
  "exam.finish": { es: "Terminar examen", en: "Finish exam" },
  "exam.correct": { es: "¡Correcto!", en: "Correct!" },
  "exam.incorrect": { es: "Incorrecto — lee la explicación, sigamos.", en: "Incorrect — read the explanation, let's continue." },
  "exam.passed": { es: "Aprobado", en: "Passed" },
  "exam.exam": { es: "Examen", en: "Exam" },
  "exam.retry": { es: "Reintentar", en: "Retry" },
  "exam.passedTitle": { es: "¡Examen aprobado!", en: "Exam passed!" },
  "exam.notPassed": { es: "No aprobado", en: "Not passed" },
  "exam.wrongAnswer": { es: "Respuesta incorrecta", en: "Wrong answer" },
  "exam.check": { es: "Comprobar", en: "Check" },
  "exam.grading": { es: "Calificando…", en: "Grading…" },
  "exam.seeResult": { es: "Ver resultado", en: "See result" },
  "lexam.jp": { es: "試験 · Examen final {level}", en: "試験 · Final exam {level}" },
  "lexam.needPct": {
    es: "Necesitas {n}% para aprobar el examen final de {level}.",
    en: "You need {n}% to pass the {level} final exam.",
  },
  "lexam.readyNext": { es: "¡Estás listo para el siguiente nivel!", en: "You're ready for the next level!" },
  "lexam.unlocked": {
    es: "Desbloqueaste {next}. Aparecerá en tu curso.",
    en: "You unlocked {next}. It'll appear in your course.",
  },
  "lexam.startWith": { es: "Comenzar con {next}", en: "Start with {next}" },
  "lexam.backToCourse": { es: "Volver al curso", en: "Back to course" },
  "exam.result.jp": { es: "試験 · Resultado", en: "試験 · Result" },
  "exam.score": { es: "Puntuación", en: "Score" },
  "exam.bestHistoric": { es: "Mejor histórica", en: "Best ever" },
  "exam.newBest": { es: "{n}% (¡nueva!)", en: "{n}% (new!)" },
  "exam.stars": { es: "Estrellas", en: "Stars" },
  "exam.leveledUp": { es: "¡Subiste al nivel {n}!", en: "You reached level {n}!" },
  "exam.yourAnswers": { es: "結果 · Tus respuestas", en: "結果 · Your answers" },
  "exam.puntuacion": { es: "Puntuación", en: "Score" },
  "exam.reviewRec.jp": { es: "復習 · Te recomendamos repasar", en: "復習 · We recommend reviewing" },
  "exam.reviewRec.desc.one": {
    es: "Las preguntas que fallaste se enseñan en esta lección. Toca para repasar y ver cuál fue el error.",
    en: "The questions you missed are taught in this lesson. Tap to review and see the mistake.",
  },
  "exam.reviewRec.desc.many": {
    es: "Las preguntas que fallaste se enseñan en estas lecciones. Toca para repasar y ver cuál fue el error.",
    en: "The questions you missed are taught in these lessons. Tap to review and see the mistake.",
  },
  "exam.perfect": { es: "¡Perfecto! No fallaste ninguna lección. 🎌", en: "Perfect! You didn't miss any lesson. 🎌" },
  "exam.continueWith": { es: "Continuar con {unit}", en: "Continue with {unit}" },
  "exam.tryAgain": { es: "Volver a intentar", en: "Try again" },

  // ── Minigames (in-game) ─────────────────────────────────────────────────
  "mg.newRecordShort": { es: "Nuevo récord", en: "New record" },
  "mg.newRecord": { es: "¡Nuevo récord!", en: "New record!" },
  "mg.yourRecord": { es: "Tu récord", en: "Your record" },
  "mg.victory": { es: "Victoria", en: "Victory" },
  "mg.yourRecordN": { es: "Tu récord: {n}", en: "Your record: {n}" },
  "mg.start": { es: "¡Empezar!", en: "Start!" },
  "mg.timeUp": { es: "¡Tiempo!", en: "Time's up!" },
  "mg.score": { es: "Puntuación", en: "Score" },
  "mg.anotherRound": { es: "Otra ronda", en: "Another round" },
  "mg.speedDesc": {
    es: "Time attack. Identifica el romaji del {kana} que aparece. Combo de 5 correctas seguidas duplica los puntos.",
    en: "Time attack. Identify the romaji of the {kana} that appears. A 5-in-a-row combo doubles the points.",
  },
  "mg.hiragana": { es: "hiragana", en: "hiragana" },
  "mg.katakana": { es: "katakana", en: "katakana" },
  "mg.points": { es: "Puntos", en: "Points" },
  "mg.combo": { es: "Combo", en: "Combo" },
  "mg.time": { es: "Tiempo", en: "Time" },
  "mg.correct": { es: "Aciertos", en: "Correct" },
  "mg.wrong": { es: "Fallos", en: "Misses" },
  "mg.summary.perfect": { es: "¡Perfecto!", en: "Perfect!" },
  "mg.summary.great": { es: "¡Muy bien!", en: "Great!" },
  "mg.summary.keepGoing": { es: "Sigue practicando", en: "Keep practicing" },
  "mg.matchDesc": {
    es: "Encuentra las parejas de kanji y su significado. Menos movimientos = más puntos.",
    en: "Find the pairs of kanji and their meaning. Fewer moves = more points.",
  },
  "mg.moves": { es: "Movimientos", en: "Moves" },
  "mg.pairs": { es: "Parejas", en: "Pairs" },
  "mg.quizDesc": {
    es: "Reconoce el significado del kanji. Combo x5 duplica los puntos.",
    en: "Recognize the kanji's meaning. A x5 combo doubles the points.",
  },
  "mg.quiz.intro": {
    es: "Aparece un kanji; elige su significado correcto antes de que acabe el tiempo. 5 aciertos seguidos duplican los puntos.",
    en: "A kanji appears; choose its correct meaning before time runs out. 5 in a row doubles the points.",
  },
  "mg.quiz.needMore": {
    es: "Necesitas un poco más de kanji en tu nivel para jugar este modo.",
    en: "You need a few more kanji at your level to play this mode.",
  },
  "mg.finished": { es: "¡Terminado!", en: "Finished!" },
  "mg.win": { es: "¡Ganaste!", en: "You win!" },
  "gs.summary": { es: "Resumen", en: "Summary" },
  "gs.accuracy": { es: "Precisión", en: "Accuracy" },
  "gs.correct": { es: "Correctas", en: "Correct" },
  "gs.wrong": { es: "Incorrectas", en: "Wrong" },
  "gs.goal": { es: "Meta ({pct}%)", en: "Goal ({pct}%)" },
  "gs.noAnswers": { es: "Sin respuestas", en: "No answers" },
  "gs.excellent": { es: "¡Excelente!", en: "Excellent!" },
  "gs.good": { es: "¡Bien!", en: "Good!" },
  "gs.improving": { es: "Vas mejorando", en: "You're improving" },
  "gs.keepGoing": { es: "Sigue practicando", en: "Keep practicing" },
  "gs.answerToSee": { es: "Responde para ver tu desempeño.", en: "Answer to see how you did." },
  "gs.passed": {
    es: "¡Lograste {c}/{t} {unit}! Pasaste la meta de {goal}.",
    en: "You got {c}/{t} {unit}! You beat the goal of {goal}.",
  },
  "gs.notPassed": {
    es: "{c}/{t} {unit}. Apunta a {goal} para superar la meta.",
    en: "{c}/{t} {unit}. Aim for {goal} to beat the goal.",
  },
  "gs.unit.answers": { es: "respuestas", en: "answers" },
  "gs.unit.pairs": { es: "pares", en: "pairs" },

  // ── Lesson interstitials ────────────────────────────────────────────────
  "inter.easy": { es: "Fácil", en: "Easy" },
  "inter.easyDesc": { es: "Reconoce lo que acabas de aprender.", en: "Recognize what you just learned." },
  "inter.medium": { es: "Medio", en: "Medium" },
  "inter.mediumDesc": { es: "Ahora prodúcelo tú — sin mirar.", en: "Now produce it yourself — without looking." },
  "inter.hard": { es: "Difícil", en: "Hard" },
  "inter.hardDesc": { es: "Úsalo en frases reales — completa el contexto.", en: "Use it in real sentences — complete the context." },
  "inter.doubts": { es: "¿Tienes dudas?", en: "Any doubts?" },
  "inter.newLevel": { es: "Nuevo nivel", en: "New level" },
  "inter.dudas.jp": { es: "質問タイム · ¿Dudas?", en: "質問タイム · Questions?" },
  "inter.dudas.ready": { es: "¿Listo para practicar?", en: "Ready to practice?" },
  "inter.dudas.desc": {
    es: "Vienen 20 ejercicios en 3 niveles. Si algo no quedó claro, repásalo ahora — toca un tema o escribe tu duda.",
    en: "20 exercises across 3 levels are coming. If something wasn't clear, review it now — tap a topic or type your question.",
  },
  "inter.dudas.placeholder": {
    es: "Escribe tu duda… (ej. ¿cómo se lee este kanji?)",
    en: "Type your question… (e.g. how is this kanji read?)",
  },
  "inter.dudas.reviewDeep": { es: "Repasar «{topic}» a fondo", en: "Review “{topic}” in depth" },
  "inter.dudas.notFound": {
    es: "No encontré ese tema en esta lección. Prueba con el nombre del kanji, la palabra o la partícula (ej. «¿cómo se lee 学?» o «¿para qué sirve は?»), o toca un tema de arriba.",
    en: "I couldn't find that topic in this lesson. Try the kanji name, the word or the particle (e.g. “how is 学 read?” or “what is は for?”), or tap a topic above.",
  },

  // ── Login (lock-gate) ───────────────────────────────────────────────────
  "login.create.title": { es: "Crea tu acceso", en: "Create your access" },
  "login.create.subtitle": {
    es: "Protege tu progreso con un usuario y un PIN local. Se guarda solo en este dispositivo.",
    en: "Protect your progress with a local username and PIN. Saved only on this device.",
  },
  "login.username": { es: "Usuario", en: "Username" },
  "login.usernamePh": { es: "Rodrigo", en: "Your name" },
  "login.pinMin": { es: "PIN (mín. 4 dígitos)", en: "PIN (min. 4 digits)" },
  "login.confirmPin": { es: "Confirma el PIN", en: "Confirm the PIN" },
  "login.creating": { es: "Creando…", en: "Creating…" },
  "login.createEnter": { es: "Crear y entrar", en: "Create and enter" },
  "login.err.username": { es: "Escribe un nombre de usuario.", en: "Enter a username." },
  "login.err.pinShort": { es: "El PIN debe tener al menos 4 dígitos.", en: "The PIN must be at least 4 digits." },
  "login.err.pinMatch": { es: "Los PIN no coinciden.", en: "The PINs don't match." },
  "login.err.pinWrong": { es: "PIN incorrecto.", en: "Incorrect PIN." },
  "login.hi": { es: "Hola, {name}", en: "Hi, {name}" },
  "login.welcomeBack": { es: "Bienvenido de vuelta", en: "Welcome back" },
  "login.enterPin": { es: "Introduce tu PIN para continuar.", en: "Enter your PIN to continue." },
  "login.checking": { es: "Comprobando…", en: "Checking…" },
  "login.enter": { es: "Entrar", en: "Enter" },
  "login.online": { es: "Online", en: "Online" },
  "login.systemStatus": { es: "System Status:", en: "System Status:" },

  // ── Common buttons / words ──────────────────────────────────────────────
  "common.continue": { es: "Continuar", en: "Continue" },
  "common.back": { es: "Atrás", en: "Back" },
  "common.exit": { es: "Salir", en: "Exit" },
  "common.next": { es: "Siguiente", en: "Next" },
  "common.previous": { es: "Anterior", en: "Previous" },
  "common.listen": { es: "Escuchar", en: "Listen" },
  "common.stop": { es: "Detener", en: "Stop" },
  "common.start": { es: "Empezar", en: "Start" },
  "common.seeAll": { es: "Ver todos", en: "See all" },
  "common.save": { es: "Guardar cambios", en: "Save changes" },
  "common.slow": { es: "Lento", en: "Slow" },
  "common.normal": { es: "Normal", en: "Normal" },
  "common.fast": { es: "Rápido", en: "Fast" },
  "common.loading": { es: "Cargando…", en: "Loading…" },
  "common.cancel": { es: "Cancelar", en: "Cancel" },

  // ── Lesson player ───────────────────────────────────────────────────────
  "lesson.learn": { es: "Aprende", en: "Learn" },
  "lesson.exercise": { es: "Ejercicio {n} / {total}", en: "Exercise {n} / {total}" },
  "lesson.continue": { es: "Continuar lección", en: "Continue lesson" },
  "lesson.btn.finish": { es: "Finalizar", en: "Finish" },
  "lesson.btn.continue": { es: "Continuar", en: "Continue" },
  "lesson.btn.saving": { es: "Guardando…", en: "Saving…" },
  "lesson.btn.endLesson": { es: "Terminar lección", en: "End lesson" },
  "lesson.btn.check": { es: "Comprobar", en: "Check" },
  "lesson.btn.retry": { es: "Intentar de nuevo", en: "Try again" },
  "lesson.btn.startExercises": { es: "Empezar ejercicios", en: "Start exercises" },
  "lesson.btn.letsGo": { es: "¡Vamos!", en: "Let's go!" },

  // ── Deep dive (A fondo) page labels ─────────────────────────────────────
  "deepdive.eyebrow": { es: "A fondo", en: "In depth" },
  "deepdive.why": { es: "¿Por qué se usa?", en: "Why is it used?" },
  "deepdive.when": { es: "¿Cuándo usarla?", en: "When to use it?" },
  "deepdive.mistakes": { es: "⚠ Errores comunes", en: "⚠ Common mistakes" },
  "deepdive.detail": { es: "En detalle", en: "In detail" },
  "deepdive.examples": { es: "Ejemplos", en: "Examples" },
  "deepdive.realExamples": { es: "Ejemplos de la vida real", en: "Real-life examples" },
  "deepdive.howUsed": { es: "¿Cómo se usa?", en: "How is it used?" },
  "deepdive.howCombine": { es: "Cómo combinarlo", en: "How to combine it" },
  "deepdive.commonWords": { es: "Palabras comunes", en: "Common words" },
  "deepdive.usefulNotes": { es: "Notas útiles", en: "Useful notes" },

  // ── Activity shells (eyebrows) ──────────────────────────────────────────
  "act.newKanji": { es: "Nuevo kanji", en: "New kanji" },
  "act.newWord": { es: "Nueva palabra", en: "New word" },
  "act.newGrammar": { es: "Nueva gramática", en: "New grammar" },
  "act.explanation": { es: "Explicación", en: "Explanation" },
  "act.examples": { es: "Ejemplos", en: "Examples" },
  "act.trueFalse": { es: "¿Verdadero o falso?", en: "True or false?" },
  "act.isCorrect": { es: "¿Es correcta esta afirmación?", en: "Is this statement correct?" },
  "act.hint": { es: "Pista", en: "Hint" },
  "act.true": { es: "Verdadero", en: "True" },
  "act.false": { es: "Falso", en: "False" },
  "act.choose": { es: "Elige la correcta", en: "Choose the right one" },
  "act.question": { es: "Pregunta", en: "Question" },
  "act.listening": { es: "Listening", en: "Listening" },
  "act.speaking": { es: "Practica tu voz", en: "Practice speaking" },
  "act.writeKanji": { es: "Escribe el kanji", en: "Write the kanji" },
  "act.writeSentence": { es: "Escribe la oración", en: "Write the sentence" },
  "act.orderSentence": { es: "Ordena la frase", en: "Order the sentence" },
  "act.matchPairs": { es: "Empareja", en: "Match" },
  "act.complete": { es: "Lección completada", en: "Lesson complete" },
  "act.orderPrompt": { es: "Toca las fichas en orden para formar:", en: "Tap the tiles in order to form:" },
  "act.orderDecoys": { es: "⚠ Sobran fichas — elige solo las correctas.", en: "⚠ Extra tiles — pick only the right ones." },
  "act.orderYours": { es: "Tu frase aparecerá aquí…", en: "Your sentence will appear here…" },
  "act.orderCorrect": { es: "¡Perfecto! Orden correcto 🎉", en: "Perfect! Correct order 🎉" },
  "act.orderWrong": { es: "No es el orden correcto.", en: "That's not the right order." },
  "act.correctVersion": { es: "Versión correcta", en: "Correct version" },
  "act.listenAll": { es: "Escuchar todos", en: "Listen to all" },

  // ── Settings ────────────────────────────────────────────────────────────
  "settings.language.jp": { es: "言語 — Idioma", en: "言語 — Language" },
  "settings.language.title": { es: "Idioma de la app", en: "App language" },
  "settings.language.desc": {
    es: "Además del japonés, todo se explica y se escucha en este idioma. Se guarda en tu equipo.",
    en: "Besides Japanese, everything is explained and spoken in this language. Saved on your device.",
  },
  "settings.language.now": { es: "Ahora mismo:", en: "Right now:" },
  "settings.language.pair.es": { es: "japonés + español", en: "Japanese + Spanish" },
  "settings.language.pair.en": { es: "japonés + inglés", en: "Japanese + English" },
  "settings.language.system": { es: "(según tu sistema)", en: "(following your system)" },
  "lang.es": { es: "Español", en: "Spanish" },
  "lang.en": { es: "English", en: "English" },
  "lang.system": { es: "Sistema", en: "System" },

  // ── Settings other sections ─────────────────────────────────────────────
  "settings.eyebrow": { es: "設定 — Ajustes", en: "設定 — Settings" },
  "settings.title": { es: "Tus Ajustes", en: "Your Settings" },
  "settings.desc": {
    es: "Personaliza tu experiencia y tus objetivos diarios.",
    en: "Customize your experience and your daily goals.",
  },
  "settings.appearance.jp": { es: "外観", en: "外観" },
  "settings.appearance.title": { es: "Apariencia", en: "Appearance" },
  "settings.appearance.desc": { es: "Tema visual de la aplicación.", en: "The app's visual theme." },
  "settings.theme.light": { es: "Claro", en: "Light" },
  "settings.theme.dark": { es: "Oscuro", en: "Dark" },
  "settings.theme.system": { es: "Sistema", en: "System" },
  "settings.size.jp": { es: "文字サイズ", en: "文字サイズ" },
  "settings.size.title": { es: "Tamaño de letra y cuadros", en: "Text & box size" },
  "settings.size.desc": {
    es: "Agranda todo de golpe — útil para leer cómodo o pantallas grandes. Se guarda en tu equipo.",
    en: "Scale everything up at once — handy for comfortable reading or big screens. Saved on your device.",
  },
  "settings.voice.jp": { es: "音声 — Voz", en: "音声 — Voice" },
  "settings.voice.title": { es: "Voz del botón «Escuchar»", en: "«Listen» button voice" },
  "settings.voice.desc": {
    es: "Elige la voz para cada idioma — de hombre o mujer, más suave o más natural. Se usa al escuchar japonés, español e inglés. Se guarda en tu equipo.",
    en: "Pick a voice for each language — male or female, softer or more natural. Used when listening in Japanese, Spanish and English. Saved on your device.",
  },
  "settings.profile.jp": { es: "プロフィール", en: "プロフィール" },
  "settings.profile.title": { es: "Perfil", en: "Profile" },
  "settings.test": { es: "Probar", en: "Test" },
  "settings.voice.ja": { es: "Japonés", en: "Japanese" },
  "settings.voice.es": { es: "Español", en: "Spanish" },
  "settings.voice.en": { es: "Inglés", en: "English" },
  "settings.profile.desc": { es: "Cómo te llamamos y tus objetivos.", en: "How we address you and your goals." },
  "settings.profile.name": { es: "Nombre", en: "Name" },
  "settings.profile.namePh": { es: "Tu nombre", en: "Your name" },
  "settings.profile.goal": { es: "Minutos diarios objetivo", en: "Daily minutes goal" },
  "settings.profile.reminder": { es: "Hora de recordatorio", en: "Reminder time" },
  "settings.saved": { es: "✓ Guardado", en: "✓ Saved" },
  "settings.saveError": { es: "Error al guardar", en: "Error saving" },
  "settings.saving": { es: "Guardando…", en: "Saving…" },
  "settings.voice.auto": { es: "Automática (recomendada)", en: "Automatic (recommended)" },
  "settings.voice.none": {
    es: "No hay voces de {lang} instaladas. Añádelas en Ajustes del sistema → Accesibilidad → Contenido hablado → Voces.",
    en: "No {lang} voices installed. Add them in System Settings → Accessibility → Spoken Content → Voices.",
  },

  // ── Dashboard ───────────────────────────────────────────────────────────
  "home.nextStep": { es: "Tu próximo paso", en: "Your next step" },
  "home.min": { es: "min", en: "min" },
  "home.insights.jp": { es: "今日の重点", en: "今日の重点" },
  "home.insights.title": { es: "Tu plan personalizado", en: "Your personalized plan" },
  "home.insights.reinforce": { es: "Reforzar {skill}", en: "Reinforce {skill}" },
  "dash.greeting.morning": { es: "Buenos días", en: "Good morning" },
  "dash.greeting.afternoon": { es: "Buenas tardes", en: "Good afternoon" },
  "dash.greeting.evening": { es: "Buenas noches", en: "Good evening" },
  "dash.learner": { es: "estudiante", en: "learner" },
  "dash.stat.time": { es: "Tiempo aprendido", en: "Time learned" },
  "dash.stat.days": { es: "Días activos", en: "Active days" },
  "dash.stat.kanji": { es: "Kanjis dominados", en: "Kanji mastered" },
  "dash.stat.coins": { es: "Monedas", en: "Coins" },
  "dash.missions.daily": { es: "Misiones de hoy", en: "Today's missions" },
  "dash.missions.dailyDesc": { es: "Pequeñas victorias diarias para tu XP", en: "Small daily wins for your XP" },
  "dash.missions.weekly": { es: "Misiones semanales", en: "Weekly missions" },
  "dash.missions.weeklyDesc": { es: "Objetivos más grandes, mayores recompensas", en: "Bigger goals, bigger rewards" },

  // ── Profile ─────────────────────────────────────────────────────────────
  "profile.eyebrow": { es: "プロフィール — Perfil", en: "プロフィール — Profile" },
  "profile.title": { es: "Tu perfil", en: "Your profile" },
  "profile.desc": {
    es: "Quién eres en Michi: tu nivel, tu progreso y tus logros.",
    en: "Who you are in Michi: your level, progress and achievements.",
  },
  "profile.forLevel": { es: "para nivel {n}", en: "to level {n}" },
  "profile.collection": { es: "Colección", en: "Collection" },
  "profile.collectionCount": { es: "{owned}/{total} desbloqueados", en: "{owned}/{total} unlocked" },
  "profile.toStore": { es: "Ir a la Tienda", en: "Go to the Store" },
  "profile.avatars": { es: "Avatares", en: "Avatars" },
  "profile.backgrounds": { es: "Fondos", en: "Backgrounds" },
  "profile.recentAch": { es: "Tus logros recientes", en: "Your recent achievements" },
  "profile.noAch": {
    es: "Todavía no desbloqueas logros. ¡Sigue estudiando y aparecerán aquí!",
    en: "No achievements yet. Keep studying and they'll show up here!",
  },
  "profile.customize": { es: "Personalizar", en: "Customize" },
  "profile.editProfile": { es: "Editar perfil", en: "Edit profile" },
  "profile.logout": { es: "Cerrar sesión", en: "Log out" },
  "profile.level": { es: "Nivel", en: "Level" },
  "profile.tile.time": { es: "Tiempo", en: "Time" },
  "profile.tile.days": { es: "Días activos", en: "Active days" },
  "profile.tile.xp": { es: "XP total", en: "Total XP" },
  "profile.tile.ach": { es: "Logros", en: "Achievements" },

  // ── Kanji page ──────────────────────────────────────────────────────────
  "kanji.title.a": { es: "Catálogo de", en: "Catalog of" },
  "kanji.title.b": { es: "kanji", en: "kanji" },
  "kanji.startReview": { es: "Empezar repaso ({n})", en: "Start review ({n})" },
  "kanji.masterOf": { es: "漢字マスター", en: "漢字マスター" },
  "kanji.masteredOfTotal": { es: "/ {total} dominados", en: "/ {total} mastered" },
  "kanji.ofLevel": { es: "del nivel", en: "of the level" },
  "kanji.hint.done": {
    es: "¡Dominaste todo este nivel! Sube de objetivo en Ajustes para más kanji. 🎉",
    en: "You've mastered this whole level! Raise your goal in Settings for more kanji. 🎉",
  },
  "kanji.hint.due": {
    es: "Tienes {n} repaso(s) listo(s) — cada repaso correcto sube tu dominio.",
    en: "You have {n} review(s) ready — each correct review raises your mastery.",
  },
  "kanji.hint.none": {
    es: "Introduce kanji nuevos y practícalos. Solo cuentan como “dominados” tras repasarlos bien varias veces (SRS).",
    en: "Introduce new kanji and practice them. They only count as “mastered” after you review them well several times (SRS).",
  },
  "kanji.inPool": { es: "{n} kanji en tu pool", en: "{n} kanji in your pool" },
  "kanji.availableToIntro": {
    es: "{n} disponibles para introducir en tu repaso",
    en: "{n} available to add to your review",
  },
  "kanji.introduce1": { es: "Introducir 1", en: "Introduce 1" },
  "kanji.moreAvailable": {
    es: "+{n} más disponibles a medida que avances",
    en: "+{n} more available as you progress",
  },
  "kanji.consolidated": {
    es: "{n} kanji con repasos consolidados",
    en: "{n} kanji with consolidated reviews",
  },
  "kanjiTile.new": { es: "Nuevo", en: "New" },
  "kanjiTile.learning": { es: "Aprendiendo", en: "Learning" },
  "kanjiTile.mastered": { es: "Dominado", en: "Mastered" },
  "kanjiTile.hard": { es: "Difícil", en: "Hard" },
  "kanji.learningJp": { es: "学習中", en: "学習中" },
  "kanji.newJp": { es: "新しい漢字", en: "新しい漢字" },
  "kanji.masteredJp": { es: "覚えた", en: "覚えた" },
  "kanji.desc": {
    es: "Repaso por SRS, nuevos disponibles y los que ya tienes dominados.",
    en: "SRS review, new ones available, and the ones you've already mastered.",
  },
  "kanji.noReviews": { es: "Sin repasos pendientes", en: "No reviews due" },
  "kanji.learning": { es: "Aprendiendo", en: "Learning" },
  "kanji.toDiscover": { es: "Por descubrir", en: "To discover" },
  "kanji.mastered": { es: "Dominados", en: "Mastered" },
  "kanji.newAvailable": { es: "Nuevos disponibles", en: "New available" },

  // ── Grammar page ────────────────────────────────────────────────────────
  "grammar.desc": {
    es: "Explicaciones cortas, ejemplos reales y un quiz de tres preguntas para confirmar que entendiste. Al dominar una lección ganas XP.",
    en: "Short explanations, real examples and a three-question quiz to confirm you understood. Master a lesson to earn XP.",
  },
  "grammar.title.a": { es: "Gramática", en: "Grammar" },
  "grammar.title.b": { es: "paso a paso", en: "step by step" },
  "grammar.masteredCount": { es: "{done}/{total} dominadas", en: "{done}/{total} mastered" },
  "grammar.loading": { es: "Cargando lecciones…", en: "Loading lessons…" },
  "grammar.fallbackCategory": { es: "Gramática", en: "Grammar" },
  "grammar.confidence": { es: "Confianza {n}%", en: "Confidence {n}%" },
  "glesson.examples": { es: "Ejemplos", en: "Examples" },
  "glesson.startQuiz": { es: "Empezar quiz ({n} preguntas)", en: "Start quiz ({n} questions)" },
  "glesson.quizProgress": { es: "Quiz · pregunta {n} de {total}", en: "Quiz · question {n} of {total}" },
  "glesson.grading": { es: "Calificando…", en: "Grading…" },
  "glesson.submit": { es: "Enviar quiz", en: "Submit quiz" },
  "glesson.mastered": { es: "¡Lección dominada!", en: "Lesson mastered!" },
  "glesson.almost": { es: "Casi", en: "Almost" },
  "glesson.score": { es: "Puntaje", en: "Score" },
  "glesson.correct": { es: "Correctas", en: "Correct" },
  "glesson.leveledUp": { es: "¡Subiste al nivel {n}!", en: "You reached level {n}!" },
  "glesson.retry": { es: "Repetir", en: "Retry" },
  "glesson.done": { es: "Listo", en: "Done" },
  "grammar.new": { es: "Nuevo", en: "New" },
  "grammar.learning": { es: "Aprendiendo", en: "Learning" },
  "grammar.mastered": { es: "Dominado", en: "Mastered" },

  // ── Review page ─────────────────────────────────────────────────────────
  "review.eyebrow": { es: "復習 — Repaso", en: "復習 — Review" },
  "review.desc": {
    es: "Abre un nivel y repite cualquier lección para reforzar — repasar es lo que fija el aprendizaje.",
    en: "Open a level and replay any lesson to reinforce — reviewing is what makes learning stick.",
  },
  "review.title.a": { es: "Repasa por", en: "Review by" },
  "review.title.b": { es: "nivel", en: "level" },
  "review.practice": { es: "Practicar", en: "Practice" },
  "review.complete": { es: "Completo", en: "Complete" },
  "review.replay": { es: "Repetir", en: "Replay" },
  "review.level": { es: "Nivel {level}", en: "Level {level}" },
  "review.counts": {
    es: "{total} lecciones · {done} completadas",
    en: "{total} lessons · {done} completed",
  },
  "review.notStarted": { es: "sin empezar", en: "not started" },
  "review.view": { es: "Ver", en: "View" },

  // ── Reading page ────────────────────────────────────────────────────────
  "reading.desc": {
    es: "Diálogos y textos cortos basados en situaciones reales. Lee, marca traducción si necesitas, y resuelve un mini quiz.",
    en: "Dialogues and short texts based on real situations. Read, toggle the translation if needed, and solve a mini quiz.",
  },
  "reading.title.a": { es: "Lectura", en: "Reading" },
  "reading.title.b": { es: "por situaciones", en: "by situation" },
  "reading.lastScore": { es: "Última: {n}%", en: "Last: {n}%" },
  "reading.hideTranslation": { es: "Ocultar traducción", en: "Hide translation" },
  "reading.showTranslation": { es: "Mostrar traducción", en: "Show translation" },
  "reading.grading": { es: "Calificando…", en: "Grading…" },
  "reading.confirm": { es: "Confirmar respuestas", en: "Confirm answers" },
  "reading.back": { es: "Volver", en: "Back" },
  "reading.showTranslationBtn": { es: "Mostrar traducción", en: "Show translation" },
  "reading.comprehension": { es: "Comprensión", en: "Comprehension" },
  "reading.correct": { es: "{done} / {total} correctas", en: "{done} / {total} correct" },
  "reading.backToTexts": { es: "Volver a textos", en: "Back to texts" },

  // ── Listening page ──────────────────────────────────────────────────────
  "listening.desc": {
    es: "Cada diálogo usa la voz japonesa de tu Mac. Puedes ajustar la velocidad y ver la transcripción si lo necesitas.",
    en: "Each dialogue uses your Mac's Japanese voice. You can adjust the speed and view the transcript if you need it.",
  },
  "listening.title.a": { es: "Listening con", en: "Listening with" },
  "listening.title.b": { es: "voces nativas de macOS", en: "native macOS voices" },
  "listening.comprehension": { es: "Comprensión auditiva", en: "Listening comprehension" },
  "listening.voice": { es: "Voz: {name}", en: "Voice: {name}" },
  "listening.confirm": { es: "Confirmar respuestas", en: "Confirm answers" },
  "listening.grading": { es: "Calificando…", en: "Grading…" },
  "listening.correct": { es: "{done} / {total} correctas", en: "{done} / {total} correct" },
  "listening.backToDialogues": { es: "Volver a diálogos", en: "Back to dialogues" },
  "listening.natural": { es: "Natural", en: "Natural" },
  "listening.playing": { es: "Reproduciendo…", en: "Playing…" },
  "listening.tapToListen": { es: "Pulsa para escuchar", en: "Tap to listen" },
  "listening.hideTranscript": { es: "Ocultar transcripción", en: "Hide transcript" },
  "listening.showTranscript": { es: "Mostrar transcripción", en: "Show transcript" },
  "listening.hideTranslation": { es: "Ocultar traducción", en: "Hide translation" },
  "listening.translate": { es: "Traducir", en: "Translate" },

  // ── Speaking page ───────────────────────────────────────────────────────
  "speaking.eyebrow": { es: "会話 — Speaking", en: "会話 — Speaking" },
  "speaking.desc": {
    es: "Escucha la frase, grábate y compara. Usa el micrófono de tu Mac — la grabación nunca sale de tu equipo.",
    en: "Listen to the phrase, record yourself and compare. Use your Mac's mic — the recording never leaves your device.",
  },
  "speaking.title.a": { es: "Practica tu", en: "Practice your" },
  "speaking.title.b": { es: "pronunciación", en: "pronunciation" },
  "speaking.phraseCount": { es: "Frase {n} / {total}", en: "Phrase {n} / {total}" },
  "speaking.playing": { es: "Reproduciendo…", en: "Playing…" },
  "speaking.playNative": { es: "Escuchar nativa", en: "Play native" },
  "speaking.drill.jp": { es: "発音 · Ejercicio de pronunciación", en: "発音 · Pronunciation drill" },
  "speaking.drill.desc": {
    es: "Escúchala lento y repite parte por parte.",
    en: "Listen slowly and repeat part by part.",
  },
  "speaking.noSound": {
    es: "No detecto sonido. Verifica que tu mic esté seleccionado en Ajustes de macOS → Sonido → Entrada.",
    en: "No sound detected. Check that your mic is selected in macOS Settings → Sound → Input.",
  },
  "speaking.recording": { es: "Grabando…", en: "Recording…" },
  "speaking.ready": { es: "Listo", en: "Ready" },
  "speaking.tapToRecord": { es: "Pulsa para grabar", en: "Tap to record" },
  "speaking.noRecording": { es: "Aún sin grabación", en: "No recording yet" },
  "speaking.yourRecording": { es: "Tu grabación", en: "Your recording" },
  "speaking.playYours": { es: "Escuchar tu voz", en: "Play your voice" },
  "speaking.playback": { es: "Reproducir", en: "Play back" },

  // ── Play / minigames hub ────────────────────────────────────────────────
  "play.eyebrow": { es: "ミニゲーム — Mini-juegos", en: "ミニゲーム — Minigames" },
  "play.desc": {
    es: "Cada juego entrena un skill específico. La dificultad alta da más XP. Bate tu récord para ganar estrellas extra.",
    en: "Each game trains a specific skill. Higher difficulty gives more XP. Beat your record to earn extra stars.",
  },
  "play.title.a": { es: "Aprende", en: "Learn by" },
  "play.title.b": { es: "jugando", en: "playing" },
  "play.gameOfDay": { es: "Juego del día", en: "Game of the day" },
  "play.weekChallenge": { es: "Reto de la semana", en: "Challenge of the week" },
  "play.bonusDaily": { es: "+25% XP hoy", en: "+25% XP today" },
  "play.bonusWeekly": { es: "+50% XP semanal", en: "+50% XP weekly" },
  "play.catalog.jp": { es: "カタログ — Catálogo", en: "カタログ — Catalog" },
  "play.catalog": { es: "Catálogo", en: "Catalog" },
  "play.levels": { es: "{n} niveles", en: "{n} levels" },
  "play.chooseDifficulty": { es: "Elige dificultad", en: "Choose difficulty" },
  "play.record": { es: "récord {n}", en: "record {n}" },
  "play.playArrow": { es: "Jugar ▸", en: "Play ▸" },

  // ── Stats / progress page ───────────────────────────────────────────────
  "stats.eyebrow": { es: "進捗 — Progreso", en: "進捗 — Progress" },
  "stats.title.a": { es: "Tu evolución", en: "Your full" },
  "stats.title.b": { es: "completa", en: "evolution" },
  "stats.desc": {
    es: "Cuánto has invertido, días activos, kanjis dominados y los logros desbloqueados.",
    en: "How much you've invested, active days, kanji mastered and achievements unlocked.",
  },
  "stats.time": { es: "Tiempo aprendido", en: "Time learned" },
  "stats.days": { es: "Días activos", en: "Active days" },
  "stats.xp": { es: "XP total", en: "Total XP" },
  "stats.ach": { es: "Logros", en: "Achievements" },
  "stats.activity.jp": { es: "活動 — Actividad", en: "活動 — Activity" },
  "stats.activity.title": {
    es: "Tu actividad de los últimos meses",
    en: "Your activity over the last few months",
  },
  "stats.ach.jp": { es: "実績 — Logros", en: "実績 — Achievements" },
  "stats.ach.title": { es: "Logros", en: "Achievements" },
  "stats.unlocked": { es: "Desbloqueado", en: "Unlocked" },
  "stats.heatmap.caption": {
    es: "Minutos que estudiaste por semana en los últimos ~4 meses. Cada barra es una semana.",
    en: "Minutes you studied per week over the last ~4 months. Each bar is a week.",
  },
  "stats.heatmap.summary": {
    es: "{days} días activos · {mins} min en total",
    en: "{days} active days · {mins} min total",
  },
  "stats.heatmap.bestWeek": { es: "Mejor semana:", en: "Best week:" },

  // ── Journal page ────────────────────────────────────────────────────────
  "journal.eyebrow": { es: "日記 — Diario", en: "日記 — Journal" },
  "journal.desc": {
    es: "Una sola frase basta. Escribe en japonés cada día y recibe consejos para mejorar tu constancia y estilo.",
    en: "A single sentence is enough. Write in Japanese every day and get tips to improve your consistency and style.",
  },
  "journal.title.a": { es: "Escribe tu día", en: "Write your day" },
  "journal.title.b": { es: "en japonés", en: "in Japanese" },
  "journal.newEntry": { es: "Nueva entrada", en: "New entry" },
  "journal.chars": { es: "{n} caracteres", en: "{n} characters" },
  "journal.saving": { es: "Guardando…", en: "Saving…" },
  "journal.save": { es: "Guardar entrada", en: "Save entry" },
  "journal.history.jp": { es: "履歴", en: "履歴" },
  "journal.history": { es: "Historial", en: "History" },
  "journal.entries": { es: "{n} entradas", en: "{n} entries" },
  "journal.empty": {
    es: "Aún no has escrito nada. Empieza con una frase corta.",
    en: "You haven't written anything yet. Start with a short sentence.",
  },
  "journal.corrections": { es: "Correcciones", en: "Corrections" },

  // ── Learn / Course page ─────────────────────────────────────────────────
  "learn.eyebrow": { es: "授業 — Tu curso", en: "授業 — Your course" },
  "learn.title.a": { es: "Aprende paso a paso,", en: "Learn step by step," },
  "learn.title.b": { es: "como una clase real", en: "like a real class" },
  "learn.desc": {
    es: "Cada lección combina nuevos kanji, gramática, escucha y voz. Avanzas en orden — el siguiente paso siempre está marcado.",
    en: "Each lesson blends new kanji, grammar, listening and speaking. You progress in order — the next step is always marked.",
  },
  "learn.activities": { es: "actividades", en: "activities" },
  "learn.finalExam": { es: "Examen final — {level}", en: "Final exam — {level}" },
  "learn.finalExam.ready": {
    es: "Apruébalo con 60% o más para desbloquear {next}.",
    en: "Pass it with 60% or more to unlock {next}.",
  },
  "learn.finalExam.notReady": {
    es: "Apruébalo con 60% para desbloquear {next}. Te conviene terminar las lecciones primero ({done}/{total}).",
    en: "Pass it with 60% to unlock {next}. Better to finish the lessons first ({done}/{total}).",
  },
  "learn.nextLevel": { es: "el siguiente nivel", en: "the next level" },
  "learn.unitExam": { es: "Examen de unidad — {unit}", en: "Unit exam — {unit}" },
  "learn.unitExam.passed": { es: "Examen de unidad — Aprobado ✓", en: "Unit exam — Passed ✓" },
  "learn.unitExam.bestScore": {
    es: "Mejor nota: {score}%. Toca para repetirlo y mejorar.",
    en: "Best score: {score}%. Tap to retake and improve.",
  },
  "learn.unitExam.mixed": {
    es: "10 preguntas mezcladas. Pasas con 70% o más.",
    en: "10 mixed questions. Pass with 70% or more.",
  },
  "learn.unitExam.finishFirst": {
    es: "Termina las {total} lecciones para desbloquear ({done}/{total})",
    en: "Finish the {total} lessons to unlock ({done}/{total})",
  },
  "learn.retake.eyebrow": { es: "合格 · Aprobado", en: "合格 · Passed" },
  "learn.retake.title": { es: "Ya aprobaste este examen", en: "You already passed this exam" },
  "learn.retake.body": {
    es: "Tu mejor nota es {score}%. ¿Quieres repetirlo para practicar o mejorar tu nota?",
    en: "Your best score is {score}%. Want to retake it to practice or improve your score?",
  },
  "learn.retake.no": { es: "No, gracias", en: "No, thanks" },
  "learn.retake.yes": { es: "Sí, repetir", en: "Yes, retake" },

  // ── Onboarding ──────────────────────────────────────────────────────────
  "onb.start": { es: "Comenzar", en: "Start" },
  "onb.welcome.title.a": { es: "Hola {name}, bienvenido a", en: "Hi {name}, welcome to" },
  "onb.welcome.desc": {
    es: "Tu compañero personal para aprender japonés con constancia. Vamos a configurar tu plan en menos de un minuto.",
    en: "Your personal companion for learning Japanese consistently. Let's set up your plan in under a minute.",
  },
  "onb.welcome.feat1": { es: "Misiones diarias", en: "Daily missions" },
  "onb.welcome.feat2": { es: "Sube de nivel", en: "Level up" },
  "onb.welcome.feat3": { es: "Aprende por situaciones", en: "Learn by situations" },
  "onb.lang.title": { es: "¿En qué idioma quieres aprender?", en: "Which language do you want to learn in?" },
  "onb.lang.desc": {
    es: "Además del japonés, todo se explicará y se escuchará en el idioma que elijas. Podrás cambiarlo cuando quieras en Ajustes.",
    en: "Besides Japanese, everything will be explained and spoken in the language you choose. You can change it any time in Settings.",
  },
  "onb.lang.es.desc": { es: "Explicaciones y audio en español", en: "Explanations and audio in Spanish" },
  "onb.lang.en.desc": { es: "Explanations and audio in English", en: "Explanations and audio in English" },
  "onb.lang.system.desc": { es: "Sigue el idioma de tu dispositivo", en: "Follows your device language" },
  "onb.kana.title": { es: "¿Qué silabarios ya conoces?", en: "Which syllabaries do you already know?" },
  "onb.kana.desc": {
    es: "Si no los conoces, los integraré en tu plan diario antes que cualquier kanji.",
    en: "If you don't know them, I'll fit them into your daily plan before any kanji.",
  },
  "onb.kana.hiragana": { es: "El silabario base del japonés", en: "Japanese's base syllabary" },
  "onb.kana.katakana": { es: "Para préstamos del extranjero", en: "For foreign loanwords" },
  "onb.kana.none": { es: "Ninguno", en: "None" },
  "onb.kana.noneDesc": {
    es: "Empiezo desde cero — enséñame los silabarios primero",
    en: "I'm starting from zero — teach me the syllabaries first",
  },
  "onb.curLevel.title": { es: "¿En qué punto estás?", en: "Where are you right now?" },
  "onb.curLevel.desc": {
    es: "Sé honesto. Empezar bajo es mucho mejor que aburrirse o frustrarse.",
    en: "Be honest. Starting low beats getting bored or frustrated.",
  },
  "onb.curLevel.exam": { es: "¿No sabes tu nivel? Haz una evaluación", en: "Not sure of your level? Take a placement test" },
  "onb.curLevel.examDesc": {
    es: "Preguntas de N5 a N1 para ubicarte. Cambia cada día.",
    en: "N5-to-N1 questions to place you. Changes daily.",
  },
  "onb.targetLevel.title": { es: "¿Cuál es tu meta?", en: "What's your goal?" },
  "onb.targetLevel.desc": {
    es: "Esto define hacia dónde escala el contenido. Puedes cambiarlo cuando quieras.",
    en: "This sets how far the content scales. You can change it any time.",
  },
  "onb.minutes.title": { es: "¿Cuánto tiempo al día?", en: "How much time a day?" },
  "onb.minutes.desc": {
    es: "La constancia gana al volumen. Elige algo realista que puedas mantener.",
    en: "Consistency beats volume. Pick something realistic you can keep up.",
  },
  "onb.reminder.title": { es: "¿A qué hora te aviso?", en: "When should I remind you?" },
  "onb.reminder.desc": {
    es: "Notificación nativa de macOS para mantener tu racha. Puedes saltarlo si prefieres.",
    en: "A native macOS notification to keep your streak. You can skip it if you prefer.",
  },
  "onb.reminder.skip": { es: "Saltar", en: "Skip" },
  "onb.reminder.label": { es: "Hora del recordatorio", en: "Reminder time" },
  "onb.ready.title": { es: "Todo listo, がんばって", en: "All set, がんばって" },
  "onb.ready.desc": {
    es: "Tu plan diario se generará al abrir el dashboard. Empezamos pulsando crear.",
    en: "Your daily plan will be generated when you open the dashboard. Let's start by tapping create.",
  },
  "onb.ready.creating": { es: "Creando…", en: "Creating…" },
  "onb.ready.create": { es: "Crear mi plan", en: "Create my plan" },
  "onb.ready.yourPlan": { es: "Tu plan", en: "Your plan" },
  "onb.ready.name": { es: "Nombre", en: "Name" },
  "onb.ready.curLevel": { es: "Nivel actual", en: "Current level" },
  "onb.ready.goal": { es: "Objetivo", en: "Goal" },
  "onb.ready.known": { es: "Conocido", en: "Known" },
  "onb.ready.fromZero": { es: "Empezar desde cero", en: "Start from zero" },
  "onb.ready.dailyGoal": { es: "Meta diaria", en: "Daily goal" },
  "onb.ready.reminder": { es: "Recordatorio", en: "Reminder" },
  "onb.ready.noReminder": { es: "Sin recordatorio", en: "No reminder" },
  "onb.level.basic": { es: "Lo más básico", en: "The basics" },
  "onb.level.simple": { es: "Conversaciones simples", en: "Simple conversations" },
  "onb.level.intermediate": { es: "Intermedio", en: "Intermediate" },
  "onb.level.advanced": { es: "Avanzado", en: "Advanced" },
  "onb.level.mastery": { es: "Maestría", en: "Mastery" },
  "onb.min.streak": { es: "Para mantener la racha", en: "To keep the streak" },
  "onb.min.habit": { es: "Hábito diario", en: "Daily habit" },
  "onb.min.balanced": { es: "Equilibrado (recomendado)", en: "Balanced (recommended)" },
  "onb.min.serious": { es: "Ritmo serio", en: "Serious pace" },
  "onb.min.immersion": { es: "Inmersión", en: "Immersion" },
  "onb.min.accelerator": { es: "Acelerador", en: "Accelerator" },

  // ── Practica hub ────────────────────────────────────────────────────────
  "practica.eyebrow": { es: "練習 — Práctica", en: "練習 — Practice" },
  "practica.title.a": { es: "Pon a prueba lo que", en: "Test what you" },
  "practica.title.b": { es: "sabes", en: "know" },
  "practica.desc": {
    es: "Lectura, escucha y habla en un solo lugar. Elige cómo quieres practicar hoy.",
    en: "Reading, listening and speaking in one place. Choose how you want to practice today.",
  },
  "practica.reading": { es: "Lectura", en: "Reading" },
  "practica.readingDesc": {
    es: "Textos graduados a tu nivel para leer con furigana y comprensión.",
    en: "Level-graded texts to read with furigana and comprehension.",
  },
  "practica.listening": { es: "Listening", en: "Listening" },
  "practica.listeningDesc": {
    es: "Diálogos y audios reales para entrenar tu oído poco a poco.",
    en: "Real dialogues and audio to train your ear little by little.",
  },
  "practica.speaking": { es: "Speaking", en: "Speaking" },
  "practica.speakingDesc": {
    es: "Practica tu pronunciación en voz alta y recibe retroalimentación.",
    en: "Practice your pronunciation out loud and get feedback.",
  },
};

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** Non-reactive translate (for helpers outside React). */
export function translate(key: string, lang: NarrationLang, vars?: Vars): string {
  const entry = DICT[key];
  if (!entry) return interpolate(key, vars);
  return interpolate(entry[lang] ?? entry.es, vars);
}

export type TFn = (key: string, vars?: Vars) => string;

/** React hook: returns a `t(key, vars?)` bound to the current app language. */
export function useT(): TFn {
  const lang = useLanguage((s) => s.lang);
  return (key: string, vars?: Vars) => translate(key, lang, vars);
}
