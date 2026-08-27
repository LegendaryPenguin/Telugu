// Curated external resources + a method for using cinema to learn.
// Links are populated ONLY from verified research (no invented URLs).

export interface Resource {
  title: string;
  url: string;
  kind: "youtube" | "dictionary" | "tool" | "watch" | "music" | "list";
  level?: "beginner" | "intermediate" | "advanced";
  why: string;
}

export interface ResourceGroup {
  id: string;
  title: string;
  items: Resource[];
}

// The step-by-step path from "talk with her" toward "watch cinema and learn".
export const CINEMA_LADDER: { step: string; detail: string }[] = [
  {
    step: "1 · Get conversational first",
    detail: "Everyday speaking (what this app drills) is the foundation — film language sits on top of it."
  },
  {
    step: "2 · Passive ear-training daily",
    detail: "Put on Telugu songs, vlogs, or interviews in the background. Don't chase meaning — just soak up the rhythm and sounds."
  },
  {
    step: "3 · Watch dialogue-driven films with English subs",
    detail: "Start with everyday-life stories (not heavy literary/period films). Read the subs, enjoy the story."
  },
  {
    step: "4 · Rewatch a scene, ears first",
    detail: "Watch a short scene again and try to catch words you already know before glancing at the subtitle."
  },
  {
    step: "5 · Mine lines you loved",
    detail: "Paste a line that grabbed you into Add → “Break down a subtitle”. Save the good ones to your phrasebook."
  },
  {
    step: "6 · Fade the subtitles",
    detail: "On a film you know well, switch to Telugu subs, then none. Comfort here means you've arrived."
  }
];

