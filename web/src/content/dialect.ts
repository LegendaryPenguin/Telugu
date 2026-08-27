// Shared Telangana-dialect steering for every LLM call (Talk + Add-phrase).
//
// Instructions alone don't reliably move a model off "textbook"/coastal-Andhra
// Telugu — the strongest lever is FEW-SHOT CONTRAST: show standard vs Telangana
// side by side so the model locks onto the target register. These are hallmark
// Telangana spoken features (2nd-person -āvu → -av, ēmi → ēṁ, elā → eṭla,
// kadā → gadā, vastunnānu → vastunna).
//
// NOTE: authored draft — pending review by a native Telangana speaker.

// Reusable rule block describing the target register.
export const TELANGANA_RULES = [
  "Speak natural, casual, SPOKEN Telangana (Hyderabadi) Telugu — not textbook/coastal Telugu.",
  "Telangana hallmarks to use: ఎట్ల (etla, not ఎలా), 2nd-person endings -వ్/-వా (unnav/tinnava, not unnaavu/tinnaavaa),",
  "ఏం (em, not ఏమి), గదా (gada, not kada), 1st-person -వస్తున్న (vastunna, not vastunnaanu), fillers like 'iga','emo','le'.",
  "Light natural Tenglish (Telugu–English code-switching) is welcome, like real Hyderabad texting.",
  "The learner CANNOT read Telugu script, so ALWAYS give clean romanization."
].join("\n");

// Standard → Telangana contrast pairs used as few-shot grounding. Kept short so
// they cost little in the prompt but strongly bias the register.
export const TELANGANA_EXAMPLES: { en: string; standard: string; telangana: string }[] = [
  { en: "How are you?", standard: "ఎలా ఉన్నావు? (elaa unnaavu)", telangana: "ఎట్లున్నవ్? (etlunnav)" },
  { en: "What are you doing?", standard: "ఏమి చేస్తున్నావు? (emi chestunnaavu)", telangana: "ఏం చేస్తున్నవ్? (em chestunnav)" },
  { en: "Where are you?", standard: "ఎక్కడ ఉన్నావు? (ekkada unnaavu)", telangana: "ఎక్కడున్నవ్? (ekkadunnav)" },
  { en: "Did you eat?", standard: "తిన్నావా? (tinnaavaa)", telangana: "తిన్నవా? (tinnava)" },
  { en: "I'm coming", standard: "నేను వస్తున్నాను (nenu vastunnaanu)", telangana: "నేను వస్తున్న (nenu vastunna)" },
  { en: "You're coming, right?", standard: "వస్తున్నావు కదా? (vastunnaavu kadaa)", telangana: "వస్తున్నవ్ గదా? (vastunnav gada)" }
];

// Renders the few-shot block for a system prompt.
export function telanganaFewShot(): string {
  const lines = TELANGANA_EXAMPLES.map(
    (e) => `  • "${e.en}"  →  standard: ${e.standard}  |  TELANGANA (use this style): ${e.telangana}`
  );
  return ["Match the Telangana column, never the standard column:", ...lines].join("\n");
}

// One block both features prepend to their task-specific instructions.
export function telanganaStyleGuide(): string {
  return [TELANGANA_RULES, "", telanganaFewShot()].join("\n");
}
