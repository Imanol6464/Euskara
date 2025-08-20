// Lesson data for Level 1 – Lesson 1 (Salutations)
const LESSON = {
  id: "m1l1",
  title: "Leçon 1 : Salutations",
  vocab: [
    { eu: "Kaixo", fr: "Bonjour / Salut", note: "Général, toute la journée" },
    { eu: "Egun on", fr: "Bonjour (le matin)" },
    { eu: "Arratsalde on", fr: "Bon après-midi" },
    { eu: "Gabon", fr: "Bonsoir / Bonne nuit" },
    { eu: "Agur", fr: "Au revoir" }
  ],
  // A tiny quiz set: single-choice (mcq) + typing (type)
  questions: [
    {
      type: "mcq",
      prompt: "Comment dit-on « Bonjour (le matin) » en basque ?",
      options: ["Kaixo", "Egun on", "Gabon", "Arratsalde on"],
      answer: "Egun on"
    },
    {
      type: "mcq",
      prompt: "Que signifie « Agur » ?",
      options: ["Bonjour", "Au revoir", "Merci", "Bon après-midi"],
      answer: "Au revoir"
    },
    {
      type: "mcq",
      prompt: "Choisis la bonne traduction : « Bonsoir / Bonne nuit »",
      options: ["Gabon", "Kaixo", "Arratsalde on", "Egun on"],
      answer: "Gabon"
    },
    {
      type: "type",
      prompt: "Écris en basque : « Bonjour / Salut » (général)",
      placeholder: "Ta réponse…",
      acceptable: ["kaixo"]
    },
    {
      type: "type",
      prompt: "Écris en basque : « Bon après-midi »",
      placeholder: "Ta réponse…",
      acceptable: ["arratsalde on", "arratsaldeon"]
    }
  ]
};