// Verified links, grouped. URLs were checked by a research pass (Aug 2026);
// a couple are flagged in their notes where they couldn't be fully loaded.
// Streaming availability is India-region — outside India, check JustWatch local.
export const RESOURCES: ResourceGroup[] = [
  {
    id: "hindi",
    title: "Learn Telugu through Hindi (your shortcut)",
    items: [
      {
        title: "Dr. Deepa Gupta — Learn Telugu through Hindi (YouTube)",
        url: "https://www.youtube.com/@DrDeepaGupta",
        kind: "youtube",
        level: "beginner",
        why: "Explicit Hindi-medium Telugu series. Start: 'Basic Telugu for beginners' and 'All Questions'."
      },
      {
        title: "Vemuri Murty — Hindi to Telugu Spoken Classes (YouTube)",
        url: "https://www.youtube.com/@vemurimurtyhinditoteluguspoken",
        kind: "youtube",
        level: "beginner",
        why: "Literally 'Hindi to Telugu spoken classes' — closest match to your exact bilingual setup."
      },
      {
        title: "Nagmani — 7-hour Telugu Spoken course (Hindi)",
        url: "https://youtu.be/DolRH0ct2OI",
        kind: "youtube",
        level: "beginner",
        why: "Hindi-titled full spoken-Telugu crash course in one sitting. Good for a weekend binge."
      },
      {
        title: "Learn Telugu in 30 Days Through Hindi (book)",
        url: "https://www.amazon.in/dp/935964207X",
        kind: "list",
        level: "beginner",
        why: "The classic '30 Days Through Hindi' phrasebook — day-by-day sentence patterns, Devanagari + romanized."
      },
      {
        title: "Learn Telugu Through Hindi — Diamond Pocket (with YouTube AV)",
        url: "https://www.amazon.in/dp/9350570769",
        kind: "list",
        level: "beginner",
        why: "Dedicated Hindi-medium course paired with companion YouTube audio-video."
      },
      {
        title: "Learn Telugu From Hindi (Android app)",
        url: "https://play.google.com/store/apps/details?id=com.devstudios.learntelugufromhindi",
        kind: "tool",
        level: "beginner",
        why: "Phone-friendly Hindi→Telugu word/phrase drills. Nice for waiting rooms."
      }
    ]
  },
  {
    id: "start",
    title: "Start here — spoken Telugu",
    items: [
      {
        title: "50languages — Telugu (free, 100 lessons)",
        url: "https://www.50languages.com/telugu-for-free",
        kind: "list",
        level: "beginner",
        why: "Practical phrases with audio you can download. Pairs with the Anki deck below (same source)."
      },
      {
        title: "Learn 50 languages — Telugu course (YouTube)",
        url: "https://www.youtube.com/@learn50languages86",
        kind: "youtube",
        level: "beginner",
        why: "Structured 'Learn Telugu in 100 Lessons', English → Telugu, no prior knowledge needed."
      },
      {
        title: "Learn Telugu with Hari (YouTube)",
        url: "https://www.youtube.com/@LearnTeluguwithHari",
        kind: "youtube",
        level: "beginner",
        why: "Beginner spoken-Telugu class-style lessons. Dedicated 'teach English speakers' channels are rare — this is a solid one."
      }
    ]
  },
  {
    id: "telangana",
    title: "Telangana dialect specifically",
    items: [
      {
        title: "Reelang — Telugu (filter: Hyderabad/Telangana)",
        url: "https://reelang.com/comprehensible-input-videos-in-telugu",
        kind: "youtube",
        level: "beginner",
        why: "Best verified Telangana resource: real native speech, tags dialect/region, and lets you pick 'Slow & Clear' vs 'Fast Natural'."
      },
      {
        title: "Davidsbeenhere — Telugu in Hyderabad",
        url: "https://www.youtube.com/watch?v=ap15enUob6Q",
        kind: "youtube",
        level: "beginner",
        why: "Travel-vlog phrase primer filmed in Hyderabad. Cultural intro, not a course."
      },
      {
        title: "Andhra vs Telangana word choices (skit)",
        url: "https://www.youtube.com/watch?v=-6gqPeNYLuA",
        kind: "youtube",
        level: "beginner",
        why: "Short skit contrasting Telangana vs Andhra everyday words. Fun, small creator — entertainment, not structured teaching."
      }
    ]
  },
  {
    id: "listening",
    title: "Graded listening (comprehensible input)",
    items: [
      {
        title: "Reelang — Telugu (A1→C1, graded)",
        url: "https://reelang.com/comprehensible-input-videos-in-telugu",
        kind: "youtube",
        level: "beginner",
        why: "CEFR-graded native speech with a separate slow/natural/fast axis. The best fit for 'understand slightly above your level' listening."
      },
      {
        title: "Listen & Learn Telugu (YouTube)",
        url: "https://www.youtube.com/@listenandlearn_telugu",
        kind: "youtube",
        level: "beginner",
        why: "Short simple Telugu stories for beginners. (Channel confirmed; video depth couldn't be fully loaded — give it a quick look.)"
      }
    ]
  },
  {
    id: "movies",
    title: "Movies for learners (with English subs)",
    items: [
      {
        title: "Fidaa (2017)",
        url: "https://www.justwatch.com/in/movie/fidaa",
        kind: "watch",
        level: "intermediate",
        why: "Dialogue-driven rural romance — the heroine speaks Telangana dialect (that's what it's famous for). Ideal for your goal."
      },
      {
        title: "Balagam (2023)",
        url: "https://www.justwatch.com/in/movie/balagam",
        kind: "watch",
        level: "intermediate",
        why: "Rural Telangana family drama with authentic heavy Telangana dialect. Slice-of-life, great listening once conversational."
      },
      {
        title: "Pelli Choopulu (2016)",
        url: "https://www.justwatch.com/in/movie/pellichoopulu",
        kind: "watch",
        level: "beginner",
        why: "Everyday millennial rom-com, natural conversational (urban Hyderabad) Telugu. Easier entry point."
      },
      {
        title: "Middle Class Melodies (2020)",
        url: "https://www.justwatch.com/in/movie/middle-class-melodies",
        kind: "watch",
        level: "beginner",
        why: "Small-town comedy with simple day-to-day dialogue. Note: coastal Andhra dialect, not Telangana."
      }
    ]
  },
  {
    id: "tools",
    title: "Dictionaries & tools",
    items: [
      {
        title: "Glosbe English–Telugu dictionary",
        url: "https://glosbe.com/en/te",
        kind: "dictionary",
        why: "Translations with real example sentences + audio. Good first lookup."
      },
      {
        title: "Aksharamukha — script ⇄ romanization",
        url: "https://aksharamukha.appspot.com/converter",
        kind: "tool",
        why: "Convert Telugu script to Latin romanization (and back) for anything you can't read yet."
      },
      {
        title: "Anki deck — Telugu vocabulary (audio + images)",
        url: "https://ankiweb.net/shared/info/764618731",
        kind: "tool",
        level: "beginner",
        why: "1,946 cards with audio and pictures (from 50languages). A companion phrases/sentences deck also exists."
      },
      {
        title: "Brown's Telugu–English Dictionary (U. Chicago)",
        url: "https://dsal.uchicago.edu/dictionaries/brown/",
        kind: "dictionary",
        level: "advanced",
        why: "Scholarly, searchable — for deeper or literary lookups later on."
      }
    ]
  },
  {
    id: "music",
    title: "Music with lyrics + translation",
    items: [
      {
        title: "Paatly — Telugu lyrics & English translations",
        url: "https://paatly.com",
        kind: "music",
        level: "beginner",
        why: "Songs with English translations and credits. Good for sing-along + meaning once you know a few words."
      }
    ]
  }
];
