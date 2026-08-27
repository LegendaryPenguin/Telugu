// High-leverage spoken-Telangana sentence patterns. Learning ~10 of these lets
// you generate hundreds of sentences instead of memorizing each one.
// ⚠️ Authored draft — pending native Telangana review (see docs/PLAN.md).

export interface PatternExample {
  te: string;
  roman: string;
  en: string;
}

export interface Pattern {
  id: string;
  title: string;
  formula: string; // shown big, with the slot in {…}
  explain: string;
  examples: PatternExample[];
  yourTurn: string; // an English prompt for the learner to try producing
}

export const PATTERNS: Pattern[] = [
  {
    id: "want",
    title: "Saying you want something",
    formula: "naaku {thing} kaavali",
    explain: "‘naaku’ = to me. Put the thing in the middle, end with ‘kaavali’ (want/need).",
    examples: [
      { te: "నాకు టీ కావాలి", roman: "naaku tea kaavali", en: "I want tea." },
      { te: "నాకు కొంచెం టైం కావాలి", roman: "naaku konchem time kaavali", en: "I need a little time." },
      { te: "నాకు నువ్వు కావాలి", roman: "naaku nuvvu kaavali", en: "I want you." }
    ],
    yourTurn: "Say: “I want coffee.” (coffee = coffee)"
  },
  {
    id: "dontwant",
    title: "Saying you DON'T want something",
    formula: "naaku {thing} vaddu",
    explain: "Same as above but swap ‘kaavali’ for ‘vaddu’ (don't want). Very common.",
    examples: [
      { te: "నాకు అది వద్దు", roman: "naaku adi vaddu", en: "I don't want that." },
      { te: "నాకు ఇప్పుడు వద్దు", roman: "naaku ippudu vaddu", en: "I don't want it now." }
    ],
    yourTurn: "Say: “I don't want tea.”"
  },
  {
    id: "like",
    title: "Saying you like something",
    formula: "naaku {thing} ishtam",
    explain: "‘ishtam’ = liking. For ‘I like you’, ‘you’ becomes ‘nuvvante’.",
    examples: [
      { te: "నాకు ఈ పాట ఇష్టం", roman: "naaku ee paata ishtam", en: "I like this song." },
      { te: "నాకు నువ్వంటే ఇష్టం", roman: "naaku nuvvante ishtam", en: "I like you." }
    ],
    yourTurn: "Say: “I like this movie.” (movie = cinema)"
  },
  {
    id: "doing",
    title: "Saying what you're doing (right now)",
    formula: "{verb}-tunna",
    explain: "Add ‘-tunna’ to a verb for ‘I'm __ing’. This ‘-a’ ending (not ‘-anu’) is the Telangana marker.",
    examples: [
      { te: "తింటున్న", roman: "tintunna", en: "I'm eating." },
      { te: "పోతున్న", roman: "potunna", en: "I'm going." },
      { te: "నీ గురించి ఆలోచిస్తున్న", roman: "nee gurinchi aalochistunna", en: "I'm thinking about you." }
    ],
    yourTurn: "Say: “I'm coming.” (come = raa → vastunna)"
  },
  {
    id: "askdoing",
    title: "Asking what she's doing",
    formula: "{verb}-tunnav(a)?",
    explain: "Add ‘-tunnav’ for ‘you're __ing’, and ‘-a’ to make it a question. Telangana uses ‘-av’, not ‘-avu’.",
    examples: [
      { te: "ఏం చేస్తున్నవ్?", roman: "em chestunnav?", en: "What are you doing?" },
      { te: "ఎక్కడికి పోతున్నవ్?", roman: "ekkadiki potunnav?", en: "Where are you going?" }
    ],
    yourTurn: "Ask: “Are you eating?” (tintunnava?)"
  },
  {
    id: "didyou",
    title: "Asking if she did something",
    formula: "{verb}-inav(a)?",
    explain: "Past ‘you’ = ‘-inav’; add ‘-a’ for a question. The famous ‘tinnava?’ (did you eat?) is this pattern.",
    examples: [
      { te: "తిన్నవా?", roman: "tinnava?", en: "Did you eat?" },
      { te: "లేచినవా?", roman: "lechinava?", en: "Did you wake up?" }
    ],
    yourTurn: "Ask: “Did you come?” (vachchinava?)"
  },
  {
    id: "shallwe",
    title: "Suggesting we do something together",
    formula: "{verb}-daam(a)?",
    explain: "‘-daam’ = let's __; add ‘-a’ to ask ‘shall we?’. Great for making plans.",
    examples: [
      { te: "పోదామా?", roman: "podaama?", en: "Shall we go?" },
      { te: "సినిమాకి పోదాం", roman: "cinemaki podaam", en: "Let's go to a movie." },
      { te: "మాట్లాడదామా?", roman: "maatladdaama?", en: "Shall we talk?" }
    ],
    yourTurn: "Suggest: “Shall we eat?” (tindaama?)"
  },
  {
    id: "howis",
    title: "Describing how something is / how you feel",
    formula: "{quality}-ga undi",
    explain: "Add ‘-ga undi’ to a quality word for ‘it is __’. Works for feelings too.",
    examples: [
      { te: "బాగుంది", roman: "bagundi", en: "It's good." },
      { te: "సంతోషంగా ఉంది", roman: "santoshamga undi", en: "(I'm) happy." },
      { te: "కారంగా ఉంది", roman: "kaaramga undi", en: "It's spicy." }
    ],
    yourTurn: "Say: “It's beautiful.” (andam → andamga undi)"
  }
];
