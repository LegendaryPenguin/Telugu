import type { Deck } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Telangana-dialect starter content.
//
// ⚠️ AUTHORED DRAFT — needs a native Telangana speaker's review before being
// treated as authoritative (spellings, romanization, and register). See
// docs/PLAN.md §7. Romanization uses a simple readable scheme: doubled vowels
// = long (aa/ee/oo), and it approximates sound rather than being scholarly.
//
// Telangana markers used throughout: "etla" (not "ela"), verb endings in
// "-av / -tav / -na" (unnav, chestunnav, premistunna), fillers "iga", "emo".
// ─────────────────────────────────────────────────────────────────────────────

export const DECKS: Deck[] = [
  {
    id: "greetings",
    title: "Greetings & the basics",
    description: "The first things you'll say every day.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "g1", te: "నువ్వు ఎట్ల ఉన్నవ్?", roman: "nuvvu etla unnav?", en: "How are you?", note: "Telangana 'etla' + '-av' ending. Standard Telugu would be 'ela unnavu'.", priority: 1 },
      { id: "g2", te: "నేను బాగున్న", roman: "nenu bagunna", en: "I'm good.", priority: 2 },
      { id: "g3", te: "బాగున్నవా?", roman: "bagunnava?", en: "Are you doing well?" },
      { id: "g4", te: "ఏం చేస్తున్నవ్?", roman: "em chestunnav?", en: "What are you doing?", priority: 2 },
      { id: "g5", te: "ఏమైంది?", roman: "emaindi?", en: "What happened? / What's up?" },
      { id: "g6", te: "ఎక్కడున్నవ్?", roman: "ekkadunnav?", en: "Where are you?" },
      { id: "g7", te: "సరే", roman: "sare", en: "Okay / alright.", note: "Extremely common. Use it constantly.", priority: 1 },
      { id: "g8", te: "జాగ్రత్త", roman: "jaagratta", en: "Take care." },
      { id: "g9", te: "అవును", roman: "avunu", en: "Yes.", note: "In fast Telangana speech often 'avnu'.", priority: 1 },
      { id: "g10", te: "కాదు", roman: "kaadu", en: "No / it's not.", priority: 1 }
    ]
  },
  {
    id: "affection",
    title: "Affection & the relationship",
    description: "The reason you're here.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "a1", te: "నాకు నువ్వంటే ఇష్టం", roman: "naaku nuvvante ishtam", en: "I like you.", literal: "to-me you-that liking", priority: 2 },
      { id: "a2", te: "నిన్ను ప్రేమిస్తున్న", roman: "ninnu premistunna", en: "I love you.", note: "Telangana drops the '-nu': 'premistunna' (standard: 'premistunnanu').", priority: 1 },
      { id: "a3", te: "నువ్వు గుర్తుకొస్తున్నవ్", roman: "nuvvu gurtukostunnav", en: "I keep thinking of you.", literal: "you coming-to-memory-are", note: "Lit. 'you keep coming to my mind' — the natural way to say you miss someone.", priority: 2 },
      { id: "a4", te: "నిన్ను మిస్ అవుతున్న", roman: "ninnu miss avutunna", en: "I'm missing you.", note: "Casual Tenglish version — very common among young couples." },
      { id: "a5", te: "నువ్వంటే నాకు చాలా ఇష్టం", roman: "nuvvante naaku chaala ishtam", en: "I like you a lot." },
      { id: "a6", te: "నీతో మాట్లాడాలని ఉంది", roman: "neeto maatladaalani undi", en: "I want to talk with you." },
      { id: "a7", te: "నువ్వు నా పక్కన ఉంటే బాగుంటది", roman: "nuvvu naa pakkana unte baguntadi", en: "It'd be nice if you were next to me.", note: "'-tadi' ending is a Telangana marker (standard: 'baguntundi')." },
      { id: "a8", te: "నవ్వు చూస్తే బాగుంటది", roman: "navvu chuste baguntadi", en: "Your smile looks lovely.", literal: "smile if-seen it-is-nice" }
    ]
  },
  {
    id: "daily",
    title: "Daily check-ins",
    description: "Morning-to-night texting and calling.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "d1", te: "తిన్నవా?", roman: "tinnava?", en: "Did you eat?", note: "The classic Telugu 'I care about you' question.", priority: 1 },
      { id: "d2", te: "ఏం తింటవ్?", roman: "em tintav?", en: "What will you eat?" },
      { id: "d3", te: "లేచినవా?", roman: "lechinava?", en: "Did you wake up?" },
      { id: "d4", te: "పడుకుంటున్న", roman: "padukuntunna", en: "I'm going to sleep." },
      { id: "d5", te: "నాకు ఆకలైతంది", roman: "naaku aakalaitandi", en: "I'm hungry.", note: "Telangana form of 'aakalestundi'." },
      { id: "d6", te: "నాకు నిద్రొస్తుంది", roman: "naaku nidrostundi", en: "I'm feeling sleepy." },
      { id: "d7", te: "ఫోన్ చెయ్", roman: "phone chey", en: "Call me." },
      { id: "d8", te: "కాసేపు మాట్లాడదామా?", roman: "kaasepu maatladdama?", en: "Shall we talk for a bit?" },
      { id: "d9", te: "గుడ్ నైట్", roman: "good night", en: "Good night.", note: "English loanword is the everyday casual choice." },
      { id: "d10", te: "మంచిగుంది", roman: "manchigundi", en: "It's nice / all good.", note: "Telangana 'manchi ga undi'." }
    ]
  },
  {
    id: "understanding",
    title: "Keeping the conversation alive",
    description: "Rescue phrases for when you don't follow.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "u1", te: "అర్థమైందా?", roman: "arthamainda?", en: "Did you understand?" },
      { id: "u2", te: "నాకు అర్థం కాలేదు", roman: "naaku artham kaaledu", en: "I didn't understand.", priority: 1 },
      { id: "u3", te: "మళ్ళీ చెప్పు", roman: "malli cheppu", en: "Say it again.", priority: 2 },
      { id: "u4", te: "నెమ్మదిగా చెప్పు", roman: "nemmadiga cheppu", en: "Say it slowly.", priority: 1 },
      { id: "u5", te: "నాకు తెల్వదు", roman: "naaku telvadu", en: "I don't know.", note: "Telangana form of 'teliyadu'." },
      { id: "u6", te: "ఇది ఇంగ్లీష్ లో ఏమంటరు?", roman: "idi english lo emantaru?", en: "What do you call this in English?" },
      { id: "u7", te: "ఏమో", roman: "emo", en: "Who knows / maybe.", note: "Handy noncommittal filler." },
      { id: "u8", te: "ఒక్క నిమిషం", roman: "okka nimisham", en: "One minute / hold on.", priority: 2 }
    ]
  },
  {
    id: "blocks",
    title: "Building blocks",
    description: "The words you snap together to make your own sentences.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "b1", te: "నేను", roman: "nenu", en: "I / me" },
      { id: "b2", te: "నువ్వు", roman: "nuvvu", en: "you" },
      { id: "b3", te: "మనం", roman: "manam", en: "we (you + me)" },
      { id: "b4", te: "ఏంటి", roman: "enti", en: "what", note: "Telangana often 'em' as a prefix: 'em chestunnav'." },
      { id: "b5", te: "ఎక్కడ", roman: "ekkada", en: "where" },
      { id: "b6", te: "ఎప్పుడు", roman: "eppudu", en: "when" },
      { id: "b7", te: "ఎవరు", roman: "evaru", en: "who" },
      { id: "b8", te: "ఎందుకు", roman: "enduku", en: "why" },
      { id: "b9", te: "ఎట్ల", roman: "etla", en: "how", note: "Telangana form of 'ela'." },
      { id: "b10", te: "కావాలి", roman: "kaavali", en: "want / need", note: "'naaku ___ kaavali' = I want ___." },
      { id: "b11", te: "ఇష్టం", roman: "ishtam", en: "liking", note: "'naaku ___ ishtam' = I like ___." },
      { id: "b12", te: "చెయ్", roman: "chey", en: "do (command)" },
      { id: "b13", te: "పో", roman: "po", en: "go (command)" },
      { id: "b14", te: "రా", roman: "raa", en: "come (command)" },
      { id: "b15", te: "చెప్పు", roman: "cheppu", en: "tell / say (command)" },
      { id: "b16", te: "చూడు", roman: "choodu", en: "look / see (command)" }
    ]
  },
  {
    id: "questions",
    title: "Asking questions",
    description: "Keep her talking — ask, don't just answer.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "q1", te: "ఏం జరిగింది?", roman: "em jarigindi?", en: "What happened?" },
      { id: "q2", te: "ఎక్కడికి పోతున్నవ్?", roman: "ekkadiki potunnav?", en: "Where are you going?" },
      { id: "q3", te: "ఎప్పుడు వస్తవ్?", roman: "eppudu vastav?", en: "When will you come?" },
      { id: "q4", te: "ఎందుకు?", roman: "enduku?", en: "Why?" },
      { id: "q5", te: "ఇది ఏంటి?", roman: "idi enti?", en: "What is this?" },
      { id: "q6", te: "నీకు ఏం కావాలి?", roman: "neeku em kaavali?", en: "What do you want?" },
      { id: "q7", te: "ఎలా ఉంది?", roman: "ela undi?", en: "How is it?" },
      { id: "q8", te: "నిజంగా?", roman: "nijamga?", en: "Really?" }
    ]
  },
  {
    id: "feelings",
    title: "Feelings",
    description: "Say how you feel — the heart of any conversation.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "f1", te: "నాకు సంతోషంగా ఉంది", roman: "naaku santoshamga undi", en: "I'm happy." },
      { id: "f2", te: "నాకు బాధగా ఉంది", roman: "naaku baadhaga undi", en: "I'm sad / upset." },
      { id: "f3", te: "నాకు కోపం వచ్చింది", roman: "naaku kopam vachindi", en: "I got angry." },
      { id: "f4", te: "నాకు భయంగా ఉంది", roman: "naaku bhayamga undi", en: "I'm scared." },
      { id: "f5", te: "అలసిపోయిన", roman: "alasipoyina", en: "I'm tired." },
      { id: "f6", te: "నాకు విసుగొస్తుంది", roman: "naaku visugostundi", en: "I'm getting bored." },
      { id: "f7", te: "నాకు నవ్వొస్తుంది", roman: "naaku navvostundi", en: "It's making me laugh." },
      { id: "f8", te: "పర్వాలేదు", roman: "parvaledu", en: "It's okay / no worries." }
    ]
  },
  {
    id: "flirting",
    title: "Sweet talk",
    description: "Compliments and teasing — use sparingly, mean them.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "s1", te: "నువ్వు చాలా అందంగా ఉన్నవ్", roman: "nuvvu chaala andamga unnav", en: "You look really beautiful." },
      { id: "s2", te: "నీ నవ్వు అదిరింది", roman: "nee navvu adirindi", en: "Your smile is amazing.", note: "'adirindi' = 'was awesome' — casual, expressive." },
      { id: "s3", te: "నిన్ను చూస్తే హ్యాపీగా ఉంటది", roman: "ninnu chuste happy ga untadi", en: "Seeing you makes me happy." },
      { id: "s4", te: "నువ్వు లేకుంటే బోర్ కొడ్తది", roman: "nuvvu lekunte bore kodtadi", en: "It's boring without you." },
      { id: "s5", te: "నువ్వే నా వరల్డ్", roman: "nuvve naa world", en: "You're my whole world.", note: "Tenglish — sweet and common." },
      { id: "s6", te: "ఎప్పుడు కలుద్దాం?", roman: "eppudu kaluddaam?", en: "When shall we meet?" }
    ]
  },
  {
    id: "plans",
    title: "Time & plans",
    description: "Make plans, set times, say when.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "p1", te: "ఇప్పుడు", roman: "ippudu", en: "now" },
      { id: "p2", te: "తర్వాత", roman: "tarvaata", en: "later / after" },
      { id: "p3", te: "రేపు", roman: "repu", en: "tomorrow" },
      { id: "p4", te: "నిన్న", roman: "ninna", en: "yesterday" },
      { id: "p5", te: "ఈరోజు", roman: "eeroju", en: "today" },
      { id: "p6", te: "కాసేపట్లో", roman: "kaasepatlo", en: "in a little while" },
      { id: "p7", te: "బయటికి పోదామా?", roman: "bayatiki podama?", en: "Shall we go out?" },
      { id: "p8", te: "సినిమాకి పోదాం", roman: "cinemaki podaam", en: "Let's go to a movie." },
      { id: "p9", te: "నేను రెడీ", roman: "nenu ready", en: "I'm ready." },
      { id: "p10", te: "కొంచెం లేట్ అవుతది", roman: "konchem late avutadi", en: "I'll be a little late." }
    ]
  },
  {
    id: "food",
    title: "Food & eating",
    description: "The other love language.",
    dialect: "telangana",
    register: "casual",
    phrases: [
      { id: "fd1", te: "ఏం తిందాం?", roman: "em tindaam?", en: "What shall we eat?" },
      { id: "fd2", te: "నాకు చాలా ఆకలైతంది", roman: "naaku chaala aakalaitandi", en: "I'm really hungry." },
      { id: "fd3", te: "ఇది చాలా బాగుంది", roman: "idi chaala bagundi", en: "This is really tasty." },
      { id: "fd4", te: "కారంగా ఉంది", roman: "kaaramga undi", en: "It's spicy." },
      { id: "fd5", te: "ఇంకొంచెం కావాలా?", roman: "inkonchem kaavaala?", en: "Do you want a bit more?" },
      { id: "fd6", te: "నాకు వద్దు", roman: "naaku vaddu", en: "I don't want (any).", note: "'vaddu' = 'don't want' — the opposite of 'kaavali'." },
      { id: "fd7", te: "టీ తాగుదామా?", roman: "tea taagudaama?", en: "Shall we have tea?" },
      { id: "fd8", te: "కడుపు నిండింది", roman: "kadupu nindindi", en: "I'm full." }
    ]
  }
];

// Set to false only after native review of a deck's contents.
export const CONTENT_NEEDS_NATIVE_REVIEW = true;
