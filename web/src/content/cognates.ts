// Sanskrit-derived words that Hindi and Telugu SHARE — a big head start for a
// Hindi speaker. The rule of thumb: Telugu keeps the Sanskrit stem and usually
// adds -m/-am (neuter noun) or -(u)ḍu (masculine). Strip that ending and you're
// usually holding the Hindi word. Roughly a dozen forms below were spot-checked
// on Wiktionary; the rest are standard high-frequency tatsama.

export interface Cognate {
  hindi: string; // Devanagari for the visual match
  hindiRoman: string;
  te: string; // Telugu script → drives audio
  teRoman: string;
  en: string;
}

// Grouped so we can show a small, memorable set at a time instead of a wall.
export interface CognateGroup {
  title: string;
  note?: string;
  items: Cognate[];
}

export const COGNATE_GROUPS: CognateGroup[] = [
  {
    title: "Feelings & inner life",
    items: [
      { hindi: "प्रेम", hindiRoman: "prem", te: "ప్రేమ", teRoman: "prema", en: "love" },
      { hindi: "संतोष", hindiRoman: "santosh", te: "సంతోషం", teRoman: "santosham", en: "happiness" },
      { hindi: "कोप", hindiRoman: "kop", te: "కోపం", teRoman: "kopam", en: "anger" },
      { hindi: "भय", hindiRoman: "bhay", te: "భయం", teRoman: "bhayam", en: "fear" },
      { hindi: "स्नेह", hindiRoman: "sneh", te: "స్నేహం", teRoman: "sneham", en: "affection / friendship" },
      { hindi: "शांति", hindiRoman: "shaanti", te: "శాంతి", teRoman: "shaanti", en: "peace" }
    ]
  },
  {
    title: "Everyday abstract nouns",
    items: [
      { hindi: "समय", hindiRoman: "samay", te: "సమయం", teRoman: "samayam", en: "time" },
      { hindi: "अर्थ", hindiRoman: "arth", te: "అర్థం", teRoman: "artham", en: "meaning" },
      { hindi: "प्रश्न", hindiRoman: "prashna", te: "ప్రశ్న", teRoman: "prashna", en: "question" },
      { hindi: "उत्तर", hindiRoman: "uttar", te: "ఉత్తరం", teRoman: "uttaram", en: "answer / letter" },
      { hindi: "समाचार", hindiRoman: "samaachaar", te: "సమాచారం", teRoman: "samaacharam", en: "news" },
      { hindi: "विषय", hindiRoman: "vishay", te: "విషయం", teRoman: "vishayam", en: "topic / matter" },
      { hindi: "समस्या", hindiRoman: "samasya", te: "సమస్య", teRoman: "samasya", en: "problem" },
      { hindi: "सत्य", hindiRoman: "satya", te: "సత్యం", teRoman: "satyam", en: "truth" }
    ]
  },
  {
    title: "World & nature",
    items: [
      { hindi: "जल", hindiRoman: "jal", te: "జలం", teRoman: "jalam", en: "water" },
      { hindi: "प्रपंच", hindiRoman: "prapanch", te: "ప్రపంచం", teRoman: "prapancham", en: "world" },
      { hindi: "आकाश", hindiRoman: "aakaash", te: "ఆకాశం", teRoman: "aakaasam", en: "sky" },
      { hindi: "समुद्र", hindiRoman: "samudra", te: "సముద్రం", teRoman: "samudram", en: "ocean" },
      { hindi: "नदी", hindiRoman: "nadi", te: "నది", teRoman: "nadi", en: "river" },
      { hindi: "पर्वत", hindiRoman: "parvat", te: "పర్వతం", teRoman: "parvatam", en: "mountain" },
      { hindi: "देश", hindiRoman: "desh", te: "దేశం", teRoman: "desam", en: "country" },
      { hindi: "अग्नि", hindiRoman: "agni", te: "అగ్ని", teRoman: "agni", en: "fire" }
    ]
  },
  {
    title: "People & life",
    items: [
      { hindi: "जीवन", hindiRoman: "jeevan", te: "జీవితం", teRoman: "jeevitam", en: "life" },
      { hindi: "मानव", hindiRoman: "manav", te: "మానవుడు", teRoman: "maanavudu", en: "human" },
      { hindi: "गुरु", hindiRoman: "guru", te: "గురువు", teRoman: "guruvu", en: "teacher" },
      { hindi: "मित्र", hindiRoman: "mitra", te: "మిత్రుడు", teRoman: "mitrudu", en: "friend" },
      { hindi: "देव", hindiRoman: "dev", te: "దేవుడు", teRoman: "devudu", en: "god" },
      { hindi: "राजा", hindiRoman: "raaja", te: "రాజు", teRoman: "raaju", en: "king" },
      { hindi: "सूर्य", hindiRoman: "soorya", te: "సూర్యుడు", teRoman: "sooryudu", en: "sun" },
      { hindi: "नेत्र", hindiRoman: "netra", te: "నేత్రం", teRoman: "netram", en: "eye" }
    ]
  },
  {
    title: "Culture & learning",
    items: [
      { hindi: "पुस्तक", hindiRoman: "pustak", te: "పుస్తకం", teRoman: "pustakam", en: "book" },
      { hindi: "संगीत", hindiRoman: "sangeet", te: "సంగీతం", teRoman: "sangeetam", en: "music" },
      { hindi: "कथा", hindiRoman: "katha", te: "కథ", teRoman: "katha", en: "story" },
      { hindi: "भाषा", hindiRoman: "bhaasha", te: "భాష", teRoman: "bhaasha", en: "language" },
      { hindi: "विद्या", hindiRoman: "vidya", te: "విద్య", teRoman: "vidya", en: "education" },
      { hindi: "ज्ञान", hindiRoman: "gyaan", te: "జ్ఞానం", teRoman: "gnaanam", en: "knowledge" },
      { hindi: "धर्म", hindiRoman: "dharm", te: "ధర్మం", teRoman: "dharmam", en: "duty / religion" },
      { hindi: "कर्म", hindiRoman: "karm", te: "కర్మ", teRoman: "karma", en: "deed / karma" }
    ]
  }
];

// Everyday Telangana-Telugu words that are Hindi/Urdu/Persian loans — an even
// bigger shortcut because they're spoken daily in Hyderabad, not just literary.
// The Telangana dialect borrows these far more heavily than coastal Andhra Telugu.
export interface HindiLoan {
  word: string; // shared roman form (roughly identical in both languages)
  hindi: string; // Devanagari
  en: string;
  note?: string;
}

export const HINDI_LOANS: HindiLoan[] = [
  { word: "jaldi", hindi: "जल्दी", en: "quickly / hurry" },
  { word: "khabar", hindi: "ख़बर", en: "news / awareness" },
  { word: "kharchu", hindi: "ख़र्च", en: "expense", note: "Telugu adds -u" },
  { word: "hushaaru", hindi: "हुशियार", en: "careful / alert", note: "Telugu adds -u" },
  { word: "bilkul", hindi: "बिल्कुल", en: "absolutely / exactly" },
  { word: "safaa", hindi: "साफ़", en: "clean" },
  { word: "waapasu", hindi: "वापस", en: "back / return", note: "Telugu adds -u" },
  { word: "zaruur", hindi: "ज़रूर", en: "definitely" },
  { word: "muft", hindi: "मुफ़्त", en: "free (no cost)" },
  { word: "dost", hindi: "दोस्त", en: "friend (casual)" }
];
